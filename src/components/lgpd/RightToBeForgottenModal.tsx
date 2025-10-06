'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Trash2, 
  AlertTriangle, 
  Shield,
  CheckCircle,
  Loader2,
  Eye,
  FileText,
  Database
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface RightToBeForgottenModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RightToBeForgottenModal({ isOpen, onClose }: RightToBeForgottenModalProps) {
  const { user } = useAuthContext()
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [step, setStep] = useState<'warning' | 'confirmation' | 'processing'>('warning')

  if (!isOpen) return null

  const handleStartDeletion = () => {
    setStep('confirmation')
  }

  const handleConfirmDeletion = async () => {
    if (!user) {
      toast.error('Você precisa estar logado')
      return
    }

    if (!password) {
      toast.error('Digite sua senha para confirmar')
      return
    }

    if (confirmText !== 'DELETAR CONTA') {
      toast.error('Digite exatamente "DELETAR CONTA" para confirmar')
      return
    }

    setStep('processing')
    setIsDeleting(true)

    try {
      const response = await fetch('/api/lgpd/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao deletar conta')
      }

      toast.success('Conta deletada com sucesso!')
      
      // Redirecionar para página inicial após 2 segundos
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)

    } catch (error) {
      console.error('Erro ao deletar conta:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao deletar conta')
      setStep('confirmation')
    } finally {
      setIsDeleting(false)
    }
  }

  const dataToBeDeleted = [
    {
      name: 'Perfil Pessoal',
      description: 'Todas as informações do seu perfil',
      icon: <Eye className="h-4 w-4" />,
      critical: true
    },
    {
      name: 'Mensagens',
      description: 'Todas as conversas e mensagens',
      icon: <FileText className="h-4 w-4" />,
      critical: true
    },
    {
      name: 'Avaliações',
      description: 'Avaliações recebidas e enviadas',
      icon: <CheckCircle className="h-4 w-4" />,
      critical: true
    },
    {
      name: 'Favoritos',
      description: 'Lista de profissionais favoritados',
      icon: <Database className="h-4 w-4" />,
      critical: false
    },
    {
      name: 'Classificados',
      description: 'Anúncios publicados',
      icon: <FileText className="h-4 w-4" />,
      critical: true
    },
    {
      name: 'Notificações',
      description: 'Histórico de notificações',
      icon: <AlertTriangle className="h-4 w-4" />,
      critical: false
    }
  ]

  if (step === 'warning') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-6 w-6 mr-2" />
              Direito ao Esquecimento
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Exercite seu direito de ter seus dados pessoais excluídos
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            
            {/* Aviso Crítico */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-800 mb-2">⚠️ ATENÇÃO: Ação Irreversível</h3>
              <p className="text-red-700 text-sm">
                A exclusão da sua conta é <strong>permanente e irreversível</strong>. 
                Todos os seus dados serão removidos definitivamente do sistema.
              </p>
            </div>

            {/* O que será deletado */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Dados que serão excluídos:</h3>
              <div className="grid gap-3">
                {dataToBeDeleted.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-red-600">
                        {data.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{data.name}</h4>
                        <p className="text-sm text-gray-600">{data.description}</p>
                      </div>
                    </div>
                    <Badge variant={data.critical ? "destructive" : "secondary"}>
                      {data.critical ? 'Crítico' : 'Opcional'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Recomendações */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Recomendações antes de excluir:</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Exporte seus dados importantes usando a portabilidade</li>
                <li>• Salve informações de contato importantes</li>
                <li>• Considere desativar a conta temporariamente</li>
                <li>• Entre em contato conosco se tiver dúvidas</li>
              </ul>
            </div>

            {/* Alternativas */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Alternativas à exclusão:</h3>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Desativar notificações</li>
                <li>• Alterar configurações de privacidade</li>
                <li>• Remover dados específicos</li>
                <li>• Contatar o suporte para outras opções</li>
              </ul>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button 
                onClick={handleStartDeletion}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Prosseguir com a Exclusão
              </Button>
              
              <Button 
                onClick={onClose}
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'confirmation') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <Shield className="h-6 w-6 mr-2" />
              Confirmação Final
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Digite sua senha e confirme a exclusão
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            
            {/* Aviso Final */}
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-700 text-sm font-medium">
                Esta é sua última chance de cancelar. Após confirmar, 
                sua conta será excluída permanentemente.
              </p>
            </div>

            {/* Campo de Senha */}
            <div>
              <Label htmlFor="password">Digite sua senha atual:</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha atual"
                className="mt-1"
              />
            </div>

            {/* Campo de Confirmação */}
            <div>
              <Label htmlFor="confirm">
                Digite <strong>DELETAR CONTA</strong> para confirmar:
              </Label>
              <Input
                id="confirm"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETAR CONTA"
                className="mt-1"
              />
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={handleConfirmDeletion}
                disabled={!password || confirmText !== 'DELETAR CONTA'}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Confirmar Exclusão Definitiva
              </Button>
              
              <Button 
                onClick={() => setStep('warning')}
                variant="outline"
              >
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Excluindo sua conta...
            </h3>
            <p className="text-gray-600 text-sm">
              Por favor, aguarde. Este processo pode levar alguns minutos.
            </p>
            <div className="mt-4 text-xs text-gray-500">
              <p>• Removendo dados pessoais</p>
              <p>• Excluindo mensagens e conversas</p>
              <p>• Limpando histórico de atividades</p>
              <p>• Finalizando exclusão da conta</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
