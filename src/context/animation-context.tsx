// src/context/animation-context.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

interface AnimationContextType {
  isAnimationVisible: boolean;
  isFadingOut: boolean;
  playAnimation: () => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(
  undefined
);

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [isAnimationVisible, setIsAnimationVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Only run this on the client
    if (typeof window !== 'undefined') {
      const hasPlayed = sessionStorage.getItem('hasIntroPlayed');
      if (!hasPlayed) {
        setIsAnimationVisible(true);
        sessionStorage.setItem('hasIntroPlayed', 'true');
      }
    }
  }, []);

  useEffect(() => {
    if (isAnimationVisible) {
      setIsFadingOut(false);
      const fadeOutTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 2000); // Animation duration

      const hideTimer = setTimeout(() => {
        setIsAnimationVisible(false);
      }, 2500); // Animation duration + fade out time

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isAnimationVisible]);

  const playAnimation = useCallback(() => {
    setIsAnimationVisible(true);
  }, []);

  const value = { isAnimationVisible, isFadingOut, playAnimation };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
}
