import { flushSync } from "react-dom";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => void;
};

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const runNavigationTransition = (update: () => void) => {
  const transitionDocument = document as ViewTransitionDocument;
  if (reducedMotion() || !transitionDocument.startViewTransition) {
    update();
    return;
  }

  transitionDocument.startViewTransition(() => {
    flushSync(update);
  });
};