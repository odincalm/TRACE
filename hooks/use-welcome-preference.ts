import { useCallback, useEffect, useState } from "react";

import { readWelcomePreference, writeWelcomePreference } from "@/lib/preferences";

export function useWelcomePreference() {
  const [ready, setReady] = useState(false);
  const [dontShowAgain, setDontShowAgainState] = useState(false);
  const [dismissedForSession, setDismissedForSession] = useState(false);

  useEffect(() => {
    let mounted = true;
    readWelcomePreference().then((value) => {
      if (!mounted) return;
      setDontShowAgainState(value);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const setDontShowAgain = useCallback(async (value: boolean) => {
    setDontShowAgainState(value);
    await writeWelcomePreference(value);
  }, []);

  const dismiss = useCallback(() => setDismissedForSession(true), []);

  return {
    ready,
    dontShowAgain,
    setDontShowAgain,
    dismiss,
    shouldShow: ready && !dontShowAgain && !dismissedForSession,
  };
}
