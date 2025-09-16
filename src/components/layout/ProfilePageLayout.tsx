'use client'

import { ReactNode } from 'react'
import { MainLayout } from './MainLayout'
import { PageTransition } from '@/components/animations/PageTransition'
import { FadeIn } from '@/components/animations/FadeIn'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  User, 
  Save,
  Edit,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProfilePageLayoutProps {
  children: ReactNode
  title: string
  description?: string
  showBackButton?: boolean
  showSaveButton?: boolean
  onSave?: () => void
  onCancel?: () => void
  isSaving?: boolean
  isEditing?: boolean
  className?: string
}

export function ProfilePageLayout({
  children,
  title,
  description,
  showBackButton = true,
  showSaveButton = false,
  onSave,
  onCancel,
  isSaving = false,
  isEditing = false,
  className = ''
}: ProfilePageLayoutProps) {
  const router = useRouter()

  return (
    <MainLayout>
      <div className="min-h-screen bg-yellow-400">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header da Página */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                {showBackButton && (
                  <Button
                    onClick={() => router.back()}
                    className="bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    VOLTAR
                  </Button>
                )}
                <div>
                  <h1 className="text-4xl md:text-6xl lg:text-8xl font-poetsen-one text-black uppercase tracking-wider leading-tight sm:drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" style={{textShadow: 'none'}}>{title.toUpperCase()}</h1>
                  {description && (
                    <p className="text-black font-bold mt-1 text-xl md:text-2xl font-poetsen-one uppercase tracking-wide" style={{textShadow: 'none'}}>{description.toUpperCase()}</p>
                  )}
                </div>
              </div>
              
              {/* Botões de Ação */}
              {showSaveButton && (
                <div className="flex items-center space-x-2">
                  {isEditing && onCancel && (
                    <Button
                      onClick={onCancel}
                      disabled={isSaving}
                      className="bg-red-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                    >
                      <X className="h-4 w-4 mr-2" />
                      CANCELAR
                    </Button>
                  )}
                  {onSave && (
                    <Button
                      onClick={onSave}
                      disabled={isSaving}
                      className="bg-green-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      SALVAR
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {/* Breadcrumb/Status */}
            <div className="flex items-center space-x-2 text-sm text-black font-bold">
              <User className="h-4 w-4" />
              <span>PERFIL</span>
              <span>•</span>
              <span>{title.toUpperCase()}</span>
              {isEditing && (
                <>
                  <span>•</span>
                  <div className="px-2 py-1 bg-yellow-400 text-black border-2 border-black font-black text-xs">
                    MODO EDIÇÃO
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

// Componente para seções de perfil
interface ProfileSectionProps {
  children: ReactNode
  title: string
  description?: string
  icon?: ReactNode
  className?: string
}

export function ProfileSection({
  children,
  title,
  description,
  icon,
  className = ''
}: ProfileSectionProps) {
  return (
    <div className={`bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${className}`}>
      <div className="p-6 border-b-4 border-black bg-black text-yellow-400">
        <h3 className="text-lg font-black flex items-center space-x-2">
          {icon}
          <span>{title.toUpperCase()}</span>
        </h3>
        {description && (
          <p className="text-sm font-bold mt-1">
            {description.toUpperCase()}
          </p>
        )}
      </div>
      <div className="p-6 space-y-4">
        {children}
      </div>
    </div>
  )
}

// Componente para informações de perfil
interface ProfileInfoProps {
  label: string
  value: string | ReactNode
  icon?: ReactNode
  editable?: boolean
  onEdit?: () => void
  className?: string
}

export function ProfileInfo({
  label,
  value,
  icon,
  editable = false,
  onEdit,
  className = ''
}: ProfileInfoProps) {
  return (
    <div className={`flex items-center justify-between p-3 bg-gray-100 border-2 border-black ${className}`}>
      <div className="flex items-center space-x-3">
        {icon && <div className="text-black">{icon}</div>}
        <div>
          <p className="text-sm font-black text-black">{label.toUpperCase()}</p>
          <div className="text-black mt-1">
            {typeof value === 'string' ? (
              <p className="text-sm font-bold">{value || 'NÃO INFORMADO'}</p>
            ) : (
              value
            )}
          </div>
        </div>
      </div>
      {editable && onEdit && (
        <Button
          onClick={onEdit}
          className="bg-blue-500 text-white border-2 border-black hover:bg-blue-600 font-black"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

// Componente para estatísticas de perfil
interface ProfileStatsProps {
  stats: Array<{
    label: string
    value: string | number
    icon?: ReactNode
    color?: string
  }>
  className?: string
}

export function ProfileStats({ stats, className = '' }: ProfileStatsProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className="text-center p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {stat.icon && (
            <div className={`text-2xl mb-2 ${stat.color || 'text-black'}`}>
              {stat.icon}
            </div>
          )}
          <p className="text-2xl font-black text-black">{stat.value}</p>
          <p className="text-sm font-bold text-black">{stat.label.toUpperCase()}</p>
        </div>
      ))}
    </div>
  )
}
