'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TypingAnimationProps {
  className?: string;
  parts: { text: string; className?: string }[];
}

export function TypingAnimation({ className, parts }: TypingAnimationProps) {
  const [partIndex, setPartIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [renderedParts, setRenderedParts] = useState<
    { text: string; className?: string }[]
  >([]);

  useEffect(() => {
    if (partIndex >= parts.length) return;

    const currentPart = parts[partIndex];
    const typingSpeed = 100;

    const timer = setTimeout(() => {
      setRenderedParts((prev) => {
        const newParts = [...prev];
        if (newParts.length <= partIndex) {
          newParts.push({ text: '', className: currentPart.className });
        }
        newParts[partIndex].text = currentPart.text.substring(0, charIndex + 1);
        return newParts;
      });

      if (charIndex + 1 < currentPart.text.length) {
        setCharIndex(charIndex + 1);
      } else {
        setPartIndex(partIndex + 1);
        setCharIndex(0);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [partIndex, charIndex, parts]);

  return (
    <h1 className={cn(className, 'min-h-[1em] h-auto')}>
      {renderedParts.map((part, index) => (
        <span key={index} className={part.className}>
          {part.text}
        </span>
      ))}
      {partIndex < parts.length && (
        <span className="inline-block w-1 bg-foreground animate-pulse ml-1" />
      )}
    </h1>
  );
}
