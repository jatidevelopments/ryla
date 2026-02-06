'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Word {
  text: string;
  className?: string;
}

interface TypewriterEffectProps {
  words: Word[];
  className?: string;
  cursorClassName?: string;
}

export function TypewriterEffect({
  words,
  className,
  cursorClassName,
}: TypewriterEffectProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const currentWord = words[currentIndex]?.text ?? '';

  useEffect(() => {
    if (!currentWord) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < currentWord.length) {
            setDisplayText(currentWord.slice(0, displayText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex((i) => (i + 1) % words.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  }, [currentWord, displayText, isDeleting, words.length]);

  return (
    <span className={cn('inline', className)}>
      {words[currentIndex] && (
        <span className={words[currentIndex].className}>{displayText}</span>
      )}
      <span
        className={cn(
          'ml-0.5 inline-block h-[1em] w-[2px] animate-pulse bg-current',
          cursorClassName
        )}
        aria-hidden
      />
    </span>
  );
}
