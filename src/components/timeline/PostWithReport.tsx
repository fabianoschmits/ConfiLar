'use client'

import { ReportButton } from '@/components/ReportButton'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface PostWithReportProps {
  post: {
    id: string
    title: string
    content: string
    professional_id: string
    professional: {
      id: string
      full_name: string
      avatar_url?: string
    }
  }
}

export function PostWithReport({ post }: PostWithReportProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      {/* Header do post */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {post.professional.avatar_url ? (
              <img 
                src={post.professional.avatar_url} 
                alt={post.professional.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-gray-600">
                {post.professional.full_name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{post.professional.full_name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Profissional</p>
          </div>
        </div>

        {/* Menu de ações */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <ReportButton 
                type="post" 
                targetId={post.id}
                targetName={post.title}
                asDropdownItem={true}
              />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <ReportButton 
                type="user" 
                targetId={post.professional_id}
                targetName={post.professional.full_name}
                asDropdownItem={true}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Conteúdo do post */}
      <div>
        <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{post.title}</h2>
        <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
      </div>

      {/* Ações do post */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            Curtir
          </Button>
          <Button variant="ghost" size="sm">
            Comentar
          </Button>
          <Button variant="ghost" size="sm">
            Compartilhar
          </Button>
        </div>
        
        {/* Botão de denúncia direto */}
        <ReportButton 
          type="post" 
          targetId={post.id}
          targetName={post.title}
          variant="ghost"
          size="sm"
        />
      </div>
    </div>
  )
}
