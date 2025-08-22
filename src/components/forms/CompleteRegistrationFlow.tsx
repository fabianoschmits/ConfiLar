'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { BasicRegistrationForm } from './BasicRegistrationForm'
import { ProfessionalCompleteForm } from './ProfessionalCompleteForm'
import { ClientCompleteForm } from './ClientCompleteForm'
import { ProfileCompletionForm } from './ProfileCompletionForm'

interface BasicFormData {
  full_name: string
  email: string
  phone: string
  cpf_cnpj: string
  birth_date: string
  location_state: string
  location_city: string
  neighborhood: string
  user_type: 'client' | 'professional'
}

interface ProfessionalFormData {
  full_name: string
  cpf: string
  phone: string
  email: string
  birth_date: string
  location_state: string
  location_city: string
  neighborhood: string
  bio: string
  profile_photo: File
  services_offered: string[]
  experience_years: string
  emergency_service: boolean
  insurance_coverage: boolean
  selfie_document?: File
  residence_proof?: File
}

interface ClientFormData {
  full_name: string
  cpf: string
  phone: string
  email: string
  birth_date: string
  location_state: string
  location_city: string
  neighborhood: string
  bio: string
  profile_photo: File
  selfie_document?: File
  residence_proof?: File
}

interface CompleteRegistrationFlowProps {
  onComplete: () => void
}

export function CompleteRegistrationFlow({ onComplete }: CompleteRegistrationFlowProps) {
  const [currentStep, setCurrentStep] = useState<'basic' | 'complete' | 'profile'>('basic')
  const [basicData, setBasicData] = useState<BasicFormData | null>(null)
  const [userType, setUserType] = useState<'client' | 'professional' | null>(null)

  const handleBasicComplete = (data: BasicFormData) => {
    setBasicData(data)
    setUserType(data.user_type)
    setCurrentStep('complete')
  }

  const handleCompleteRegistration = (data: ProfessionalFormData | ClientFormData) => {
    // Cadastro completo finalizado, agora ir para completar perfil
    setCurrentStep('profile')
  }

  const handleProfileComplete = () => {
    // Perfil completo, finalizar fluxo
    onComplete()
  }

  const getStepProgress = () => {
    if (currentStep === 'basic') return 33
    if (currentStep === 'complete') return 66
    return 100
  }

  if (currentStep === 'basic') {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Header Simplificado */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Crie sua Conta
          </h1>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            Comece sua jornada no ConfiLar em poucos passos simples
          </p>
        </div>

        {/* Barra de Progresso Simplificada */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Dados Básicos
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(getStepProgress())}% completo
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
        </div>

        {/* Formulário Básico */}
        <BasicRegistrationForm onComplete={handleBasicComplete} />
      </div>
    )
  }

  if (currentStep === 'complete') {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {userType === 'professional' ? 'Perfil Profissional' : 'Perfil Cliente'}
          </h1>
          <p className="text-lg text-gray-600">
            {userType === 'professional' 
              ? 'Adicione informações sobre seus serviços e experiência'
              : 'Complete suas informações para encontrar profissionais'
            }
          </p>
        </div>

        {/* Barra de Progresso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Cadastro Completo
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(getStepProgress())}% completo
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
        </div>

        {/* Formulário de Cadastro Completo */}
        {userType === 'professional' ? (
          <ProfessionalCompleteForm 
            basicData={basicData} 
            onComplete={handleCompleteRegistration} 
          />
        ) : (
          <ClientCompleteForm 
            basicData={basicData} 
            onComplete={handleCompleteRegistration} 
          />
        )}
      </div>
    )
  }

  if (currentStep === 'profile') {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Última Etapa: Complete seu Perfil
          </h1>
          <p className="text-lg text-gray-600">
            Quanto mais informações você fornecer, melhor será sua classificação na plataforma
          </p>
        </div>

        {/* Barra de Progresso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Completar Perfil
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(getStepProgress())}% completo
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
        </div>

        {/* Formulário de Completar Perfil */}
        <ProfileCompletionForm onComplete={handleProfileComplete} />
      </div>
    )
  }
}
