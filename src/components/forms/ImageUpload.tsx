'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Plus,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  className?: string
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 5, 
  className 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
      return isValidType && isValidSize
    })

    if (validFiles.length !== fileArray.length) {
      alert('Alguns arquivos foram ignorados. Apenas imagens até 5MB são permitidas.')
    }

    if (images.length + validFiles.length > maxImages) {
      alert(`Máximo de ${maxImages} imagens permitidas`)
      return
    }

    setUploading(true)
    try {
      // Simular upload - em produção, você faria o upload real aqui
      const newImageUrls = validFiles.map(file => URL.createObjectURL(file))
      onImagesChange([...images, ...newImageUrls])
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao fazer upload das imagens')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Área de Upload */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400',
          uploading && 'opacity-50 pointer-events-none'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {uploading ? 'Fazendo upload...' : 'Arraste imagens aqui ou clique para selecionar'}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF até 5MB cada. Máximo {maxImages} imagens.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFileDialog}
            disabled={uploading || images.length >= maxImages}
          >
            <Plus className="h-4 w-4 mr-2" />
            Selecionar Imagens
          </Button>
        </div>
      </div>

      {/* Preview das Imagens */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-0">
                <div className="aspect-square relative overflow-hidden rounded-lg">
                  <img
                    src={image}
                    alt={`Projeto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Botão de remover */}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  {/* Badge de ordem */}
                  <Badge 
                    variant="secondary" 
                    className="absolute bottom-2 left-2 text-xs"
                  >
                    {index + 1}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Informações */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <AlertCircle className="h-3 w-3" />
        <span>
          {images.length} de {maxImages} imagens selecionadas
        </span>
      </div>
    </div>
  )
}
