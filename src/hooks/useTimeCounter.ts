'use client'

import { useState, useEffect, useCallback } from 'react'

interface TimeCounterResult {
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
  formattedTime: string
}

export function useTimeCounter(targetDate: string | Date | null): TimeCounterResult {
  const [timeLeft, setTimeLeft] = useState<TimeCounterResult>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    formattedTime: '00:00:00'
  })

  const calculateTimeLeft = useCallback(() => {
    if (!targetDate) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        formattedTime: '00:00:00'
      }
    }

    const now = new Date().getTime()
    const target = new Date(targetDate).getTime()
    const difference = target - now

    if (difference <= 0) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        formattedTime: '00:00:00'
      }
    }

    const hours = Math.floor(difference / (1000 * 60 * 60))
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((difference % (1000 * 60)) / 1000)

    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

    return {
      hours,
      minutes,
      seconds,
      isExpired: false,
      formattedTime
    }
  }, [targetDate])

  useEffect(() => {
    // Calcular tempo inicial
    setTimeLeft(calculateTimeLeft())

    // Configurar intervalo para atualizar a cada segundo
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(interval)
  }, [calculateTimeLeft])

  return timeLeft
}
