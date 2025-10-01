import { useCallback, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
// import { useNotificationTriggers } from './useNotificationTriggers' // DESABILITADO - causava loop
// import { useChatNotifications } from './useChatNotifications' // DESABILITADO - causava loop
// import { useReviewNotifications } from './useReviewNotifications' // DESABILITADO - causava loop
// import { useProfileNotifications } from './useProfileNotifications' // DESABILITADO - causava loop
// import { useSystemNotifications } from './useSystemNotifications' // DESABILITADO - causava loop
import { NotificationService } from '@/services/NotificationService'
import { NotificationControlService } from '@/services/NotificationControlService'

/**
 * Hook principal que integra todas as notificações do sistema (COMPLETAMENTE DESABILITADO)
 */
export function useCompleteNotifications() {
  const { user } = useAuthContext()
  
  // TODOS OS HOOKS DESABILITADOS PARA EVITAR LOOPS
  // const notificationTriggers = useNotificationTriggers()
  // const chatNotifications = useChatNotifications()
  // const reviewNotifications = useReviewNotifications()
  // const profileNotifications = useProfileNotifications()
  // const systemNotifications = useSystemNotifications()

  // Notificar boas-vindas para novos usuários (DESABILITADO - removido por solicitação)
  const notifyWelcome = useCallback(async () => {
    // DESABILITADO - notificação "Bem-vindo ao ConfiLar" removida do sistema
    console.log('⚠️ Notificação "Bem-vindo ao ConfiLar" DESABILITADA por solicitação')
  }, [user])

  // Notificar primeiro login (DESABILITADO - removido por solicitação)
  const notifyFirstLogin = useCallback(async () => {
    // DESABILITADO - notificação "Primeiro acesso" removida do sistema
    console.log('⚠️ Notificação "Primeiro acesso" DESABILITADA por solicitação')
  }, [user])

  // Notificar perfil incompleto (DESABILITADO - causava loop)
  const notifyIncompleteProfile = useCallback(async () => {
    // DESABILITADO - causava loop de notificações
    console.log('⚠️ notifyIncompleteProfile DESABILITADO - causava loop')
  }, [user])

  // Notificar dicas de uso
  const notifyUsageTips = useCallback(async () => {
    if (!user) return

    const tips = [
      {
        title: '💡 Dica: Adicione fotos ao seu portfólio',
        message: 'Fotos de qualidade aumentam suas chances de ser contratado.',
        action_url: '/portfolio'
      },
      {
        title: '💡 Dica: Responda mensagens rapidamente',
        message: 'Respostas rápidas melhoram sua reputação.',
        action_url: '/chat'
      },
      {
        title: '💡 Dica: Mantenha seu perfil atualizado',
        message: 'Informações atualizadas atraem mais clientes.',
        action_url: '/editarperfil'
      },
      {
        title: '💡 Dica: Use palavras-chave relevantes',
        message: 'Descreva bem seus serviços para aparecer nas buscas.',
        action_url: '/editarperfil'
      }
    ]

    const randomTip = tips[Math.floor(Math.random() * tips.length)]

    // DESABILITADO - causava loop
    // try {
    //   await NotificationService.create({
    //     user_id: user.id,
    //     title: randomTip.title,
    //     message: randomTip.message,
    //     type: 'system',
    //     priority: 'low',
    //     action_url: randomTip.action_url
    //   })
    // } catch (error) {
    //   console.error('Erro ao notificar dica de uso:', error)
    // }
  }, [user])

  // Notificar estatísticas semanais
  const notifyWeeklyStats = useCallback(async () => {
    if (!user) return

    // DESABILITADO - causava loop
    // try {
    //   await NotificationService.create({
    //     user_id: user.id,
    //     title: '📊 Resumo da semana',
    //     message: 'Veja suas estatísticas e performance desta semana.',
    //     type: 'system',
    //     priority: 'normal',
    //     action_url: '/dashboard'
    //   })
    // } catch (error) {
    //   console.error('Erro ao notificar estatísticas semanais:', error)
    // }
  }, [user])

  // Notificar promoções e ofertas
  const notifyPromotions = useCallback(async () => {
    if (!user) return

    const promotions = [
      {
        title: '🎯 Destaque seu perfil',
        message: 'Apareça primeiro nas buscas com nosso plano premium.',
        action_url: '/premium'
      },
      {
        title: '📈 Aumente sua visibilidade',
        message: 'Conquiste mais clientes com ferramentas profissionais.',
        action_url: '/premium'
      }
    ]

    const randomPromotion = promotions[Math.floor(Math.random() * promotions.length)]

    // DESABILITADO - causava loop
    // try {
    //   await NotificationService.create({
    //     user_id: user.id,
    //     title: randomPromotion.title,
    //     message: randomPromotion.message,
    //     type: 'system',
    //     priority: 'low',
    //     action_url: randomPromotion.action_url
    //   })
    // } catch (error) {
    //   console.error('Erro ao notificar promoções:', error)
    // }
  }, [user])

  // Executar notificações automáticas (REATIVADO COM CONTROLES)
  useEffect(() => {
    if (!user) return

    console.log('🔔 Sistema de notificações REATIVADO com controles de duplicação')
    
    // Executar notificações de sistema apenas uma vez
    const executeSystemNotifications = async () => {
      try {
        // Notificações de sistema removidas por solicitação
        // await notifyWelcome()
        // await notifyFirstLogin()
        
        console.log('✅ Sistema de notificações funcionando (notificações de sistema desabilitadas)')
      } catch (error) {
        console.error('❌ Erro ao executar notificações de sistema:', error)
      }
    }

    // Executar apenas uma vez quando o usuário fizer login
    executeSystemNotifications()
    
    return () => {
      console.log('🛑 Sistema de notificações parado')
    }
  }, [user])

  return {
    // SISTEMA COMPLETAMENTE DESABILITADO - SEM LOOPS
    // Todas as funcionalidades foram desabilitadas para evitar loops
  }
}
