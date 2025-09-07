'use client';

import { useEffect } from 'react';

export function MetaMaskErrorSuppressor() {
  useEffect(() => {
    // Suprimir erros específicos do MetaMask/Web3
    const originalError = console.error;
    
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      
      // Suprimir erros específicos do MetaMask
      if (
        errorMessage.includes('Cannot redefine property: ethereum') ||
        errorMessage.includes('evmAsk.js') ||
        errorMessage.includes('Could not establish connection')
      ) {
        // Não mostrar esses erros no console
        return;
      }
      
      // Mostrar outros erros normalmente
      originalError.apply(console, args);
    };

    // Suprimir erros não capturados do MetaMask
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.toString() || '';
      
      if (
        errorMessage.includes('Cannot redefine property: ethereum') ||
        errorMessage.includes('evmAsk.js') ||
        errorMessage.includes('Could not establish connection')
      ) {
        event.preventDefault();
        return;
      }
    };

    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || '';
      
      if (
        errorMessage.includes('Cannot redefine property: ethereum') ||
        errorMessage.includes('evmAsk.js') ||
        errorMessage.includes('Could not establish connection')
      ) {
        event.preventDefault();
        return;
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      // Restaurar console.error original
      console.error = originalError;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}
