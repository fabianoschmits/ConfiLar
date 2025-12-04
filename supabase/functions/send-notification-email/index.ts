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

  console.log(`📥 Requisição recebida: ${req.method} ${req.url}`);

  // Verificar se o método é POST
  if (req.method !== 'POST') {
    console.warn(`⚠️ Método não permitido: ${req.method}`);
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Verificar se há conteúdo no body antes de fazer parse
    const contentType = req.headers.get('content-type');
    console.log(`📋 Content-Type: ${contentType}`);
    
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`⚠️ Content-Type inválido: ${contentType}`);
      return new Response(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Ler o body como texto primeiro para validar
    const bodyText = await req.text();
    console.log(`📝 Body recebido (${bodyText.length} caracteres):`, bodyText.substring(0, 200));
    
    if (!bodyText || bodyText.trim() === '') {
      console.error('❌ Body vazio ou sem conteúdo');
      return new Response(
        JSON.stringify({ error: 'Request body is empty' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fazer parse do JSON
    let requestData: NotificationEmail;
    try {
      requestData = JSON.parse(bodyText);
    } catch (parseError: any) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError.message);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: parseError.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { to, subject, template, data } = requestData;

    if (!to || !subject || !template) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, template' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validar email do destinatário
    if (!to || !to.includes('@')) {
      console.error(`❌ Email inválido: ${to}`);
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Gerar conteúdo do email baseado no template
    let emailContent;
    try {
      emailContent = generateEmailContent(template, data, subject);
    } catch (templateError: any) {
      console.error('❌ Erro ao gerar conteúdo do email:', templateError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate email content',
          details: templateError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Enviar email usando Resend
    let emailResponse;
    try {
      emailResponse = await sendEmail({
        to,
        subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    } catch (emailError: any) {
      console.error('❌ Erro ao enviar email:', emailError);
      
      // Se for erro de API key não configurada, retornar 503 (Service Unavailable)
      if (emailError.message?.includes('RESEND_API_KEY não configurada')) {
        return new Response(
          JSON.stringify({ 
            error: 'Email service not configured',
            message: 'RESEND_API_KEY não está configurada. Configure no Supabase Dashboard.',
            details: emailError.message
          }),
          { 
            status: 503, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Outros erros de envio
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email',
          message: emailError.message || 'Erro desconhecido ao enviar email',
          details: emailError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
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
    console.error('❌ Erro inesperado ao processar email de notificação:', error);
    const errorMessage = error.message || 'Erro desconhecido ao enviar email';
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: errorMessage,
        details: error.stack ? error.stack.substring(0, 500) : errorMessage
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
  // Verificar se a API key está configurada
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey || resendApiKey.trim() === '') {
    console.error('❌ RESEND_API_KEY não configurada ou está vazia');
    throw new Error('RESEND_API_KEY não configurada. Configure no Supabase Dashboard: Settings > Edge Functions > Secrets');
  }

  console.log(`📧 Tentando enviar email para: ${to}`);
  console.log(`📧 Subject: ${subject}`);
  console.log(`📧 Template HTML length: ${html.length} caracteres`);
  console.log(`📧 Template text length: ${text.length} caracteres`);

  try {
    const emailPayload = {
      from: 'ConfiLar <noreply@appconfilar.com.br>', // Domínio verificado do Resend
      to: [to],
      subject,
      html,
      text,
    };

    console.log(`📤 Payload preparado, enviando para Resend API...`);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    console.log(`📥 Resposta recebida: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Resposta de erro do Resend:`, errorText);
      
      let errorData: any = {};
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || 'Unknown error' };
      }

      const errorMessage = errorData.message || errorData.error || response.statusText;
      console.error(`❌ Erro ao enviar email (${response.status}):`, errorMessage);
      throw new Error(`Failed to send email: ${response.status} - ${errorMessage}`);
    }

    const result = await response.json();
    console.log(`✅ Email enviado com sucesso: ${result.id}`);
    return result;
  } catch (error: any) {
    // Se já é um erro que lançamos, apenas re-lançar
    if (error.message?.includes('RESEND_API_KEY') || error.message?.includes('Failed to send email')) {
      throw error;
    }
    
    // Outros erros de rede ou parsing
    console.error('❌ Erro na requisição ao Resend:', error.message);
    throw new Error(`Network or parsing error: ${error.message}`);
  }
}

