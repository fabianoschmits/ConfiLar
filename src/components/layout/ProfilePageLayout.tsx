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
      <PageTransition>
        <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 ${className}`}>
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <FadeIn>
              {/* Header da Página */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {showBackButton && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                      </Button>
                    )}
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                      {description && (
                        <p className="text-gray-600 mt-1">{description}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Botões de Ação */}
                  {showSaveButton && (
                    <div className="flex items-center space-x-2">
                      {isEditing && onCancel && (
                        <Button
                          variant="outline"
                          onClick={onCancel}
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      )}
                      {onSave && (
                        <Button
                          onClick={onSave}
                          disabled={isSaving}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Salvar
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Breadcrumb/Status */}
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>Perfil</span>
                  <span>•</span>
                  <span>{title}</span>
                  {isEditing && (
                    <>
                      <span>•</span>
                      <Badge variant="secondary" className="text-xs">
                        Modo Edição
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Conteúdo Principal */}
              <div className="space-y-6">
                {children}
              </div>
            </FadeIn>
          </div>
        </div>
      </PageTransition>
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
    <Card className={`bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          {icon}
          <span>{title}</span>
        </CardTitle>
        {description && (
          <CardDescription className="text-sm">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
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
    <div className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${className}`}>
      <div className="flex items-center space-x-3">
        {icon && <div className="text-gray-500">{icon}</div>}
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <div className="text-gray-900 mt-1">
            {typeof value === 'string' ? (
              <p className="text-sm">{value || 'Não informado'}</p>
            ) : (
              value
            )}
          </div>
        </div>
      </div>
      {editable && onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-gray-500 hover:text-gray-700"
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
        <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
          {stat.icon && (
            <div className={`text-2xl mb-2 ${stat.color || 'text-gray-600'}`}>
              {stat.icon}
            </div>
          )}
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-sm text-gray-600">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
