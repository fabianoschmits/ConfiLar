'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type PortfolioProject = Database['public']['Tables']['portfolio_projects']['Row']
type PortfolioProjectInsert = Database['public']['Tables']['portfolio_projects']['Insert']
type PortfolioProjectUpdate = Database['public']['Tables']['portfolio_projects']['Update']

export function usePortfolio(professionalId?: string) {
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar projetos do portfólio
  const fetchProjects = async (userId?: string) => {
    try {
      setLoading(true)
      setError(null)

      // Verificar se a tabela portfolio_projects existe
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .limit(1)

      if (error) {
        console.warn('Sistema de portfólio não disponível - tabela portfolio_projects não encontrada')
        setError(null) // Não mostrar erro para o usuário
        setProjects([]) // Retornar array vazio
        return
      }

      const query = supabase
        .from('portfolio_projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (userId) {
        query.eq('professional_id', userId)
      }

      const { data: projectsData, error: projectsError } = await query

      if (projectsError) {
        console.warn('Erro ao buscar projetos do portfólio:', projectsError)
        setError(null) // Não mostrar erro para o usuário
        setProjects([])
        return
      }

      setProjects(projectsData || [])
    } catch (err) {
      console.warn('Erro ao buscar projetos do portfólio:', err)
      setError(null) // Não mostrar erro para o usuário
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  // Adicionar novo projeto
  const addProject = async (projectData: Omit<PortfolioProjectInsert, 'professional_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const newProject: PortfolioProjectInsert = {
        ...projectData,
        professional_id: user.id,
        views_count: 0,
        rating: 0,
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('portfolio_projects')
        .insert([newProject])
        .select()
        .single()

      if (error) {
        console.error('Erro ao adicionar projeto:', error)
        throw new Error('Erro ao adicionar projeto ao portfólio')
      }

      setProjects(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Erro ao adicionar projeto:', err)
      throw err
    }
  }

  // Atualizar projeto
  const updateProject = async (projectId: string, updates: PortfolioProjectUpdate) => {
    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar projeto:', error)
        throw new Error('Erro ao atualizar projeto')
      }

      setProjects(prev => 
        prev.map(project => 
          project.id === projectId ? data : project
        )
      )
      return data
    } catch (err) {
      console.error('Erro ao atualizar projeto:', err)
      throw err
    }
  }

  // Deletar projeto
  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', projectId)

      if (error) {
        console.error('Erro ao deletar projeto:', error)
        throw new Error('Erro ao deletar projeto')
      }

      setProjects(prev => prev.filter(project => project.id !== projectId))
    } catch (err) {
      console.error('Erro ao deletar projeto:', err)
      throw err
    }
  }

  // Marcar projeto como destaque
  const toggleFeatured = async (projectId: string, isFeatured: boolean) => {
    try {
      await updateProject(projectId, { is_featured: isFeatured })
    } catch (err) {
      console.error('Erro ao alterar destaque:', err)
      throw err
    }
  }

  // Incrementar visualizações
  const incrementViews = async (projectId: string) => {
    try {
      const project = projects.find(p => p.id === projectId)
      if (!project) return

      const { error } = await supabase
        .from('portfolio_projects')
        .update({ 
          views_count: project.views_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)

      if (error) {
        console.error('Erro ao incrementar visualizações:', error)
        return
      }

      setProjects(prev => 
        prev.map(p => 
          p.id === projectId 
            ? { ...p, views_count: p.views_count + 1 }
            : p
        )
      )
    } catch (err) {
      console.error('Erro ao incrementar visualizações:', err)
    }
  }

  // Upload de imagens
  const uploadImages = async (files: File[], projectId: string) => {
    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${projectId}/${Date.now()}-${index}.${fileExt}`
        
        const { data, error } = await supabase.storage
          .from('portfolio-images')
          .upload(fileName, file)

        if (error) {
          console.error('Erro no upload:', error)
          throw new Error(`Erro ao fazer upload da imagem ${index + 1}`)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(fileName)

        return publicUrl
      })

      const imageUrls = await Promise.all(uploadPromises)
      return imageUrls
    } catch (err) {
      console.error('Erro no upload de imagens:', err)
      throw err
    }
  }

  // Estatísticas do portfólio
  const getPortfolioStats = () => {
    const totalProjects = projects.length
    const featuredProjects = projects.filter(p => p.is_featured).length
    const totalViews = projects.reduce((sum, p) => sum + p.views_count, 0)
    const averageRating = projects.length > 0 
      ? projects.reduce((sum, p) => sum + p.rating, 0) / projects.length 
      : 0

    return {
      totalProjects,
      featuredProjects,
      totalViews,
      averageRating: Number(averageRating.toFixed(1))
    }
  }

  useEffect(() => {
    if (professionalId) {
      fetchProjects(professionalId)
    }
  }, [professionalId])

  return {
    projects,
    loading,
    error,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
    toggleFeatured,
    incrementViews,
    uploadImages,
    getPortfolioStats
  }
}
