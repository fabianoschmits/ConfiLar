'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Componente de transição de página - OTIMIZADO
export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

// Componente de transição de lista - OTIMIZADO
export const ListTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, staggerChildren: 0.05 }}
    >
      {children}
    </motion.div>
  );
};

// Item de lista com animação - OTIMIZADO
export const ListItem: React.FC<{ children: React.ReactNode; index?: number }> = ({ 
  children, 
  index = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.15, 
        delay: index * 0.03,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
};

// Componente de fade in - OTIMIZADO
export const FadeIn: React.FC<{ 
  children: React.ReactNode; 
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}> = ({ 
  children, 
  delay = 0, 
  duration = 0.2,
  direction = 'up'
}) => {
  const getDirection = () => {
    switch (direction) {
      case 'up':
        return { y: 10 };
      case 'down':
        return { y: -10 };
      case 'left':
        return { x: 10 };
      case 'right':
        return { x: -10 };
      default:
        return { y: 10 };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...getDirection() }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        duration, 
        delay,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
};

// Componente de slide in - OTIMIZADO
export const SlideIn: React.FC<{ 
  children: React.ReactNode; 
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
}> = ({ 
  children, 
  direction = 'left',
  delay = 0
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { x: -30 };
      case 'right':
        return { x: 30 };
      case 'up':
        return { y: -30 };
      case 'down':
        return { y: 30 };
      default:
        return { x: -30 };
    }
  };

  return (
    <motion.div
      initial={{ ...getInitialPosition(), opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ 
        duration: 0.25, 
        delay,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
};

// Componente de escala - OTIMIZADO
export const ScaleIn: React.FC<{ 
  children: React.ReactNode; 
  delay?: number;
  duration?: number;
}> = ({ 
  children, 
  delay = 0,
  duration = 0.15
}) => {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        duration, 
        delay,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
};

// Componente de hover com elevação - OTIMIZADO
export const HoverCard: React.FC<{ 
  children: React.ReactNode;
  className?: string;
}> = ({ 
  children, 
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      whileHover={{ 
        y: -3,
        scale: 1.01,
        transition: { duration: 0.1 }
      }}
      whileTap={{ scale: 0.99 }}
    >
      {children}
    </motion.div>
  );
};

// Componente de loading com skeleton - OTIMIZADO
export const LoadingSkeleton: React.FC<{ 
  lines?: number;
  className?: string;
}> = ({ 
  lines = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          className="h-4 bg-gray-200 rounded animate-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: 0.2, 
            delay: index * 0.03,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        />
      ))}
    </div>
  );
};

// Componente de transição de estado - OTIMIZADO
export const StateTransition: React.FC<{ 
  children: React.ReactNode;
  isVisible: boolean;
  duration?: number;
}> = ({ 
  children, 
  isVisible,
  duration = 0.15
}) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook para animações baseadas em scroll
export const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return { ref: setRef, isVisible };
};

// Componente que anima quando entra no viewport - OTIMIZADO
export const ScrollAnimate: React.FC<{ 
  children: React.ReactNode;
  threshold?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}> = ({ 
  children, 
  threshold = 0.1,
  direction = 'up'
}) => {
  const { ref, isVisible } = useScrollAnimation(threshold);

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0, 
        ...(direction === 'up' ? { y: 20 } : 
            direction === 'down' ? { y: -20 } :
            direction === 'left' ? { x: 20 } : { x: -20 })
      }}
      animate={isVisible ? { 
        opacity: 1, 
        x: 0, 
        y: 0 
      } : {}}
      transition={{ 
        duration: 0.2, 
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
};




