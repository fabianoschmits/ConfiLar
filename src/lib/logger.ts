/**
 * Sistema de Logging Condicional
 * Logs aparecem apenas em desenvolvimento
 * Em produção, são suprimidos para melhor performance e segurança
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogOptions {
  context?: string;
  data?: any;
  error?: Error;
}

class Logger {
  private isDevelopment: boolean;
  private isClient: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.isClient = typeof window !== "undefined";
  }

  /**
   * Debug: Informações detalhadas para debugging
   * Apenas em desenvolvimento
   */
  debug(
    message: string,
    contextOrOptions?: string | LogOptions,
    data?: any,
  ): void {
    if (!this.isDevelopment) return;

    // Suportar tanto formato antigo (3 args) quanto novo (2 args)
    const options =
      typeof contextOrOptions === "string"
        ? { context: contextOrOptions, data }
        : contextOrOptions;

    const prefix = this.getPrefix("debug", options?.context);
    console.debug(prefix, message, options?.data || "");
  }

  /**
   * Info: Informações gerais do fluxo
   * Apenas em desenvolvimento
   */
  info(
    message: string,
    contextOrOptions?: string | LogOptions,
    data?: any,
  ): void {
    if (!this.isDevelopment) return;

    // Suportar tanto formato antigo (3 args) quanto novo (2 args)
    const options =
      typeof contextOrOptions === "string"
        ? { context: contextOrOptions, data }
        : contextOrOptions;

    const prefix = this.getPrefix("info", options?.context);
    console.info(prefix, message, options?.data || "");
  }

  /**
   * Warn: Avisos que não quebram a aplicação
   * Aparece em desenvolvimento E produção (importante monitorar)
   */
  warn(
    message: string,
    contextOrOptions?: string | LogOptions,
    data?: any,
  ): void {
    // Suportar tanto formato antigo (3 args) quanto novo (2 args)
    const options =
      typeof contextOrOptions === "string"
        ? { context: contextOrOptions, data }
        : contextOrOptions;

    const prefix = this.getPrefix("warn", options?.context);
    console.warn(prefix, message, options?.data || "");

    // Em produção, poderia enviar para serviço de monitoramento
    if (!this.isDevelopment) {
      this.sendToMonitoring("warn", message, options);
    }
  }

  /**
   * Error: Erros críticos
   * SEMPRE aparece (desenvolvimento E produção)
   */
  error(
    message: string,
    contextOrOptions?: string | LogOptions | Error,
    data?: any,
  ): void {
    // Suportar múltiplos formatos
    let options: LogOptions | undefined;

    if (contextOrOptions instanceof Error) {
      options = { error: contextOrOptions, data };
    } else if (typeof contextOrOptions === "string") {
      options = { context: contextOrOptions, data };
    } else {
      options = contextOrOptions;
    }

    const prefix = this.getPrefix("error", options?.context);
    console.error(prefix, message, options?.error || options?.data || "");

    // Em produção, enviar para serviço de monitoramento
    if (!this.isDevelopment) {
      this.sendToMonitoring("error", message, options);
    }
  }

  /**
   * Success: Operações bem-sucedidas
   * Apenas em desenvolvimento
   */
  success(message: string, options?: LogOptions): void {
    if (!this.isDevelopment) return;

    const prefix = this.getPrefix("success", options?.context);
    console.log(prefix, `✅ ${message}`, options?.data || "");
  }

  /**
   * Group: Agrupar logs relacionados
   * Apenas em desenvolvimento
   */
  group(label: string, callback: () => void): void {
    if (!this.isDevelopment) {
      callback();
      return;
    }

    console.group(`📦 ${label}`);
    callback();
    console.groupEnd();
  }

  /**
   * Table: Mostrar dados em formato tabela
   * Apenas em desenvolvimento
   */
  table(data: any): void {
    if (!this.isDevelopment) return;
    console.table(data);
  }

  /**
   * Time: Medir performance
   * Apenas em desenvolvimento
   */
  time(label: string): void {
    if (!this.isDevelopment) return;
    console.time(label);
  }

  timeEnd(label: string): void {
    if (!this.isDevelopment) return;
    console.timeEnd(label);
  }

  /**
   * Prefixo colorido baseado no nível
   */
  private getPrefix(level: LogLevel | "success", context?: string): string {
    const timestamp = new Date().toLocaleTimeString("pt-BR");
    const ctx = context ? `[${context}]` : "";

    const emojis = {
      debug: "🔍",
      info: "ℹ️",
      warn: "⚠️",
      error: "❌",
      success: "✅",
    };

    return `${emojis[level]} ${timestamp} ${ctx}`.trim();
  }

  /**
   * Enviar para serviço de monitoramento em produção
   * Placeholder - implementar integração com Sentry, LogRocket, etc
   */
  private sendToMonitoring(
    level: LogLevel,
    message: string,
    options?: LogOptions,
  ): void {
    // Em produção, integrar com serviço de monitoramento
    // Exemplos: Sentry, LogRocket, Bugsnag, DataDog

    if (this.isClient && window.navigator.sendBeacon) {
      // Enviar de forma assíncrona sem bloquear
      try {
        const payload = JSON.stringify({
          level,
          message,
          context: options?.context,
          data: options?.data,
          error: options?.error?.message,
          stack: options?.error?.stack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        });

        // Placeholder - substituir por endpoint real de monitoramento
        // navigator.sendBeacon('/api/logs', payload)
      } catch (e) {
        // Falha silenciosa para não quebrar a aplicação
      }
    }
  }
}

// Exportar instância singleton
export const logger = new Logger();

// Exportar helpers individuais para facilitar uso
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const success = logger.success.bind(logger);
export const group = logger.group.bind(logger);
export const table = logger.table.bind(logger);
export const time = logger.time.bind(logger);
export const timeEnd = logger.timeEnd.bind(logger);

// Exportar classe para uso avançado
export { Logger };
export default logger;
