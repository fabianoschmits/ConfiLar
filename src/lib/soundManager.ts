/**
 * Gerenciador Central de Sons para Notificações
 * ConfiLar - Sound Manager
 */

import { NotificationSoundType, NOTIFICATION_SOUND_CONFIG, SoundPriority } from '@/types/sound'

interface SoundManagerOptions {
  enabled?: boolean
  volume?: number
  respectQuietHours?: boolean
}

class SoundManager {
  private static instance: SoundManager
  private audioContext: AudioContext | null = null
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private options: SoundManagerOptions = {
    enabled: true,
    volume: 0.7,
    respectQuietHours: true
  }
  private currentlyPlaying: Set<string> = new Set()

  private constructor() {
    if (typeof window !== 'undefined') {
      // Inicializar AudioContext na interação do usuário
      this.initializeAudioContext()
    }
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager()
    }
    return SoundManager.instance
  }

  private initializeAudioContext() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass()
      }
    } catch (error) {
      console.warn('AudioContext não suportado:', error)
    }
  }

  /**
   * Configurar opções do gerenciador de som
   */
  setOptions(options: Partial<SoundManagerOptions>) {
    this.options = { ...this.options, ...options }
  }

  /**
   * Obter opções atuais
   */
  getOptions(): SoundManagerOptions {
    return { ...this.options }
  }

  /**
   * Pré-carregar um som
   */
  preload(soundPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.sounds.has(soundPath)) {
        resolve()
        return
      }

      const audio = new Audio()
      audio.preload = 'auto'
      audio.volume = this.options.volume || 0.7

      audio.addEventListener('canplaythrough', () => {
        this.sounds.set(soundPath, audio)
        resolve()
      }, { once: true })

      audio.addEventListener('error', (error) => {
        // Silenciar erro 404 (arquivo não existe ainda)
        console.log(`⚠️ Som não encontrado: ${soundPath} (adicione o arquivo MP3)`)
        reject(error)
      }, { once: true })

      audio.src = soundPath
      audio.load()
    })
  }

  /**
   * Pré-carregar todos os sons padrão
   */
  async preloadAllSounds(): Promise<void> {
    const soundPaths = Object.values(NOTIFICATION_SOUND_CONFIG).map(
      config => config.defaultSound
    )

    const uniquePaths = [...new Set(soundPaths)]
    
    // Tentar carregar todos, mas não falhar se alguns não existirem
    const results = await Promise.allSettled(uniquePaths.map(path => this.preload(path)))
    
    const loaded = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    
    if (loaded > 0) {
      console.log(`✅ ${loaded} sons pré-carregados com sucesso`)
    }
    
    if (failed > 0) {
      console.log(`⚠️ ${failed} sons não encontrados (adicione os arquivos MP3 em public/sounds/)`)
    }
  }

  /**
   * Tocar um som
   */
  async play(
    soundPath: string, 
    options?: { 
      volume?: number
      loop?: boolean
      priority?: SoundPriority
    }
  ): Promise<void> {
    if (!this.options.enabled) {
      console.log('🔇 Sons desabilitados, não tocando')
      return
    }

    // Respeitar horário silencioso
    if (this.options.respectQuietHours && this.isQuietHours()) {
      console.log('🌙 Horário silencioso, não tocando')
      return
    }

    console.log(`🔊 [SoundManager] Tentando tocar: ${soundPath}`)

    try {
      let audio = this.sounds.get(soundPath)

      if (!audio) {
        // Se não estiver pré-carregado, carregar agora
        console.log(`📥 [SoundManager] Som não pré-carregado, carregando: ${soundPath}`)
        try {
          await this.preload(soundPath)
          audio = this.sounds.get(soundPath)
        } catch (preloadError) {
          console.error(`❌ [SoundManager] Erro ao pré-carregar som: ${soundPath}`, preloadError)
          return
        }
      }

      if (!audio) {
        console.warn(`⚠️ [SoundManager] Som não encontrado: ${soundPath}`)
        return // Falhar silenciosamente
      }

      // Se já estiver tocando, reiniciar
      if (this.currentlyPlaying.has(soundPath)) {
        console.log(`🔄 [SoundManager] Som já tocando, reiniciando: ${soundPath}`)
        audio.currentTime = 0
      }

      // Configurar volume
      const volume = options?.volume ?? this.options.volume ?? 0.7
      audio.volume = Math.max(0, Math.min(1, volume))
      console.log(`🔊 [SoundManager] Volume configurado: ${volume}`)

      // Configurar loop
      audio.loop = options?.loop ?? false

      // Marcar como tocando
      this.currentlyPlaying.add(soundPath)

      // Tocar o som
      console.log(`▶️ [SoundManager] Reproduzindo som: ${soundPath}`)
      const playPromise = audio.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`✅ [SoundManager] Som iniciado com sucesso: ${soundPath}`)
          })
          .catch(error => {
            console.error(`❌ [SoundManager] Erro ao tocar som: ${soundPath}`, error)
            this.currentlyPlaying.delete(soundPath)
            
            // Se erro é por falta de interação do usuário, avisar
            if (error.name === 'NotAllowedError') {
              console.warn('⚠️ [SoundManager] Som bloqueado! Usuário precisa interagir com a página primeiro.')
            }
          })
      }

      // Remover da lista quando terminar
      audio.onended = () => {
        console.log(`🏁 [SoundManager] Som finalizado: ${soundPath}`)
        this.currentlyPlaying.delete(soundPath)
      }

    } catch (error) {
      console.error(`❌ [SoundManager] Erro geral ao tocar som: ${soundPath}`, error)
    }
  }

  /**
   * Tocar som de notificação por tipo
   */
  async playNotificationSound(
    type: NotificationSoundType,
    customVolume?: number
  ): Promise<void> {
    const config = NOTIFICATION_SOUND_CONFIG[type]
    
    if (!config) {
      console.warn(`⚠️ Tipo de notificação desconhecido: ${type}, usando som genérico`)
      // Fallback para som genérico
      await this.play('/sounds/notification-soft.mp3', {
        volume: customVolume,
        priority: 'normal'
      })
      return
    }

    console.log(`🔊 Tocando som para notificação tipo: ${type}`)
    await this.play(config.defaultSound, {
      volume: customVolume,
      priority: config.priority
    })
  }

  /**
   * Parar um som específico
   */
  stop(soundPath: string) {
    const audio = this.sounds.get(soundPath)
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      this.currentlyPlaying.delete(soundPath)
    }
  }

  /**
   * Parar todos os sons
   */
  stopAll() {
    this.sounds.forEach((audio, path) => {
      audio.pause()
      audio.currentTime = 0
      this.currentlyPlaying.delete(path)
    })
  }

  /**
   * Ajustar volume global
   */
  setVolume(volume: number) {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    this.options.volume = clampedVolume
    
    // Atualizar volume de todos os sons carregados
    this.sounds.forEach(audio => {
      audio.volume = clampedVolume
    })
  }

  /**
   * Ativar/desativar sons
   */
  setEnabled(enabled: boolean) {
    this.options.enabled = enabled
    
    // Se desativado, parar todos os sons
    if (!enabled) {
      this.stopAll()
    }
  }

  /**
   * Verificar se está em horário silencioso
   */
  private isQuietHours(): boolean {
    // Implementar lógica de horário silencioso
    // Por enquanto, retorna false (não está em horário silencioso)
    return false
  }

  /**
   * Limpar todos os sons da memória
   */
  cleanup() {
    this.stopAll()
    this.sounds.clear()
    this.currentlyPlaying.clear()
  }

  /**
   * Verificar se um som está tocando
   */
  isPlaying(soundPath: string): boolean {
    return this.currentlyPlaying.has(soundPath)
  }

  /**
   * Obter lista de sons tocando atualmente
   */
  getCurrentlyPlaying(): string[] {
    return Array.from(this.currentlyPlaying)
  }
}

// Exportar instância singleton
export const soundManager = SoundManager.getInstance()

// Exportar classe para testes
export { SoundManager }

