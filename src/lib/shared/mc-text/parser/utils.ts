/**
 * Base color code regex This regex matches Minecraft formatting codes. It captures the § character followed by a
 * hexadecimal digit or formatting letter.
 *
 * @example
 *   const regex = /([§][0-9a-fA-FklmnorKLMNOR])/g;
 *   const str = "§aGreen §lBold";
 *   const matches = str.match(regex); // ["§a", "§l"]
 *
 * @returns {RegExp} The regex to match Minecraft's formatting codes.
 * @see {@link https://minecraft.wiki/w/Formatting_codes}
 */
export const BASE_FORMATTING_CODE_REGEX: RegExp = /([§][0-9a-fA-FklmnorKLMNOR])/g;

/**
 * Replace all HTML special characters with HTML entities Prevents HTML injection by safely encoding special characters
 *
 * @example
 *   htmlStringFormatting("Hello <world> & 'everyone'"); // "Hello &lt;world&gt; &amp; &#39;everyone&#39;"
 *
 * @param text The text to format.
 * @returns The formatted HTML string with special characters replaced.
 */
export function htmlStringFormatting(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  return (
    text
      // First handle & character, but avoid breaking existing HTML entities
      // Use negative lookahead to prevent double-encoding existing HTML entities
      .replace(/&(?!(?:amp|lt|gt|quot|#39|#x[0-9A-Fa-f]+|#[0-9]+);)/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      // Convert newlines to HTML line breaks
      .replace(/\n/g, "<br/>")
      // Replace spaces with non-breaking spaces
      // This fixes issues with text decoration like strikethrough not applying correctly as spaces are invisible characters, so we need to replace them with their HTML entity which will make them visible and allow text decoration to apply correctly
      .replace(
        / /g,
        // \u00A0 is &nsbp;
        "\u00A0"
      )
  );
}

/**
 * Generate a random number within a specified range. This function generates a random integer between the specified
 * minimum and maximum values, inclusive.
 *
 * @example
 *   randomRange(1, 10); // Returns a random integer between 1 and 10, inclusive.
 *
 * @param {number} min - The minimum value of the range.
 * @param {number} max - The maximum value of the range.
 */
export function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
