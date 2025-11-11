'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Check, Share2, Mail, MessageCircle, Send } from 'lucide-react'
import { useReferralCode } from '@/hooks/useReferralCode'
import { cn } from '@/lib/utils'

interface ReferralLinkCardProps {
  userId: string
  className?: string
}

export function ReferralLinkCard({ userId, className }: ReferralLinkCardProps) {
  const {
    referralCode,
    referralLink,
    loading,
    copyToClipboard,
    shareViaWhatsApp,
    shareViaTelegram,
    shareViaEmail
  } = useReferralCode(userId)

  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const success = await copyToClipboard()
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('border-2 border-blue-200 dark:border-blue-800', className)}>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Seu Link Exclusivo de Indicação
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Código de Referral */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Seu Código Pessoal
          </label>
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <code className="flex-1 text-lg font-bold text-blue-600 dark:text-blue-400 tracking-wider">
              {referralCode}
            </code>
          </div>
        </div>

        {/* Link Completo */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Link para Compartilhar
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={referralLink || ''}
              readOnly
              className="font-mono text-sm bg-white dark:bg-gray-900"
            />
            <Button
              onClick={handleCopy}
              variant={copied ? 'default' : 'outline'}
              size="sm"
              className="flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Botões de Compartilhamento */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Compartilhar via
          </label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={shareViaWhatsApp}
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-500"
            >
              <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-xs">WhatsApp</span>
            </Button>

            <Button
              onClick={shareViaTelegram}
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-500"
            >
              <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs">Telegram</span>
            </Button>

            <Button
              onClick={shareViaEmail}
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:border-purple-500"
            >
              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-xs">E-mail</span>
            </Button>
          </div>
        </div>

        {/* Dica */}
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            💡 <strong>Dica:</strong> Compartilhe seu link nas redes sociais, grupos de WhatsApp ou com amigos.
            Quanto mais pessoas se cadastrarem usando seu link, mais pontos e badges você ganha!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

