// Supabase Edge Function para envio de emails de notificação
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationEmail {
  to: string;
  subject: string;
  template: 'message' | 'review' | 'system' | 'achievement' | 'referral' | 'booking';
  data: {
    userName?: string;
    senderName?: string;
    reviewRating?: number;
    reviewComment?: string;
    conversationId?: string;
    recipientId?: string;
    message?: string;
    actionUrl?: string;
    [key: string]: any;
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, template, data }: NotificationEmail = await req.json();

    if (!to || !subject || !template) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, template' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Para mensagens, verificar se pode enviar email (controle de frequência)
    if (template === 'message' && data.conversationId && data.recipientId) {
      const canSend = await checkEmailFrequency(
        data.recipientId, 
        data.conversationId, 
        'message'
      );
      
      if (!canSend) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Email not sent due to frequency control',
            template,
            to 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Gerar conteúdo do email baseado no template
    const emailContent = generateEmailContent(template, data, subject);

    // Enviar email usando Resend
    const emailResponse = await sendEmail({
      to,
      subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    // Para mensagens, atualizar controle de frequência
    if (template === 'message' && data.conversationId && data.recipientId) {
      await updateEmailFrequency(data.recipientId, data.conversationId, 'message');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.id,
        template,
        to 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error sending notification email:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/**
 * Gera o conteúdo do email baseado no template
 */
function generateEmailContent(template: string, data: any, subject: string) {
  const baseUrl = 'https://confilar.vercel.app';
  const userName = data.userName || 'Usuário';
  const senderName = data.senderName || 'ConfiLar';
  
  switch (template) {
    case 'message':
      return {
        html: `
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nova Mensagem - ConfiLar</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
              .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
              .content { background: #f9fafb; padding: 40px 30px; border-radius: 0 0 12px 12px; }
              .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
              .message-box { background: white; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0; border-radius: 8px; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💬 Nova Mensagem</h1>
                <p>ConfiLar - Conectando você aos melhores profissionais</p>
              </div>
              <div class="content">
                <h2>Olá ${userName}!</h2>
                <p>Você recebeu uma nova mensagem no ConfiLar:</p>
                
                <div class="message-box">
                  <strong>De:</strong> ${senderName}<br>
                  ${data.message ? `<strong>Mensagem:</strong> ${data.message.substring(0, 100)}${data.message.length > 100 ? '...' : ''}<br>` : ''}
                  <strong>Status:</strong> Nova(s) mensagem(ns) recebida(s)
                </div>
                
                <p>Entre no ConfiLar para ver e responder às mensagens!</p>
                
                <div style="text-align: center;">
                  <a href="${data.actionUrl || baseUrl}" class="button">🚀 Entrar no ConfiLar</a>
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
                  Este email foi enviado automaticamente. Para parar de receber notificações, 
                  <a href="${baseUrl}/configuracoes">clique aqui</a>.
                </p>
              </div>
              <div class="footer">
                <p><strong>ConfiLar</strong> - Conectando você aos melhores profissionais</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Nova Mensagem - ConfiLar

Olá ${userName}!

Você recebeu uma nova mensagem no ConfiLar:

De: ${senderName}
${data.message ? `Mensagem: ${data.message.substring(0, 200)}` : ''}

Entre no ConfiLar para ver e responder às mensagens!

Acessar: ${data.actionUrl || baseUrl}

---
ConfiLar - Conectando você aos melhores profissionais
        `
      };

    case 'review':
      const stars = '★'.repeat(data.reviewRating || 5) + '☆'.repeat(5 - (data.reviewRating || 5));
      return {
        html: `
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nova Avaliação - ConfiLar</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
              .content { background: #f9fafb; padding: 40px 30px; border-radius: 0 0 12px 12px; }
              .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
              .review-box { background: white; padding: 30px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 8px; text-align: center; }
              .stars { color: #f59e0b; font-size: 28px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⭐ Nova Avaliação</h1>
                <p>ConfiLar - Conectando você aos melhores profissionais</p>
              </div>
              <div class="content">
                <h2>Olá ${userName}!</h2>
                <p>Você recebeu uma nova avaliação:</p>
                
                <div class="review-box">
                  <div class="stars">${stars}</div>
                  <strong>Avaliação:</strong> ${data.reviewRating || 5}/5 estrelas<br><br>
                  ${data.reviewComment ? `<strong>Comentário:</strong><br>${data.reviewComment}<br><br>` : ''}
                  <strong>De:</strong> ${senderName}
                </div>
                
                <p>Obrigado pelo excelente trabalho!</p>
                
                <div style="text-align: center;">
                  <a href="${data.actionUrl || baseUrl + '/avaliacoes'}" class="button">⭐ Ver Avaliação</a>
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
                  Este email foi enviado automaticamente. Para parar de receber notificações, 
                  <a href="${baseUrl}/configuracoes">clique aqui</a>.
                </p>
              </div>
              <div class="footer">
                <p><strong>ConfiLar</strong> - Conectando você aos melhores profissionais</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Nova Avaliação - ConfiLar

Olá ${userName}!

Você recebeu uma nova avaliação:

Avaliação: ${data.reviewRating || 5}/5 estrelas
${data.reviewComment ? `Comentário: ${data.reviewComment}` : ''}
De: ${senderName}

Obrigado pelo excelente trabalho!

Ver avaliação: ${data.actionUrl || baseUrl + '/avaliacoes'}

---
ConfiLar - Conectando você aos melhores profissionais
        `
      };

    default:
      // Template genérico para outros tipos
      return {
        html: `
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject} - ConfiLar</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
              .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
              .content { background: #f9fafb; padding: 40px 30px; border-radius: 0 0 12px 12px; }
              .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔔 Notificação</h1>
                <p>ConfiLar - Conectando você aos melhores profissionais</p>
              </div>
              <div class="content">
                <h2>Olá ${userName}!</h2>
                <p>${subject}</p>
                ${data.message ? `<p>${data.message}</p>` : ''}
                ${data.actionUrl ? `
                <div style="text-align: center;">
                  <a href="${data.actionUrl}" class="button">Ver Detalhes</a>
                </div>
                ` : ''}
                <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
                  Este email foi enviado automaticamente. Para parar de receber notificações, 
                  <a href="${baseUrl}/configuracoes">clique aqui</a>.
                </p>
              </div>
              <div class="footer">
                <p><strong>ConfiLar</strong> - Conectando você aos melhores profissionais</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
${subject} - ConfiLar

Olá ${userName}!

${data.message || subject}

${data.actionUrl ? `Ver detalhes: ${data.actionUrl}` : ''}

---
ConfiLar - Conectando você aos melhores profissionais
        `
      };
  }
}

/**
 * Envia email usando Resend API
 */
async function sendEmail({ to, subject, html, text }: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY não configurada. Configure no Supabase Dashboard: Settings > Secrets');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'ConfiLar <noreply@confilar.com.br>',
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Failed to send email: ${response.status} - ${errorData.message || response.statusText}`);
  }

  return await response.json();
}

/**
 * Verifica se pode enviar email (controle de frequência)
 */
async function checkEmailFrequency(
  userId: string, 
  conversationId: string, 
  notificationType: string,
  delayMinutes: number = 5
): Promise<boolean> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/can_send_email_notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        p_user_id: userId,
        p_conversation_id: conversationId,
        p_notification_type: notificationType,
        p_delay_minutes: delayMinutes
      })
    });

    if (!response.ok) {
      console.error('Error checking email frequency:', response.statusText);
      return true; // Em caso de erro, permitir envio
    }

    const result = await response.json();
    return result === true;
  } catch (error) {
    console.error('Error in checkEmailFrequency:', error);
    return true; // Em caso de erro, permitir envio
  }
}

/**
 * Atualiza controle de frequência de emails
 */
async function updateEmailFrequency(
  userId: string, 
  conversationId: string, 
  notificationType: string
): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/update_email_notification_control`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        p_user_id: userId,
        p_conversation_id: conversationId,
        p_notification_type: notificationType
      })
    });

    if (!response.ok) {
      console.error('Error updating email frequency:', response.statusText);
    }
  } catch (error) {
    console.error('Error in updateEmailFrequency:', error);
  }
}

