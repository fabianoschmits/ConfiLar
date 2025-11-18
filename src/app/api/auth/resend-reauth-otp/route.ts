import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * POST /api/auth/resend-reauth-otp
 * 
 * Envia um código OTP numérico para reautenticação usando signInWithOtp
 * 
 * IMPORTANTE: Para enviar código OTP numérico (não magic link), o template de email
 * "Magic Link" no Supabase Dashboard precisa incluir {{ .Token }} em vez do link.
 * 
 * Configuração necessária no Supabase Dashboard:
 * 1. Vá em Authentication > Email Templates > Magic Link
 * 2. Modifique o template para incluir: "Seu código de verificação: {{ .Token }}"
 * 3. Remova ou substitua o link pelo código
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação do usuário
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.delete(name)
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Usar signInWithOtp para enviar código OTP
    // IMPORTANTE: Para enviar código OTP numérico em vez de magic link,
    // o template de email "Magic Link" no Supabase Dashboard precisa incluir {{ .Token }}
    // em vez do link. Exemplo: "Seu código de verificação: {{ .Token }}"
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: user.email,
      options: {
        shouldCreateUser: false, // Não criar novo usuário, apenas enviar OTP
        emailRedirectTo: undefined // Não redirecionar, apenas enviar código
      }
    })

    if (otpError) {
      console.error('❌ Erro ao enviar código OTP:', otpError)
      return NextResponse.json(
        { error: otpError.message || 'Erro ao enviar código de verificação' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Código de verificação enviado com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro ao processar solicitação de reautenticação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

