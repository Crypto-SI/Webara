'use client';

import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TypingAnimationProps {
  className?: string;
  parts: { text: string; className?: string }[];
}

export function TypingAnimation({ className, parts }: TypingAnimationProps) {
  const fullText = useMemo(() => parts.map((part) => part.text).join(''), [parts]);
  const [visibleCharacters, setVisibleCharacters] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (reduceMotion.matches) {
      setVisibleCharacters(fullText.length);
      return;
    }

    setVisibleCharacters(0);
  }, [fullText]);

  useEffect(() => {
    if (visibleCharacters >= fullText.length) return;

    const timer = setTimeout(() => {
      setVisibleCharacters((current) => current + 1);
    }, 85);

    return () => clearTimeout(timer);
  }, [fullText.length, visibleCharacters]);

  useEffect(() => {
    if (visibleCharacters < fullText.length) return;

    const timer = setTimeout(() => {
      setVisibleCharacters(0);
    }, 1800);

    return () => clearTimeout(timer);
  }, [fullText.length, visibleCharacters]);

  const renderedParts = parts.reduce<
    { text: string; className?: string; end: number }[]
  >((acc, part) => {
    const start = acc.at(-1)?.end ?? 0;
    const end = start + part.text.length;

    return [
      ...acc,
      {
        ...part,
        end,
        text: part.text.slice(0, Math.max(0, visibleCharacters - start)),
      },
    ];
  }, []);

  return (
    <span
      className={cn(className, 'inline-grid min-h-[1em]')}
      aria-label={fullText}
    >
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">
        {parts.map((part, index) => (
          <span key={index} className={part.className}>
            {part.text}
          </span>
        ))}
      </span>
      <span className="col-start-1 row-start-1" aria-hidden="true">
        {renderedParts.map((part, index) => (
          <span key={index} className={part.className}>
            {part.text}
          </span>
        ))}
        <span className="ml-1 inline-block h-[0.82em] w-[0.08em] translate-y-[0.08em] animate-pulse bg-foreground" />
      </span>
    </span>
  );
}
