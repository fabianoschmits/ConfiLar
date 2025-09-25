'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Eye, 
  Image as ImageIcon,
  Calendar,
  MapPin,
  DollarSign,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePortfolio } from '@/hooks/usePortfolio'
// import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import Link from 'next/link'

export default function PortfolioPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // const { user, profile } = useAuthContext()
  const user = null
  const profile = null
  const { 
    projects, 
    loading, 
    error, 
    addProject, 
    updateProject, 
    deleteProject, 
    toggleFeatured,
    incrementViews,
    getPortfolioStats 
  } = usePortfolio(user?.id)

  const [isAddingProject, setIsAddingProject] = useState(false)
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budget_range: '',
    images: [] as string[]
  })
  const [saving, setSaving] = useState(false)

  // Verificar se é profissional
  const isProfessional = profile?.user_type === 'professional'

  const handleAddProject = async () => {
    if (!newProject.title.trim()) {
      toast.error('Título é obrigatório')
      return
    }

    setSaving(true)
    try {
      await addProject({
        title: newProject.title,
        description: newProject.description || null,
        category: newProject.category || null,
        location: newProject.location || null,
        budget_range: newProject.budget_range || null,
        images: newProject.images.length > 0 ? newProject.images : null
      })
      
      toast.success('Projeto adicionado com sucesso!')
      setIsAddingProject(false)
      setNewProject({ title: '', description: '', category: '', location: '', budget_range: '', images: [] })
    } catch (error) {
      console.error('Erro ao adicionar projeto:', error)
      toast.error('Erro ao adicionar projeto')
    } finally {
      setSaving(false)
    }
  }

  const handleEditProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      setNewProject({
        title: project.title,
        description: project.description || '',
        category: project.category || '',
        location: project.location || '',
        budget_range: project.budget_range || '',
        images: project.images || []
      })
      setEditingProject(projectId)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingProject || !newProject.title.trim()) {
      toast.error('Título é obrigatório')
      return
    }

    setSaving(true)
    try {
      await updateProject(editingProject, {
        title: newProject.title,
        description: newProject.description || null,
        category: newProject.category || null,
        location: newProject.location || null,
        budget_range: newProject.budget_range || null,
        images: newProject.images.length > 0 ? newProject.images : null
      })
      
      toast.success('Projeto atualizado com sucesso!')
      setEditingProject(null)
      setNewProject({ title: '', description: '', category: '', location: '', budget_range: '', images: [] })
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error)
      toast.error('Erro ao atualizar projeto')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return

    try {
      await deleteProject(projectId)
      toast.success('Projeto excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir projeto:', error)
      toast.error('Erro ao excluir projeto')
    }
  }

  const handleToggleFeatured = async (projectId: string, isFeatured: boolean) => {
    try {
      await toggleFeatured(projectId, isFeatured)
      toast.success(isFeatured ? 'Projeto destacado!' : 'Destaque removido!')
    } catch (error) {
      console.error('Erro ao alterar destaque:', error)
      toast.error('Erro ao alterar destaque')
    }
  }

  const handleCancel = () => {
    setIsAddingProject(false)
    setEditingProject(null)
    setNewProject({ title: '', description: '', category: '', location: '', budget_range: '', images: [] })
  }

  const handleViewProject = async (projectId: string) => {
    await incrementViews(projectId)
  }

  // Se não for profissional, mostrar mensagem
  if (!isProfessional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">ConfiLar</span>
              </div>
              <div className="flex space-x-4">
                <Button variant="outline" asChild>
                  <Link href="/auth">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth?tab=register">Criar Conta</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <Briefcase className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Portfólio Disponível Apenas para Profissionais
              </h2>
              <p className="text-gray-600 mb-6">
                Esta funcionalidade é exclusiva para profissionais cadastrados na plataforma.
              </p>
              <Button asChild>
                <Link href="/auth?tab=register">Tornar-se Profissional</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Se não estiver montado, mostrar loading
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">ConfiLar</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Carregando...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">ConfiLar</span>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" asChild>
                <Link href="/auth">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/auth?tab=register">Criar Conta</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Portfólio</h1>
              <p className="text-gray-600">
                Mostre seu trabalho e conquiste novos clientes
              </p>
            </div>
            {mounted && (
              <Button onClick={() => setIsAddingProject(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Projeto
              </Button>
            )}
          </div>
        </div>

        {/* Estados de Loading e Erro */}
        {loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Carregando projetos do portfólio...</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-8 w-8 mx-auto text-red-600 mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              {mounted && (
                <Button onClick={() => window.location.reload()}>
                  Tentar Novamente
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Lista de Projetos */}
        {!loading && !error && (
          <>
            {projects.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Briefcase className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Nenhum projeto ainda
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Comece adicionando seu primeiro projeto para mostrar seu trabalho aos clientes.
                  </p>
                  {mounted && (
                    <Button onClick={() => setIsAddingProject(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Projeto
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {projects.map((project) => (
                  <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      {/* Imagem do Projeto */}
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        {project.images && project.images.length > 0 ? (
                          <img
                            src={project.images[0]}
                            alt={project.title}
                            className="w-full h-full object-cover"
                            onClick={mounted ? () => handleViewProject(project.id) : undefined}
                          />
                        ) : (
                          <ImageIcon className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      
                      {/* Badge de Destaque */}
                      {project.is_featured && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-yellow-500 text-white">
                            Destaque
                          </Badge>
                        </div>
                      )}

                      {/* Ações */}
                      {mounted && (
                        <div className="absolute top-3 right-3 flex space-x-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditProject(project.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {project.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {project.description || 'Sem descrição'}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          {project.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{project.location}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(project.created_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                          {project.budget_range && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{project.budget_range}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{(project.rating || 0).toFixed(1)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{project.views_count} visualizações</span>
                          </div>
                        </div>
                      </div>

                      {mounted && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleToggleFeatured(project.id, !project.is_featured)}
                          >
                            {project.is_featured ? 'Remover Destaque' : 'Destacar'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleViewProject(project.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Estatísticas */}
        {!loading && !error && projects.length > 0 && (
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Estatísticas do Portfólio</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{getPortfolioStats().totalProjects}</p>
                    <p className="text-sm text-gray-600">Total de Projetos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {getPortfolioStats().featuredProjects}
                    </p>
                    <p className="text-sm text-gray-600">Em Destaque</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {getPortfolioStats().totalViews}
                    </p>
                    <p className="text-sm text-gray-600">Total de Visualizações</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {getPortfolioStats().averageRating}
                    </p>
                    <p className="text-sm text-gray-600">Avaliação Média</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}










