import { randomRange } from "$lib/shared/mc-text/parser/utils";
import type { Attachment } from "svelte/attachments";
import { MediaQuery } from "svelte/reactivity";

// Respect user's accessibility preferences
const prefersReducedMotion = new MediaQuery("(prefers-reduced-motion: reduce)");

/**
 * Svelte attachment that creates a scrambled text animation effect for obfuscated text. This mimics Minecraft's
 * obfuscated text formatting (§k) by continuously randomizing the characters while preserving the original text length
 * and structure.
 *
 * @see {@link https://svelte.dev/docs/svelte/@attach}
 */
export const animateObfuscatedText: Attachment = (element) => {
  // Exit early if user prefers reduced motion for accessibility
  if (prefersReducedMotion.current) return;

  // Track the animation frame ID so we can cancel it later
  let obfuscatedAnimationRequestID: number = 0;

  function animateFrame() {
    // Find all elements with the "obfuscated" class and animate their text content
    element.querySelectorAll(".obfuscated").forEach((text) => {
      // Create a TreeWalker to traverse only text nodes within the obfuscated element
      // This allows us to modify text content while preserving HTML structure
      const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT, null);

      // Iterate through each text node
      while (walker.nextNode()) {
        // Only process text nodes that have actual content (not just whitespace)
        if (walker.currentNode.nodeValue?.trim()) {
          let randomString: string = "";

          // Generate random characters for each character in the original text
          // This preserves the length and spacing of the original text
          for (let x = 0; x < walker.currentNode.nodeValue.length; x++) {
            // Generate random ASCII characters in range 64-95 (@A-Z[\]^_)
            // This range includes uppercase letters and some symbols, mimicking Minecraft
            randomString += String.fromCharCode(randomRange(64, 95));
          }

          // Replace the original text with scrambled characters
          walker.currentNode.nodeValue = randomString;
        }
      }
    });

    // Continue the animation loop unless user prefers reduced motion
    // Check again in case the preference changed during runtime
    if (!prefersReducedMotion.current) {
      obfuscatedAnimationRequestID = window.requestAnimationFrame(animateFrame);
    }
  }

  // Start the animation loop
  animateFrame();

  // Return cleanup function - Svelte will call this when the element is removed
  // This prevents memory leaks and unnecessary animation frames
  return () => {
    if (obfuscatedAnimationRequestID) window.cancelAnimationFrame(obfuscatedAnimationRequestID);
    obfuscatedAnimationRequestID = 0;
  };
};
