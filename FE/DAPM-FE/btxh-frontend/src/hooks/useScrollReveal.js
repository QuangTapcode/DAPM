import { useEffect, useRef } from 'react';

/**
 * Attach to any element to trigger entrance animation when it scrolls into view.
 *
 * Pattern:
 *  1. On mount: adds `.will-animate` — CSS hides the element
 *  2. When in viewport: adds `.is-visible` — CSS restores it with transition
 *
 * This means elements are fully visible before JS loads (SSR / no-JS safe),
 * and screenshots in headless environments without scrolling show content normally.
 *
 * CSS classes: reveal, reveal--left, reveal--right, reveal--scale, reveal-stagger
 */
export function useScrollReveal({ threshold = 0.12, once = true, rootMargin = '0px 0px -40px 0px' } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Step 1: opt this element into animations
    el.classList.add('will-animate');

    // Step 2: observe and reveal when in view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.classList.remove('is-visible');
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  return ref;
}
