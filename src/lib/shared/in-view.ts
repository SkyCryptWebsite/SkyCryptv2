import type { Attachment } from "svelte/attachments";

const callbacks = new WeakMap<Element, () => void>();
let observer: IntersectionObserver | undefined;

/** Calls `callback` once the element comes within 200px of the viewport. One observer is shared by every element. */
export function onceInView(callback: () => void): Attachment {
  return (element) => {
    observer ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          callbacks.get(entry.target)?.();
          callbacks.delete(entry.target);
          observer?.unobserve(entry.target);
        }
      },
      { rootMargin: "200px 0px" }
    );
    callbacks.set(element, callback);
    observer.observe(element);
    return () => {
      callbacks.delete(element);
      observer?.unobserve(element);
    };
  };
}
