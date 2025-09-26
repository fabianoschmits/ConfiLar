/**
 * Exemplos de uso das otimizações implementadas
 * Este arquivo demonstra como usar os hooks otimizados
 */

import React from 'react'
import { useTimeline } from '@/hooks/useTimeline'
import { useOptimizedMessages } from '@/hooks/useOptimizedMessages'
import { useProfile, useProfiles } from '@/hooks/useOptimizedProfiles'
import { useClassifieds } from '@/hooks/useOptimizedClassifieds'
import { useUserReviews } from '@/hooks/useOptimizedReviews'
import { useChatRealtime, useTimelineRealtime } from '@/hooks/useOptimizedRealtime'

// ===================================
// EXEMPLO 1: TIMELINE OTIMIZADA
// ===================================

export function OptimizedTimelineExample() {
  const { 
    posts, 
    isLoading, 
    error, 
    loadMore, 
    hasNextPage, 
    isFetchingNextPage 
  } = useTimeline({ category: 'all' })

  // Realtime apenas para posts (opcional)
  useTimelineRealtime()

  if (isLoading) return <div>Carregando posts...</div>
  if (error) return <div>Erro ao carregar posts</div>

  return (
    <div>
      <h2>Timeline Otimizada</h2>
      <div className="space-y-4">
        {posts.map((post: any) => (
          <div key={post.id} className="border p-4 rounded">
            <h3>{post.title}</h3>
            <p>{post.description}</p>
            <div className="flex justify-between">
              <span>👍 {post.likes_count}</span>
              <span>💬 {post.comments_count}</span>
            </div>
          </div>
        ))}
      </div>
      
      {hasNextPage && (
        <button 
          onClick={loadMore}
          disabled={isFetchingNextPage}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isFetchingNextPage ? 'Carregando...' : 'Carregar mais posts'}
        </button>
      )}
    </div>
  )
}

// ===================================
// EXEMPLO 2: CHAT OTIMIZADO
// ===================================

export function OptimizedChatExample() {
  const { 
    conversations,
    messages,
    selectedConversationId,
    loadMessages,
    sendMessage,
    loadMoreMessages,
    hasNextPage,
    totalUnreadMessages
  } = useOptimizedMessages()

  // Realtime para chat (sempre ativo)
  useChatRealtime()

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return
    
    try {
      await sendMessage(selectedConversationId, content)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  return (
    <div className="flex h-96">
      {/* Lista de conversas */}
      <div className="w-1/3 border-r p-4">
        <h3>Conversas ({totalUnreadMessages} não lidas)</h3>
        <div className="space-y-2">
          {conversations.map((conv: any) => (
            <div 
              key={conv.id}
              onClick={() => loadMessages(conv.id)}
              className={`p-2 rounded cursor-pointer ${
                selectedConversationId === conv.id ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              <div className="font-semibold">
                {conv.client?.full_name || conv.professional?.full_name}
              </div>
              {conv.unread_count > 0 && (
                <span className="text-red-500 text-sm">
                  {conv.unread_count} não lidas
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 p-4">
        {selectedConversationId ? (
          <div>
            <div className="h-64 overflow-y-auto border rounded p-2">
              {messages.map((msg: any) => (
                <div key={msg.id} className="mb-2">
                  <div className="text-sm text-gray-500">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </div>
                  <div>{msg.content}</div>
                </div>
              ))}
            </div>
            
            {hasNextPage && (
              <button 
                onClick={loadMoreMessages}
                className="mt-2 text-blue-500 text-sm"
              >
                Carregar mensagens anteriores
              </button>
            )}
            
            <div className="mt-2 flex">
              <input 
                type="text" 
                placeholder="Digite sua mensagem..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
                className="flex-1 border rounded px-2 py-1"
              />
            </div>
          </div>
        ) : (
          <div className="text-gray-500">
            Selecione uma conversa para começar
          </div>
        )}
      </div>
    </div>
  )
}

// ===================================
// EXEMPLO 3: PERFIS OTIMIZADOS
// ===================================

export function OptimizedProfilesExample() {
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null)
  
  // Lista de perfis com paginação
  const { 
    data: profilesData, 
    isLoading: profilesLoading 
  } = useProfiles({ user_type: 'professional' }, 0, 20)
  
  // Perfil específico com cache
  const { 
    data: profile, 
    isLoading: profileLoading 
  } = useProfile(selectedUserId || '')

  return (
    <div className="flex h-96">
      {/* Lista de perfis */}
      <div className="w-1/2 border-r p-4">
        <h3>Profissionais</h3>
        {profilesLoading ? (
          <div>Carregando perfis...</div>
        ) : (
          <div className="space-y-2">
            {profilesData?.profiles.map((prof: any) => (
              <div 
                key={prof.id}
                onClick={() => setSelectedUserId(prof.id)}
                className="p-2 border rounded cursor-pointer hover:bg-gray-100"
              >
                <div className="font-semibold">{prof.full_name}</div>
                <div className="text-sm text-gray-500">
                  {prof.location_city}, {prof.location_state}
                </div>
                <div className="text-sm">
                  ⭐ {prof.rating || 0} ({prof.total_reviews || 0} avaliações)
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detalhes do perfil */}
      <div className="w-1/2 p-4">
        {selectedUserId ? (
          profileLoading ? (
            <div>Carregando perfil...</div>
          ) : profile ? (
            <div>
              <h3>{profile.full_name}</h3>
              <p className="text-gray-600">{profile.bio}</p>
              <div className="mt-4 space-y-2">
                <div>📍 {profile.location_city}, {profile.location_state}</div>
                <div>⭐ {profile.rating || 0} ({profile.total_reviews || 0} avaliações)</div>
                <div>✅ {profile.is_verified ? 'Verificado' : 'Não verificado'}</div>
                <div>🟢 {profile.is_available ? 'Disponível' : 'Indisponível'}</div>
              </div>
            </div>
          ) : (
            <div>Perfil não encontrado</div>
          )
        ) : (
          <div className="text-gray-500">
            Selecione um profissional para ver os detalhes
          </div>
        )}
      </div>
    </div>
  )
}

// ===================================
// EXEMPLO 4: ANÚNCIOS OTIMIZADOS
// ===================================

export function OptimizedClassifiedsExample() {
  const [filters, setFilters] = React.useState({
    category: '',
    location_state: '',
    ad_type: 'offer' as 'offer' | 'request'
  })
  
  const { 
    data: classifiedsData, 
    isLoading 
  } = useClassifieds(filters, 0, 20)

  return (
    <div>
      <h2>Anúncios Classificados</h2>
      
      {/* Filtros */}
      <div className="mb-4 space-x-2">
        <select 
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
          className="border rounded px-2 py-1"
        >
          <option value="">Todas as categorias</option>
          <option value="reformas">Reformas</option>
          <option value="limpeza">Limpeza</option>
          <option value="tecnologia">Tecnologia</option>
        </select>
        
        <select 
          value={filters.ad_type}
          onChange={(e) => setFilters({...filters, ad_type: e.target.value as 'offer' | 'request'})}
          className="border rounded px-2 py-1"
        >
          <option value="offer">Ofertas</option>
          <option value="request">Solicitações</option>
        </select>
      </div>

      {/* Lista de anúncios */}
      {isLoading ? (
        <div>Carregando anúncios...</div>
      ) : (
        <div className="space-y-4">
          {classifiedsData?.ads.map((ad: any) => (
            <div key={ad.id} className="border p-4 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{ad.title}</h3>
                  <p className="text-gray-600">{ad.description}</p>
                  <div className="text-sm text-gray-500">
                    {ad.location_city}, {ad.location_state}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {ad.ad_type === 'offer' ? 'Oferta' : 'Solicitação'}
                  </div>
                  <div className="text-sm text-gray-500">
                    👁️ {ad.views} visualizações
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ===================================
// EXEMPLO 5: AVALIAÇÕES OTIMIZADAS
// ===================================

export function OptimizedReviewsExample({ userId }: { userId: string }) {
  const { 
    data: reviewsData, 
    isLoading 
  } = useUserReviews(userId, 'received', 0, 20)

  return (
    <div>
      <h2>Avaliações Recebidas</h2>
      
      {isLoading ? (
        <div>Carregando avaliações...</div>
      ) : (
        <div className="space-y-4">
          {reviewsData?.reviews.map((review: any) => (
            <div key={review.id} className="border p-4 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">
                    {review.reviewer?.full_name}
                  </div>
                  <div className="text-yellow-500">
                    {'⭐'.repeat(review.rating_person)}
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 mt-2">{review.comment}</p>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ===================================
// EXEMPLO 6: USO COMBINADO
// ===================================

export function CompleteOptimizedExample() {
  const [activeTab, setActiveTab] = React.useState<'timeline' | 'chat' | 'profiles' | 'classifieds'>('timeline')

  return (
    <div>
      <div className="flex space-x-4 mb-4">
        <button 
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded ${activeTab === 'timeline' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Timeline
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded ${activeTab === 'chat' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Chat
        </button>
        <button 
          onClick={() => setActiveTab('profiles')}
          className={`px-4 py-2 rounded ${activeTab === 'profiles' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Perfis
        </button>
        <button 
          onClick={() => setActiveTab('classifieds')}
          className={`px-4 py-2 rounded ${activeTab === 'classifieds' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Anúncios
        </button>
      </div>

      {activeTab === 'timeline' && <OptimizedTimelineExample />}
      {activeTab === 'chat' && <OptimizedChatExample />}
      {activeTab === 'profiles' && <OptimizedProfilesExample />}
      {activeTab === 'classifieds' && <OptimizedClassifiedsExample />}
    </div>
  )
}
