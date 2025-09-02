'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Eye, 
  Download, 
  Share2,
  Image as ImageIcon,
  Calendar,
  MapPin,
  DollarSign
} from 'lucide-react'
import { PageTransition } from '@/components/animations/PageTransition'
import { FadeIn } from '@/components/animations/FadeIn'
import { useState } from 'react'

// Dados mockados para demonstração
const mockPortfolio = [
  {
    id: 1,
    title: 'Reforma Completa Residencial',
    description: 'Reforma completa de uma casa de 120m², incluindo cozinha, banheiros e sala de estar.',
    category: 'Reforma',
    location: 'São Paulo, SP',
    date: '2024-01-15',
    budget: 'R$ 45.000',
    images: ['/api/placeholder/400/300'],
    rating: 4.9,
    views: 156,
    isFeatured: true
  },
  {
    id: 2,
    title: 'Instalação Elétrica Comercial',
    description: 'Instalação completa do sistema elétrico para uma loja de 200m².',
    category: 'Elétrica',
    location: 'Campinas, SP',
    date: '2024-01-10',
    budget: 'R$ 18.000',
    images: ['/api/placeholder/400/300'],
    rating: 4.8,
    views: 89,
    isFeatured: false
  },
  {
    id: 3,
    title: 'Pintura Residencial Premium',
    description: 'Pintura interna e externa com acabamento premium e texturas especiais.',
    category: 'Pintura',
    location: 'Santos, SP',
    date: '2024-01-05',
    budget: 'R$ 12.000',
    images: ['/api/placeholder/400/300'],
    rating: 4.7,
    views: 234,
    isFeatured: true
  }
]

const categories = [
  'Reforma', 'Elétrica', 'Pintura', 'Limpeza', 'Jardinagem', 'Encanamento',
  'Alvenaria', 'Acabamento', 'Decoração', 'Manutenção'
]

export default function PortfolioPage() {
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [editingProject, setEditingProject] = useState<number | null>(null)
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budget: '',
    images: ['']
  })

  const handleAddProject = () => {
    // Aqui você implementaria a lógica para adicionar o projeto
    console.log('Adicionando projeto:', newProject)
    setIsAddingProject(false)
    setNewProject({ title: '', description: '', category: '', location: '', budget: '', images: [''] })
  }

  const handleEditProject = (id: number) => {
    const project = mockPortfolio.find(p => p.id === id)
    if (project) {
      setNewProject({
        title: project.title,
        description: project.description,
        category: project.category,
        location: project.location,
        budget: project.budget,
        images: project.images
      })
      setEditingProject(id)
    }
  }

  const handleSaveEdit = () => {
    // Aqui você implementaria a lógica para salvar as edições
    console.log('Salvando edição:', editingProject, newProject)
    setEditingProject(null)
    setNewProject({ title: '', description: '', category: '', location: '', budget: '', images: [''] })
  }

  const handleCancel = () => {
    setIsAddingProject(false)
    setEditingProject(null)
    setNewProject({ title: '', description: '', category: '', location: '', budget: '', images: [''] })
  }

  return (
    <MainLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <FadeIn>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Portfólio</h1>
                  <p className="text-gray-600">
                    Mostre seu trabalho e conquiste novos clientes
                  </p>
                </div>
                <Button onClick={() => setIsAddingProject(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Projeto
                </Button>
              </div>
            </div>
          </FadeIn>

          {/* Formulário de Adição/Edição */}
          {(isAddingProject || editingProject) && (
            <FadeIn>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>
                    {editingProject ? 'Editar Projeto' : 'Adicionar Novo Projeto'}
                  </CardTitle>
                  <CardDescription>
                    Preencha as informações do seu projeto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Título do Projeto</Label>
                      <Input
                        id="title"
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        placeholder="Ex: Reforma Completa Residencial"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={newProject.category}
                        onValueChange={(value) => setNewProject({ ...newProject, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Descreva detalhadamente o projeto realizado..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Localização</Label>
                      <Input
                        id="location"
                        value={newProject.location}
                        onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                        placeholder="Ex: São Paulo, SP"
                      />
                    </div>
                    <div>
                      <Label htmlFor="budget">Orçamento</Label>
                      <Input
                        id="budget"
                        value={newProject.budget}
                        onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                        placeholder="Ex: R$ 25.000"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {editingProject ? (
                      <>
                        <Button onClick={handleSaveEdit}>
                          Salvar Alterações
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={handleAddProject}>
                          Adicionar Projeto
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>
                          Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Lista de Projetos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mockPortfolio.map((project, index) => (
              <FadeIn key={project.id} delay={index * 0.1}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {/* Imagem do Projeto */}
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    
                    {/* Badge de Destaque */}
                    {project.isFeatured && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-yellow-500 text-white">
                          Destaque
                        </Badge>
                      </div>
                    )}

                    {/* Ações */}
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
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {project.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{project.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(project.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{project.budget}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{project.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{project.views} visualizações</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartilhar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>

          {/* Estatísticas */}
          <div className="mt-12">
            <FadeIn delay={0.5}>
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
                      <p className="text-2xl font-bold text-blue-600">{mockPortfolio.length}</p>
                      <p className="text-sm text-gray-600">Total de Projetos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {mockPortfolio.filter(p => p.isFeatured).length}
                      </p>
                      <p className="text-sm text-gray-600">Em Destaque</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {mockPortfolio.reduce((sum, p) => sum + p.views, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total de Visualizações</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {(mockPortfolio.reduce((sum, p) => sum + p.rating, 0) / mockPortfolio.length).toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-600">Avaliação Média</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  )
}










