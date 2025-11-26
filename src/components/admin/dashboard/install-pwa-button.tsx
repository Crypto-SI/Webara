'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useSimpleAuth } from '@/contexts/auth-context-simple';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function InstallPwaButton() {
  const { loading, isAdmin } = useSimpleAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      const mediaStandalone = window.matchMedia?.('(display-mode: standalone)').matches;
      const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
      setIsInstalled(mediaStandalone || iosStandalone);
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    checkInstalled();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', checkInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', checkInstalled);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      setIsPrompting(true);
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    } finally {
      setIsPrompting(false);
    }
  }, [deferredPrompt]);

  if (isInstalled || !deferredPrompt) {
    return null;
  }

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleInstallClick}
      disabled={isPrompting}
      className="w-full xs:w-auto sm:w-auto"
    >
      {isPrompting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Install app
    </Button>
  );
}
