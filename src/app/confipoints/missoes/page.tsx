'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Target, 
  Trophy, 
  Clock, 
  CheckCircle, 
  Star,
  Gift,
  Zap,
  Calendar,
  TrendingUp,
  Award
} from 'lucide-react'

export default function ConfiPointsMissoesPage() {
  // Mock data - será implementado na Fase 2
  const dailyMissions = [
    {
      id: 'login',
      title: 'Login Diário',
      description: 'Faça login na plataforma',
      points: 10,
      completed: true,
      progress: 100
    },
    {
      id: 'like_posts',
      title: 'Curtir Posts',
      description: 'Curtir 5 posts diferentes',
      points: 20,
      completed: false,
      progress: 60
    },
    {
      id: 'comment_posts',
      title: 'Comentar Posts',
      description: 'Comentar em 3 posts',
      points: 15,
      completed: false,
      progress: 33
    }
  ]

  const weeklyMissions = [
    {
      id: 'referrals',
      title: 'Indicações Semanais',
      description: 'Indicar 3 pessoas esta semana',
      points: 100,
      completed: false,
      progress: 66
    },
    {
      id: 'posts',
      title: 'Criar Posts',
      description: 'Criar 5 posts esta semana',
      points: 50,
      completed: false,
      progress: 40
    }
  ]

  const specialMissions = [
    {
      id: 'profile_complete',
      title: 'Perfil Completo',
      description: 'Complete 100% do seu perfil',
      points: 150,
      completed: true,
      progress: 100
    },
    {
      id: 'first_post',
      title: 'Primeiro Post',
      description: 'Faça seu primeiro post no feed',
      points: 50,
      completed: false,
      progress: 0
    }
  ]

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container py-8">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Missões ConfiPoints
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Complete missões e ganhe pontos extras
                  </p>
                </div>
              </div>
            </div>

            {/* Status Geral */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dailyMissions.filter(m => m.completed).length}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Missões concluídas hoje
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dailyMissions.reduce((sum, m) => sum + (m.completed ? m.points : 0), 0)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pontos ganhos hoje
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dailyMissions.length + weeklyMissions.length + specialMissions.length}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total de missões
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Missões Diárias */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Missões Diárias
                  <Badge variant="outline" className="ml-auto">
                    Reset em 12h
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dailyMissions.map((mission) => (
                    <div key={mission.id} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        mission.completed 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {mission.completed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Target className="w-5 h-5" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {mission.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {mission.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Progress value={mission.progress} className="flex-1 h-2" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {mission.progress}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                          +{mission.points}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">pontos</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Missões Semanais */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Missões Semanais
                  <Badge variant="outline" className="ml-auto">
                    Reset em 3 dias
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyMissions.map((mission) => (
                    <div key={mission.id} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        mission.completed 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {mission.completed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Trophy className="w-5 h-5" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {mission.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {mission.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Progress value={mission.progress} className="flex-1 h-2" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {mission.progress}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          +{mission.points}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">pontos</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Missões Especiais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  Missões Especiais
                  <Badge variant="outline" className="ml-auto">
                    Sempre disponíveis
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {specialMissions.map((mission) => (
                    <div key={mission.id} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        mission.completed 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                          : 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                      }`}>
                        {mission.completed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Gift className="w-5 h-5" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {mission.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {mission.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Progress value={mission.progress} className="flex-1 h-2" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {mission.progress}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          +{mission.points}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">pontos</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Nota sobre Fase 2 */}
            <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    Sistema de Missões em Desenvolvimento
                  </h3>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  O sistema completo de missões será implementado na Fase 2 do ConfiPoints. 
                  Por enquanto, você pode ganhar pontos através das atividades normais da plataforma.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
