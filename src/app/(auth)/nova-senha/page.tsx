'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'

export default function NovaSenhaPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Verificar se o usuário está autenticado (após clicar no link do email)
  useEffect(() => {
    setMounted(true)
    const checkUser = async () => {
      // Verificar sessão atual em vez de getUser()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        toast.error('Link inválido ou expirado')
        router.push('/auth')
      }
    }
    checkUser()
  }, [supabase.auth, router])

  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    }
    
    const score = Object.values(checks).filter(Boolean).length
    return { checks, score, isStrong: score === 5 }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    const strength = checkPasswordStrength(password)
    if (!strength.isStrong) {
      toast.error('A senha deve atender a todos os critérios de segurança')
      return
    }

    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        toast.error(`Erro ao atualizar senha: ${error.message}`)
        return
      }

      setSuccess(true)
      toast.success('Senha atualizada com sucesso!')
    } catch (error) {
      console.error('Erro na atualização:', error)
      toast.error('Erro inesperado ao atualizar senha')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Senha Atualizada!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sua senha foi alterada com sucesso. Agora você pode fazer login com a nova senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mounted ? (
              <Button
                onClick={() => router.push('/auth')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                Ir para o Login
              </Button>
            ) : (
              <div className="w-full bg-gray-300 text-gray-600 py-3 text-center rounded">
                Carregando...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Se não estiver montado, mostrar loading
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Nova Senha
            </CardTitle>
            <CardDescription className="text-gray-600">
              Carregando...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Nova Senha
          </CardTitle>
          <CardDescription className="text-gray-600">
            Digite sua nova senha segura.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres com maiúscula, minúscula, número e caractere especial"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 focus:ring-blue-500"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Indicador de força da senha */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          checkPasswordStrength(password).score === 5 ? 'bg-green-500' :
                          checkPasswordStrength(password).score >= 3 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${(checkPasswordStrength(password).score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {checkPasswordStrength(password).score}/5
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center space-x-1 ${checkPasswordStrength(password).checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className={checkPasswordStrength(password).checks.length ? 'text-green-500' : 'text-gray-400'}>✓</span>
                      <span>8+ caracteres</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${checkPasswordStrength(password).checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className={checkPasswordStrength(password).checks.uppercase ? 'text-green-500' : 'text-gray-400'}>✓</span>
                      <span>Maiúscula</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${checkPasswordStrength(password).checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className={checkPasswordStrength(password).checks.lowercase ? 'text-green-500' : 'text-gray-400'}>✓</span>
                      <span>Minúscula</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${checkPasswordStrength(password).checks.number ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className={checkPasswordStrength(password).checks.number ? 'text-green-500' : 'text-gray-400'}>✓</span>
                      <span>Número</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${checkPasswordStrength(password).checks.special ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className={checkPasswordStrength(password).checks.special ? 'text-green-500' : 'text-gray-400'}>✓</span>
                      <span>Especial</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirmar Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10 focus:ring-blue-500"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              disabled={isLoading || !password || !confirmPassword}
            >
              {isLoading ? 'Atualizando...' : 'Atualizar Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
