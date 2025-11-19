'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  QrCode, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthContext } from '@/contexts/AuthContext'

interface Package {
  id: string
  name: string
  points: number
  price: string
  priceValue: number
  bonus: number
}

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  packageData: Package | null
}

export function CheckoutModal({ isOpen, onClose, packageData }: CheckoutModalProps) {
  const { user, profile } = useAuthContext()
  const [step, setStep] = useState<'form' | 'qrcode' | 'success'>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    }
  })

  // Dados do pagamento
  const [paymentData, setPaymentData] = useState<{
    qrCode?: string
    qrCodeImage?: string
    paymentId?: string
    paymentUrl?: string
    expiresAt?: string
  } | null>(null)

  // Preencher dados do usuário se estiver logado
  React.useEffect(() => {
    if (user && profile && isOpen && step === 'form') {
      setFormData(prev => ({
        ...prev,
        name: profile.full_name || prev.name,
        email: user.email || prev.email,
        phone: profile.phone || prev.phone,
        cpf: profile.cpf_cnpj || prev.cpf,
        address: {
          ...prev.address,
          street: profile.address || prev.address.street,
          neighborhood: profile.neighborhood || prev.address.neighborhood,
          city: profile.location_city || prev.address.city,
          state: profile.location_state || prev.address.state
        }
      }))
    }
  }, [user, profile, isOpen, step])

  // Resetar modal quando fechar
  React.useEffect(() => {
    if (!isOpen) {
      setStep('form')
      setError(null)
      setPaymentData(null)
      setIsLoading(false)
    }
  }, [isOpen])

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return value
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
    }
    return value
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório')
      return false
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Email válido é obrigatório')
      return false
    }
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) {
      setError('Telefone válido é obrigatório')
      return false
    }
    if (!formData.cpf.trim() || formData.cpf.replace(/\D/g, '').length !== 11) {
      setError('CPF válido é obrigatório')
      return false
    }
    if (!formData.address.street.trim()) {
      setError('Rua é obrigatória')
      return false
    }
    if (!formData.address.number.trim()) {
      setError('Número é obrigatório')
      return false
    }
    if (!formData.address.neighborhood.trim()) {
      setError('Bairro é obrigatório')
      return false
    }
    if (!formData.address.city.trim()) {
      setError('Cidade é obrigatória')
      return false
    }
    if (!formData.address.state.trim() || formData.address.state.length !== 2) {
      setError('Estado (UF) é obrigatório')
      return false
    }
    if (!formData.address.zipCode.trim() || formData.address.zipCode.replace(/\D/g, '').length !== 8) {
      setError('CEP válido é obrigatório')
      return false
    }
    return true
  }

  const handleGenerateQRCode = async () => {
    if (!packageData) {
      setError('Pacote não selecionado')
      return
    }

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payment/abacatepay/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          package_id: packageData.id,
          amount: packageData.priceValue,
          points: packageData.points,
          bonus: packageData.bonus,
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone.replace(/\D/g, ''),
            cpf: formData.cpf.replace(/\D/g, ''),
            address: {
              street: formData.address.street,
              number: formData.address.number,
              complement: formData.address.complement,
              neighborhood: formData.address.neighborhood,
              city: formData.address.city,
              state: formData.address.state.toUpperCase(),
              zipCode: formData.address.zipCode.replace(/\D/g, '')
            }
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar QR Code')
      }

      setPaymentData({
        qrCode: data.qrCode,
        qrCodeImage: data.qrCodeImage,
        paymentId: data.paymentId,
        paymentUrl: data.paymentUrl,
        expiresAt: data.expiresAt
      })

      setStep('qrcode')
      toast.success('QR Code gerado com sucesso!')

    } catch (err: any) {
      console.error('Erro ao gerar QR Code:', err)
      setError(err.message || 'Erro ao gerar QR Code')
      toast.error('Erro ao gerar QR Code', {
        description: err.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyQRCode = () => {
    if (paymentData?.qrCode) {
      navigator.clipboard.writeText(paymentData.qrCode)
      toast.success('QR Code copiado para a área de transferência!')
    }
  }

  const copyPaymentUrl = () => {
    if (paymentData?.paymentUrl) {
      navigator.clipboard.writeText(paymentData.paymentUrl)
      toast.success('Link copiado para a área de transferência!')
    }
  }

  if (!packageData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Finalizar Compra - {packageData.name}
          </DialogTitle>
          <DialogDescription>
            Complete seus dados para gerar o QR Code de pagamento
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'form' && (
          <div className="space-y-6">
            {/* Resumo da Compra */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Resumo da Compra</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Pacote:</span>
                  <span className="font-semibold text-blue-900 dark:text-blue-100">{packageData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Pontos:</span>
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    {packageData.points.toLocaleString('pt-BR')} ConfiPoints
                  </span>
                </div>
                {packageData.bonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">Bônus:</span>
                    <span className="font-semibold text-green-900 dark:text-green-100">
                      +{packageData.bonus.toLocaleString('pt-BR')} pontos
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-800">
                  <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">Total:</span>
                  <span className="text-xl font-bold text-blue-900 dark:text-blue-100">{packageData.price}</span>
                </div>
              </div>
            </div>

            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Dados Pessoais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Endereço</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="street">Rua *</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    placeholder="Nome da rua"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">Número *</Label>
                  <Input
                    id="number"
                    value={formData.address.number}
                    onChange={(e) => handleInputChange('address.number', e.target.value)}
                    placeholder="123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.address.complement}
                    onChange={(e) => handleInputChange('address.complement', e.target.value)}
                    placeholder="Apto, Bloco, etc"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input
                    id="neighborhood"
                    value={formData.address.neighborhood}
                    onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
                    placeholder="Nome do bairro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    placeholder="Nome da cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado (UF) *</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value.toUpperCase())}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP *</Label>
                  <Input
                    id="zipCode"
                    value={formData.address.zipCode}
                    onChange={(e) => handleInputChange('address.zipCode', formatCEP(e.target.value))}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleGenerateQRCode}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando QR Code...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Gerar QR Code PIX
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {step === 'qrcode' && paymentData && (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Escaneie o QR Code com o app do seu banco ou copie o código PIX para pagar.
                O pagamento expira em {paymentData.expiresAt ? new Date(paymentData.expiresAt).toLocaleString('pt-BR') : 'alguns minutos'}.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col items-center space-y-4">
              {paymentData.qrCodeImage && (
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <img 
                    src={paymentData.qrCodeImage} 
                    alt="QR Code PIX" 
                    className="w-64 h-64"
                  />
                </div>
              )}

              {paymentData.qrCode && (
                <div className="w-full space-y-2">
                  <Label>Código PIX (Copiar e Colar)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={paymentData.qrCode}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyQRCode}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {paymentData.paymentUrl && (
                <div className="w-full space-y-2">
                  <Label>Link de Pagamento</Label>
                  <div className="flex gap-2">
                    <Input
                      value={paymentData.paymentUrl}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyPaymentUrl}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(paymentData.paymentUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => setStep('form')}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Pagamento Confirmado!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Seus ConfiPoints foram creditados com sucesso.
            </p>
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

