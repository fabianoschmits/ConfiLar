'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  TrendingUp, 
  Zap, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Smartphone, 
  Home, 
  Building, 
  Globe, 
  ChevronsUpDown, 
  ImageIcon, 
  Layout, 
  Bold, 
  Italic, 
  Underline, 
  LogOut, 
  BarChart3
} from 'lucide-react'

export default function ConquistasPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🏆 Conquistas</h1>
          <p className="text-xl text-gray-600">
            Desbloqueie conquistas e aumente sua reputação na plataforma
          </p>
        </div>

        <div className="grid gap-6">
          {/* Seção: Conquistas Desbloqueadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Conquistas Desbloqueadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold">Primeiro Perfil</h4>
                    <p className="text-sm text-gray-600">Complete seu perfil pela primeira vez</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Star className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold">Primeira Avaliação</h4>
                    <p className="text-sm text-gray-600">Receba sua primeira avaliação 5 estrelas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção: Conquistas Disponíveis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Conquistas Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Profissional Verificado</h4>
                    <p className="text-sm text-gray-600">Complete o processo de verificação</p>
                    <Progress value={60} className="mt-2" />
                    <p className="text-xs text-gray-500 mt-1">60% completo</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="h-8 w-8 text-gray-400" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Segurança Máxima</h4>
                    <p className="text-sm text-gray-600">Configure todas as opções de segurança</p>
                    <Progress value={30} className="mt-2" />
                    <p className="text-xs text-gray-500 mt-1">30% completo</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção: Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Suas Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">12</div>
                  <div className="text-sm text-gray-600">Conquistas Desbloqueadas</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">85%</div>
                  <div className="text-sm text-gray-600">Perfil Completo</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">7</div>
                  <div className="text-sm text-gray-600">Conquistas Restantes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
