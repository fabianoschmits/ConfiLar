// Supabase Edge Function para envio de emails de notificação
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmail {
  to: string;
  subject: string;
  template:
    | "message"
    | "review"
    | "system"
    | "achievement"
    | "referral"
    | "booking";
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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log(`📥 Requisição recebida: ${req.method} ${req.url}`);

  // Verificar se o método é POST
  if (req.method !== "POST") {
    console.warn(`⚠️ Método não permitido: ${req.method}`);
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    // Verificar se há conteúdo no body antes de fazer parse
    const contentType = req.headers.get("content-type");
    console.log(`📋 Content-Type: ${contentType}`);

    if (!contentType || !contentType.includes("application/json")) {
      console.warn(`⚠️ Content-Type inválido: ${contentType}`);
      return new Response(
        JSON.stringify({ error: "Content-Type must be application/json" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Ler o body como texto primeiro para validar
    const bodyText = await req.text();
    console.log(
      `📝 Body recebido (${bodyText.length} caracteres):`,
      bodyText.substring(0, 200),
    );

    if (!bodyText || bodyText.trim() === "") {
      console.error("❌ Body vazio ou sem conteúdo");
      return new Response(JSON.stringify({ error: "Request body is empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fazer parse do JSON
    let requestData: NotificationEmail;
    try {
      requestData = JSON.parse(bodyText);
    } catch (parseError: any) {
      console.error("❌ Erro ao fazer parse do JSON:", parseError.message);
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request body",
          details: parseError.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { to, subject, template, data } = requestData;

    if (!to || !subject || !template) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: to, subject, template",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validar email do destinatário
    if (!to || !to.includes("@")) {
      console.error(`❌ Email inválido: ${to}`);
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gerar conteúdo do email baseado no template
    let emailContent;
    try {
      emailContent = generateEmailContent(template, data, subject);
    } catch (templateError: any) {
      console.error("❌ Erro ao gerar conteúdo do email:", templateError);
      return new Response(
        JSON.stringify({
          error: "Failed to generate email content",
          details: templateError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
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
      console.error("❌ Erro ao enviar email:", emailError);

      // Se for erro de API key não configurada, retornar 503 (Service Unavailable)
      if (emailError.message?.includes("RESEND_API_KEY não configurada")) {
        return new Response(
          JSON.stringify({
            error: "Email service not configured",
            message:
              "RESEND_API_KEY não está configurada. Configure no Supabase Dashboard.",
            details: emailError.message,
          }),
          {
            status: 503,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Outros erros de envio
      return new Response(
        JSON.stringify({
          error: "Failed to send email",
          message: emailError.message || "Erro desconhecido ao enviar email",
          details: emailError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: emailResponse.id,
        template,
        to,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error(
      "❌ Erro inesperado ao processar email de notificação:",
      error,
    );
    const errorMessage = error.message || "Erro desconhecido ao enviar email";

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: errorMessage,
        details: error.stack ? error.stack.substring(0, 500) : errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

/**
 * Gera o conteúdo do email baseado no template
 */
function generateEmailContent(template: string, data: any, subject: string) {
  const baseUrl = "https://confilar.vercel.app";
  const userName = data.userName || "Usuário";
  const senderName = data.senderName || "ConfiLar";

  switch (template) {
    case "message":
      return {
        html: `
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nova Mensagem - ConfiLar</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
              body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #f1f5f9; color: #1e293b; }
              .wrapper { width: 100%; background-color: #f1f5f9; padding-bottom: 40px; }
              .main { margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; }
              .header { padding: 40px 0 20px 0; text-align: center; }
              .logo { width: 180px; height: auto; }
              .card { background-color: #ffffff; border-radius: 16px; padding: 48px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
              .title { font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px; text-align: center; }
              .text { font-size: 16px; line-height: 24px; color: #475569; margin-bottom: 32px; text-align: center; }
              .message-box { background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #e2e8f0; font-style: italic; color: #334155; text-align: center; }
              .button-wrapper { text-align: center; margin-bottom: 16px; }
              .button { background-color: #00b0b0; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; display: inline-block; }
              .footer { text-align: center; padding: 20px 32px; font-size: 13px; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="wrapper">
              <center>
                <table class="main">
                  <tr><td class="header"><img src="https://img.lightshot.app/jUaAq4CZS-myxiHUiOLMiA.png" alt="ConfiLar" class="logo"></td></tr>
                  <tr>
                    <td>
                      <div class="card">
                        <h1 class="title">Você recebeu uma mensagem</h1>
                        <p class="text">Olá <strong>${userName}</strong>! 👋<br><br>Você recebeu uma nova mensagem de <strong>${senderName}</strong> no ConfiLar.</p>
                        ${data.message ? `<div class="message-box">"${data.message.substring(0, 200)}${data.message.length > 200 ? "..." : ""}"</div>` : ""}
                        <div class="button-wrapper">
                          <a href="${data.actionUrl || baseUrl + "/chat"}" class="button">Responder Agora</a>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr><td class="footer"><p><strong>ConfiLar</strong> — Tecnologia a serviço da sua casa.</p></td></tr>
                </table>
              </center>
            </div>
          </body>
          </html>
        `,
        text: `
Nova Mensagem - ConfiLar

Olá ${userName}!

Você recebeu uma nova mensagem no ConfiLar:

De: ${senderName}
${data.message ? `Mensagem: ${data.message.substring(0, 200)}` : ""}

Entre no ConfiLar para ver e responder às mensagens!

Acessar: ${data.actionUrl || baseUrl}

---
ConfiLar - Conectando você aos melhores profissionais
        `,
      };

    case "review":
      const stars = "⭐".repeat(data.reviewRating || 5);
      return {
        html: `
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nova Recomendação - ConfiLar</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
              body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #f1f5f9; color: #1e293b; }
              .wrapper { width: 100%; background-color: #f1f5f9; padding-bottom: 40px; }
              .main { margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; }
              .header { padding: 40px 0 20px 0; text-align: center; }
              .logo { width: 180px; height: auto; }
              .card { background-color: #ffffff; border-radius: 16px; padding: 48px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
              .title { font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px; text-align: center; }
              .text { font-size: 16px; line-height: 24px; color: #475569; margin-bottom: 32px; text-align: center; }
              .recommendation-card { background: linear-gradient(135deg, #00b0b0 0%, #008a8a 100%); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 32px; color: #ffffff; }
              .stars { font-size: 24px; margin-bottom: 12px; }
              .rec-text { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
              .rec-subtext { font-size: 14px; opacity: 0.9; }
              .button-wrapper { text-align: center; margin-bottom: 16px; }
              .button { background-color: #ffffff; color: #00b0b0 !important; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; display: inline-block; }
              .footer { text-align: center; padding: 20px 32px; font-size: 13px; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="wrapper">
              <center>
                <table class="main">
                  <tr><td class="header"><img src="https://img.lightshot.app/jUaAq4CZS-myxiHUiOLMiA.png" alt="ConfiLar" class="logo"></td></tr>
                  <tr>
                    <td>
                      <div class="card">
                        <h1 class="title">Parabéns! Nova avaliação</h1>
                        <p class="text">Olá <strong>${userName}</strong>! 👋<br><br>Seu excelente trabalho está sendo reconhecido! Você recebeu uma nova recomendação de <strong>${senderName}</strong> no ConfiLar.</p>
                        <div class="recommendation-card">
                          <div class="stars">${stars}</div>
                          <div class="rec-text">Avaliação ${data.reviewRating || 5} Estrelas</div>
                          <div class="rec-subtext">"${data.reviewComment || "O cliente não deixou um comentário, mas avaliou seu serviço!"}"</div>
                          <div class="button-wrapper" style="margin-top: 24px; margin-bottom: 0;">
                            <a href="${data.actionUrl || baseUrl + "/perfil"}" class="button">Ver no Perfil</a>
                          </div>
                        </div>
                        <p class="text" style="font-size: 14px; margin-bottom: 0;">Continue assim! Profissionais bem avaliados têm 3x mais chances de fechar novos serviços.</p>
                      </div>
                    </td>
                  </tr>
                  <tr><td class="footer"><p><strong>ConfiLar</strong> — Valorizando quem faz bem feito.</p></td></tr>
                </table>
              </center>
            </div>
          </body>
          </html>
        `,
        text: `
Nova Avaliação - ConfiLar

Olá ${userName}!

Você recebeu uma nova avaliação:

Avaliação: ${data.reviewRating || 5}/5 estrelas
${data.reviewComment ? `Comentário: ${data.reviewComment}` : ""}
De: ${senderName}

Obrigado pelo excelente trabalho!

Ver avaliação: ${data.actionUrl || baseUrl + "/avaliacoes"}

---
ConfiLar - Conectando você aos melhores profissionais
        `,
      };

    default:
      return {
        html: `
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject} - ConfiLar</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
              body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #f1f5f9; color: #1e293b; }
              .wrapper { width: 100%; background-color: #f1f5f9; padding-bottom: 40px; }
              .main { margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; }
              .header { padding: 40px 0 20px 0; text-align: center; }
              .logo { width: 180px; height: auto; }
              .card { background-color: #ffffff; border-radius: 16px; padding: 48px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
              .title { font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px; text-align: center; }
              .text { font-size: 16px; line-height: 24px; color: #475569; margin-bottom: 32px; text-align: center; }
              .button-wrapper { text-align: center; margin-bottom: 16px; }
              .button { background-color: #00b0b0; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; display: inline-block; }
              .footer { text-align: center; padding: 20px 32px; font-size: 13px; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="wrapper">
              <center>
                <table class="main">
                  <tr><td class="header"><img src="https://img.lightshot.app/jUaAq4CZS-myxiHUiOLMiA.png" alt="ConfiLar" class="logo"></td></tr>
                  <tr>
                    <td>
                      <div class="card">
                        <h1 class="title">${subject}</h1>
                        <p class="text">Olá <strong>${userName}</strong>! 👋<br><br>${data.message || "Você tem uma nova atualização no ConfiLar."}</p>
                        ${
                          data.actionUrl
                            ? `
                        <div class="button-wrapper">
                          <a href="${data.actionUrl}" class="button">Ver Detalhes</a>
                        </div>
                        `
                            : ""
                        }
                      </div>
                    </td>
                  </tr>
                  <tr><td class="footer"><p><strong>ConfiLar</strong> — Tecnologia a serviço da sua casa.</p></td></tr>
                </table>
              </center>
            </div>
          </body>
          </html>
        `,
        text: `
${subject} - ConfiLar

Olá ${userName}!

${data.message || subject}

${data.actionUrl ? `Ver detalhes: ${data.actionUrl}` : ""}

---
ConfiLar - Conectando você aos melhores profissionais
        `,
      };
  }
}

/**
 * Envia email usando Resend API
 */
async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  // Verificar se a API key está configurada
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey || resendApiKey.trim() === "") {
    console.error("❌ RESEND_API_KEY não configurada ou está vazia");
    throw new Error(
      "RESEND_API_KEY não configurada. Configure no Supabase Dashboard: Settings > Edge Functions > Secrets",
    );
  }

  console.log(`📧 Tentando enviar email para: ${to}`);
  console.log(`📧 Subject: ${subject}`);
  console.log(`📧 Template HTML length: ${html.length} caracteres`);
  console.log(`📧 Template text length: ${text.length} caracteres`);

  try {
    const emailPayload = {
      from: "ConfiLar <noreply@appconfilar.com.br>", // Domínio verificado do Resend
      to: [to],
      subject,
      html,
      text,
    };

    console.log(`📤 Payload preparado, enviando para Resend API...`);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    console.log(
      `📥 Resposta recebida: ${response.status} ${response.statusText}`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Resposta de erro do Resend:`, errorText);

      let errorData: any = {};

      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || "Unknown error" };
      }

      const errorMessage =
        errorData.message || errorData.error || response.statusText;
      console.error(
        `❌ Erro ao enviar email (${response.status}):`,
        errorMessage,
      );
      throw new Error(
        `Failed to send email: ${response.status} - ${errorMessage}`,
      );
    }

    const result = await response.json();
    console.log(`✅ Email enviado com sucesso: ${result.id}`);
    return result;
  } catch (error: any) {
    // Se já é um erro que lançamos, apenas re-lançar
    if (
      error.message?.includes("RESEND_API_KEY") ||
      error.message?.includes("Failed to send email")
    ) {
      throw error;
    }

    // Outros erros de rede ou parsing
    console.error("❌ Erro na requisição ao Resend:", error.message);
    throw new Error(`Network or parsing error: ${error.message}`);
  }
}
