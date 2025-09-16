'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Star, 
  MapPin, 
  Shield, 
  Clock, 
  DollarSign,
  Award,
  X
} from 'lucide-react'
import { Profile } from '@/types/database'

interface ProfessionalServicesModalProps {
  isOpen: boolean
  onClose: () => void
  professional: Profile | null
}

export const ProfessionalServicesModal: React.FC<ProfessionalServicesModalProps> = ({
  isOpen,
  onClose,
  professional
}) => {
  if (!professional) return null

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 text-yellow-500 fill-current opacity-50" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
    }

    return stars
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto bg-yellow-400 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mx-2 sm:mx-4">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-poetsen-one text-black uppercase tracking-wider">
              SERVIÇOS PRESTADOS
            </DialogTitle>
            <Button
              onClick={onClose}
              className="p-1 sm:p-2 bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Header do Profissional */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              {/* Avatar */}
              <div className="p-2 bg-black border-2 border-black mx-auto sm:mx-0">
                <Avatar className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20">
                  <AvatarImage src={professional.avatar_url || ''} alt={professional.full_name || 'Profissional'} />
                  <AvatarFallback className="bg-yellow-400 text-black font-black text-lg sm:text-xl md:text-2xl">
                    {(professional.full_name || 'P').charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Informações do Profissional */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h2 className="text-lg sm:text-xl font-poetsen-one text-black uppercase tracking-wider">
                    {professional.full_name?.toUpperCase() || 'NOME NÃO INFORMADO'}
                  </h2>
                  {professional.is_verified && (
                    <div className="p-1 bg-green-500 text-white border border-black mx-auto sm:mx-0 w-fit">
                      <Shield className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Localização */}
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm font-bold text-gray-700 mb-3">
                  <MapPin className="h-4 w-4" />
                  <span className="text-center sm:text-left">
                    {professional.location_city && professional.location_state 
                      ? `${professional.location_city.toUpperCase()}, ${professional.location_state}`
                      : 'LOCALIZAÇÃO NÃO INFORMADA'
                    }
                  </span>
                </div>

                {/* Avaliação */}
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    {renderStars(professional.rating || 0)}
                  </div>
                  <span className="text-sm font-black text-black">
                    {professional.rating ? professional.rating.toFixed(1) : '0.0'}
                  </span>
                  <span className="text-sm font-bold text-gray-700">
                    ({professional.total_reviews || 0} AVALIAÇÕES)
                  </span>
                </div>

                {/* Experiência */}
                {professional.professional_experience_years && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Clock className="h-4 w-4" />
                    <span>{professional.professional_experience_years} ANOS DE EXPERIÊNCIA</span>
                  </div>
                )}

                {/* Certificações */}
                {professional.professional_certifications && professional.professional_certifications.length > 0 && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Award className="h-4 w-4" />
                    <span>{professional.professional_certifications.length} CERTIFICAÇÃO(ÕES)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Lista de Serviços */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-poetsen-one text-black uppercase tracking-wider">
            TODOS OS SERVIÇOS OFERECIDOS:
          </h3>

          {professional.professional_services && professional.professional_services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {professional.professional_services.map((service, index) => (
                <div 
                  key={index}
                  className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-black text-black text-xs sm:text-sm uppercase tracking-wide flex-1 mr-2">
                      {service.toUpperCase()}
                    </h4>
                    <Badge className="bg-yellow-400 text-black border-2 border-black font-black text-xs flex-shrink-0">
                      #{index + 1}
                    </Badge>
                  </div>
                  
                  {/* Placeholder para informações adicionais do serviço */}
                  <div className="text-xs font-bold text-gray-600 space-y-1">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>PREÇO A COMBINAR</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>DISPONÍVEL</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 border-4 border-black flex items-center justify-center mx-auto mb-4">
                <X className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
              </div>
              <h4 className="text-base sm:text-lg font-black text-black mb-2">
                NENHUM SERVIÇO CADASTRADO
              </h4>
              <p className="text-sm font-bold text-gray-700">
                Este profissional ainda não cadastrou seus serviços.
              </p>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-3 sm:gap-4 pt-4 sm:pt-6 border-t-4 border-black">
          <Button
            onClick={onClose}
            className="flex-1 py-2 sm:py-3 bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-sm sm:text-base"
          >
            FECHAR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
