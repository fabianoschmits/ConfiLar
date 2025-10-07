import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { TimelineActivity as TimelineActivityType } from '@/types/timeline'

interface TimelineActivityProps {
  activity: TimelineActivityType
}

export function TimelineActivity({ activity }: TimelineActivityProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora mesmo'
    if (diffInHours === 1) return '1 hora atrás'
    if (diffInHours < 24) return `${diffInHours} horas atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return '1 dia atrás'
    return `${diffInDays} dias atrás`
  }

  return (
    <Card className="overflow-hidden border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Link href={`/perfil/${activity.user_id}`} className="hover:opacity-80 transition-opacity">
            <Avatar className="w-12 h-12 cursor-pointer">
              <AvatarImage src={activity.user_avatar || ''} alt={`Avatar de ${activity.user_name}`} />
              <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                {activity.user_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{activity.icon}</span>
              <h3 className="font-semibold text-gray-900">{activity.title}</h3>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Link 
                href={`/perfil/${activity.user_id}`}
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                {activity.user_name}
              </Link>
              <span>•</span>
              <span>{formatTimeAgo(activity.created_at)}</span>
            </div>
          </div>
          <Badge className={activity.color}>
            {activity.activity_type === 'user_joined' && 'Novo Membro'}
            {activity.activity_type === 'recommendation' && 'Recomendação'}
            {activity.activity_type === 'review' && 'Avaliação'}
            {activity.activity_type === 'agreement' && 'Acordo'}
            {activity.activity_type === 'classified_posted' && 'Anúncio'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-700 mb-3">{activity.description}</p>
        
        {activity.metadata && (
          <div className="bg-gray-50 rounded-lg p-3">
            {activity.activity_type === 'review' && activity.metadata.rating && (
              <div className="flex items-center space-x-1 mb-2">
                <span className="text-sm text-gray-600">Avaliação:</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${
                        i < activity.metadata.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {activity.metadata.service_description && (
              <p className="text-sm text-gray-600">
                <strong>Serviço:</strong> {activity.metadata.service_description}
              </p>
            )}
            
            {activity.metadata.category && (
              <p className="text-sm text-gray-600">
                <strong>Categoria:</strong> {activity.metadata.category}
              </p>
            )}
            
            {activity.metadata.target_user_name && (
              <p className="text-sm text-gray-600">
                <strong>Para:</strong> {activity.metadata.target_user_name}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
