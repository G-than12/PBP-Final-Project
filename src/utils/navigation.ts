/**
 * Safely navigates back if there is a screen in history,
 * otherwise falls back to a default route (e.g. /home or /settings)
 * to prevent "The action 'GO_BACK' was not handled by any navigator" warnings.
 */
export function safeBack(
  router: {
    canGoBack: () => boolean;
    back: () => void;
    replace: (href: any) => void;
  },
  fallback: string = "/home"
) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
