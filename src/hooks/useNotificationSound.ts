"use client";

/**
 * Hook React para Gerenciar Sons de Notificações
 * ConfiLar - useNotificationSound
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { NotificationSoundType } from "@/types/sound";
import { soundManager } from "@/lib/soundManager";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface SoundPreferences {
  enabled: boolean;
  volume: number;
  respect_quiet_hours: boolean;
  custom_sounds: Record<string, string>;
}

interface UseNotificationSoundReturn {
  playSound: (
    type: NotificationSoundType,
    customVolume?: number,
  ) => Promise<void>;
  playSoundByPath: (path: string, volume?: number) => Promise<void>;
  stopSound: (path: string) => void;
  stopAllSounds: () => void;
  setVolume: (volume: number) => void;
  setEnabled: (enabled: boolean) => void;
  isEnabled: boolean;
  volume: number;
  isPlaying: (path: string) => boolean;
  preferences: SoundPreferences | null;
  updatePreferences: (prefs: Partial<SoundPreferences>) => Promise<void>;
  loading: boolean;
}

export function useNotificationSound(): UseNotificationSoundReturn {
  const { user } = useAuthContext();
  const [preferences, setPreferences] = useState<SoundPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);
  const [volume, setVolumeState] = useState(0.7);
  const preloadedRef = useRef(false);

  // Carregar preferências do usuário
  const loadPreferences = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Tentar carregar preferências do banco
      const { data, error } = await supabase
        .from("notification_preferences")
        .select(
          "sound_enabled, sound_volume, respect_quiet_hours, custom_sounds",
        )
        .eq("user_id", user.id)
        .single();

      // Se erro (colunas não existem, usuário não tem preferências, ou erro 406/403), usar padrões
      if (error) {
        // Tratar erros 406 e 403 como "não encontrado" - usar padrões
        // Não logar esses erros - são esperados quando a tabela/colunas não existem ou há RLS
        const isExpectedError =
          error.code === "PGRST116" ||
          error.code === "PGRST301" ||
          error.message?.includes("406") ||
          error.message?.includes("403") ||
          error.message?.includes("Not Acceptable") ||
          error.message?.includes("Forbidden") ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist");

        if (!isExpectedError) {
          // Apenas logar erros inesperados
          console.log(
            "⚠️ Erro inesperado ao carregar preferências de som:",
            error,
          );
        }
        // Silenciar erros esperados - usar padrões silenciosamente
        const defaultPrefs: SoundPreferences = {
          enabled: true,
          volume: 0.7,
          respect_quiet_hours: true,
          custom_sounds: {},
        };
        setPreferences(defaultPrefs);
        setIsEnabled(true);
        setVolumeState(0.7);

        // Configurar o sound manager com padrões
        soundManager.setOptions({
          enabled: true,
          volume: 0.7,
          respectQuietHours: true,
        });
      } else {
        const prefs: SoundPreferences = {
          enabled: data?.sound_enabled ?? true,
          volume: data?.sound_volume ?? 0.7,
          respect_quiet_hours: data?.respect_quiet_hours ?? true,
          custom_sounds: data?.custom_sounds ?? {},
        };
        setPreferences(prefs);
        setIsEnabled(prefs.enabled);
        setVolumeState(prefs.volume);

        // Configurar o sound manager
        soundManager.setOptions({
          enabled: prefs.enabled,
          volume: prefs.volume,
          respectQuietHours: prefs.respect_quiet_hours,
        });
      }
    } catch (error) {
      console.log("⚠️ Erro ao carregar preferências, usando padrões:", error);
      // Usar padrões em caso de erro
      const defaultPrefs: SoundPreferences = {
        enabled: true,
        volume: 0.7,
        respect_quiet_hours: true,
        custom_sounds: {},
      };
      setPreferences(defaultPrefs);
      setIsEnabled(true);
      setVolumeState(0.7);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Pré-carregar sons na inicialização (silenciosamente)
  useEffect(() => {
    if (!preloadedRef.current) {
      // Não pré-carregar automaticamente para evitar erros 404
      // Os sons serão carregados sob demanda quando tocarem
      preloadedRef.current = true;
    }
  }, []);

  // Carregar preferências quando o usuário logar
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Função para tocar som por tipo de notificação
  const playSound = useCallback(
    async (type: NotificationSoundType, customVolume?: number) => {
      if (!isEnabled) return;

      try {
        await soundManager.playNotificationSound(type, customVolume ?? volume);
      } catch (error) {
        console.error("Erro ao tocar som:", error);
      }
    },
    [isEnabled, volume],
  );

  // Função para tocar som por caminho
  const playSoundByPath = useCallback(
    async (path: string, customVolume?: number) => {
      if (!isEnabled) return;

      try {
        await soundManager.play(path, {
          volume: customVolume ?? volume,
        });
      } catch (error) {
        console.error("Erro ao tocar som:", error);
      }
    },
    [isEnabled, volume],
  );

  // Parar um som específico
  const stopSound = useCallback((path: string) => {
    soundManager.stop(path);
  }, []);

  // Parar todos os sons
  const stopAllSounds = useCallback(() => {
    soundManager.stopAll();
  }, []);

  // Ajustar volume
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    soundManager.setVolume(clampedVolume);
  }, []);

  // Ativar/desativar sons
  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    soundManager.setEnabled(enabled);
  }, []);

  // Verificar se um som está tocando
  const isPlaying = useCallback((path: string): boolean => {
    return soundManager.isPlaying(path);
  }, []);

  // Atualizar preferências no banco de dados
  const updatePreferences = useCallback(
    async (newPrefs: Partial<SoundPreferences>) => {
      if (!user?.id) return;

      try {
        const updatedPrefs = {
          ...preferences,
          ...newPrefs,
        };

        // Tentar atualizar no banco (pode falhar se colunas não existem)
        try {
          const { error } = await supabase
            .from("notification_preferences")
            .update({
              sound_enabled: updatedPrefs.enabled,
              sound_volume: updatedPrefs.volume,
              respect_quiet_hours: updatedPrefs.respect_quiet_hours,
              custom_sounds: updatedPrefs.custom_sounds,
            })
            .eq("user_id", user.id);

          if (error) {
            console.log(
              "⚠️ Não foi possível salvar no banco (colunas não existem ainda):",
              error.message,
            );
          }
        } catch (dbError) {
          console.log(
            "⚠️ Preferências salvas apenas localmente (execute o SQL primeiro)",
          );
        }

        // Atualizar estado local independente do resultado do banco
        setPreferences(updatedPrefs);

        if (newPrefs.enabled !== undefined) {
          setIsEnabled(newPrefs.enabled);
          soundManager.setEnabled(newPrefs.enabled);
        }

        if (newPrefs.volume !== undefined) {
          setVolumeState(newPrefs.volume);
          soundManager.setVolume(newPrefs.volume);
        }

        if (newPrefs.respect_quiet_hours !== undefined) {
          soundManager.setOptions({
            respectQuietHours: newPrefs.respect_quiet_hours,
          });
        }
      } catch (error) {
        console.log("⚠️ Erro ao salvar preferências:", error);
      }
    },
    [user?.id, preferences],
  );

  return {
    playSound,
    playSoundByPath,
    stopSound,
    stopAllSounds,
    setVolume,
    setEnabled,
    isEnabled,
    volume,
    isPlaying,
    preferences,
    updatePreferences,
    loading,
  };
}
