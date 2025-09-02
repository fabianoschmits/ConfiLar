'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Upload, X, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  onUpload: (file: File) => Promise<{ data: string | null; error: { message: string } | null }>
  className?: string
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  onUpload, 
  className 
}: AvatarUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.')
      return
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setUploadError('Arquivo muito grande. Máximo 5MB.')
      return
    }

    setSelectedFile(file)
    setUploadError(null)
    setUploadSuccess(false)

    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    try {
      const result = await onUpload(selectedFile)
      
      if (result.error) {
        setUploadError(result.error.message)
      } else {
        setUploadSuccess(true)
        // Limpar arquivo selecionado após sucesso
        setTimeout(() => {
          setSelectedFile(null)
          setPreviewUrl(null)
          setUploadSuccess(false)
        }, 2000)
      }
    } catch (error) {
      setUploadError('Erro inesperado no upload')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadError(null)
    setUploadSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Avatar Atual */}
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <UserAvatar 
            src={currentAvatarUrl}
            alt="Avatar atual"
            fallback="U"
            size="lg"
          />
          {uploadSuccess && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-600 text-center">
          Avatar atual
        </p>
      </div>

      {/* Upload de Novo Avatar */}
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!selectedFile ? (
          <Button
            onClick={handleClickUpload}
            variant="outline"
            className="w-full"
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Selecionar Nova Foto
          </Button>
        ) : (
          <div className="space-y-3">
            {/* Preview */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative">
                <img
                  src={previewUrl!}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
                <Button
                  onClick={handleRemoveFile}
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                {selectedFile.name}
              </p>
            </div>

            {/* Botões de Ação */}
            <div className="flex space-x-2">
              <Button
                onClick={handleUpload}
                className="flex-1"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Fazendo Upload...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Salvar Avatar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mensagens de Status */}
      {uploadError && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      {uploadSuccess && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Check className="w-4 h-4 text-green-500" />
          <p className="text-sm text-green-600">
            Avatar atualizado com sucesso!
          </p>
        </div>
      )}

      {/* Informações */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>Formatos suportados: JPEG, PNG, WebP</p>
        <p>Tamanho máximo: 5MB</p>
      </div>
    </div>
  )
}
