import { useState, useEffect, useRef } from "react";
import { AppState, AppStateStatus, Platform, BackHandler } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useShareIntent } from "expo-share-intent";
import { extractFirstUrl, isFetchableUrl, parseUrlMetadata } from "../utils/metadataParser";

export interface IncomingShareResult {
  url: string;
  source: "share_intent" | "clipboard";
  platformName: string;
}

export function useIncomingShare(onAutoTriggerShare?: (share: IncomingShareResult) => void) {
  const [incomingShare, setIncomingShare] = useState<IncomingShareResult | null>(null);
  const [detectedClipboard, setDetectedClipboard] = useState<IncomingShareResult | null>(null);
  const lastProcessedUrlRef = useRef<string>("");
  const dismissedUrlsRef = useRef<Set<string>>(new Set());

  // 1. Native Share Intent handling (Android SEND Intent / iOS Share Extension)
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent({
    debug: false,
    resetOnBackground: true,
  });

  useEffect(() => {
    if (hasShareIntent) {
      const candidate =
        (shareIntent as any)?.value ||
        shareIntent?.text ||
        shareIntent?.webUrl ||
        "";
      if (candidate) {
        const extracted = extractFirstUrl(candidate);
        if (extracted && isFetchableUrl(extracted)) {
          const meta = parseUrlMetadata(extracted);
          const result: IncomingShareResult = {
            url: extracted,
            source: "share_intent",
            platformName: meta.platform,
          };
          setIncomingShare(result);
          onAutoTriggerShare?.(result);
          resetShareIntent();
        }
      }
    }
  }, [hasShareIntent, shareIntent]);

  // 2. Clipboard Auto-Detection on App Open / Foreground
  const checkClipboardForUrl = async () => {
    try {
      const hasString = await Clipboard.hasStringAsync();
      if (!hasString) return;

      const text = await Clipboard.getStringAsync();
      if (!text || text.trim() === lastProcessedUrlRef.current) return;

      const extracted = extractFirstUrl(text);
      if (
        extracted &&
        isFetchableUrl(extracted) &&
        !dismissedUrlsRef.current.has(extracted)
      ) {
        const meta = parseUrlMetadata(extracted);
        const result: IncomingShareResult = {
          url: extracted,
          source: "clipboard",
          platformName: meta.platform,
        };

        setDetectedClipboard(result);
        onAutoTriggerShare?.(result);
      }
    } catch {
      // Clipboard read error/permission denied - safely ignore
    }
  };

  useEffect(() => {
    // Check on initial load
    checkClipboardForUrl();

    // Check whenever app returns to active (e.g. user just switched from Instagram/TikTok/Threads)
    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "active") {
        checkClipboardForUrl();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const dismissDetectedClipboard = () => {
    if (detectedClipboard) {
      dismissedUrlsRef.current.add(detectedClipboard.url);
      lastProcessedUrlRef.current = detectedClipboard.url;
      setDetectedClipboard(null);
    }
  };

  const markUrlProcessed = (url: string) => {
    lastProcessedUrlRef.current = url;
    dismissedUrlsRef.current.add(url);
    setDetectedClipboard(null);
    setIncomingShare(null);
  };

  const returnToPreviousApp = () => {
    if (Platform.OS === "android") {
      // Minimizes SimpanIn so the previous app (Instagram/Threads/TikTok) is brought back immediately
      BackHandler.exitApp();
    }
  };

  return {
    incomingShare,
    detectedClipboard,
    dismissDetectedClipboard,
    markUrlProcessed,
    returnToPreviousApp,
    checkClipboardForUrl,
  };
}
