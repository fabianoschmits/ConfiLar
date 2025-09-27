'use client'

import { useState, useEffect } from 'react'
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  alt?: string
  title?: string
}

export function ImageModal({ isOpen, onClose, imageUrl, alt = '', title }: ImageModalProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setScale(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen])

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleReset = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = title || 'imagem'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao baixar imagem:', error)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(prev => Math.max(0.1, Math.min(5, prev * delta)))
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controles */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomOut}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomIn}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRotate}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Botão de reset */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleReset}
          className="absolute top-4 left-4 z-10 bg-black/50 hover:bg-black/70 text-white"
        >
          Reset
        </Button>

        {/* Imagem */}
        <div
          className="relative max-w-full max-h-full overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <img
            src={imageUrl}
            alt={alt}
            className={cn(
              "max-w-none select-none transition-transform duration-200",
              isDragging && "cursor-grabbing"
            )}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain'
            }}
            draggable={false}
          />
        </div>

        {/* Informações da imagem */}
        {title && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-black/50 text-white px-4 py-2 rounded-lg text-center">
              {title}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
