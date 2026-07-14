import { MAX_ENCHANTS } from "$lib/shared/constants/enchantments";
import { colorCodes, extras, type ColorCodes, type FormattingCodes } from "$lib/shared/mc-text/parser/styleLibrary";
import { BASE_FORMATTING_CODE_REGEX, htmlStringFormatting } from "$lib/shared/mc-text/parser/utils";

/**
 * Convert Minecraft text to html.
 *
 * This function parses Minecraft-style formatting codes (like §a, §l, §r) and converts them
 * to HTML with appropriate CSS classes and inline styles. It handles:
 * - Color codes (§a-§f, §0-§9) - converted to CSS color values
 * - Formatting codes (§l bold, §o italic, §n underline, etc.) - converted to CSS classes
 * - Reset codes (§r resets all, §f resets formatting only)
 * - Special rainbow enchantment animation for max-level enchants with blue color
 * - Animation delays for the rainbow effect based on the index parameter
 *
 * @param mcString The Minecraft text string to convert. (e.g. "§aHello §bWorld")
 * @param breakLine Whether to add a line break at the end of the string.
 * @param index Optional index for animation delay calculation
 * @returns The HTML to render.
 */
export default function mcTextToHTML(...args: [{ mcString: string; breakLine?: boolean; index?: number }]): string {
  const [{ mcString, breakLine = true, index: loreIndex }] = args;

  const normalizeEnchantText = (text: string): string => text.trim().replace(/^[,.;:!?]+|[,.;:!?]+$/g, "");
  const resetClasses = extras["§r"];

  // Split the mc text string by formatting codes (§a, §b, etc.) and filter out empty strings
  // This creates an array where formatting codes and text alternate
  const codeSplit: string[] = mcString.split(BASE_FORMATTING_CODE_REGEX).filter((item) => item !== "");

  // Track current CSS classes to apply (bold, italic, etc.)
  let classList: string[] = [];
  // Track current color as CSS color value
  let colorVar: string | undefined;
  let lastColorVar: string | undefined;
  // Accumulate the final HTML string
  let resultHTML: string = "";
  // Flag to check if we should apply rainbow color effect (triggered by §9 blue color code)
  let shouldRainbowColorCheck = false;
  // Flag to check if current text contains max-level enchantments (for special rainbow effect)
  let shouldRainbowEnchantedCheck = false;
  let isPostResetObfuscated = false;

  const isResetOnlyState = (): boolean =>
    classList.length === resetClasses.length &&
    classList.every((className, classIndex) => className === resetClasses[classIndex]);

  codeSplit.forEach((item: string, index: number) => {
    const mcTextStringToLowerCase = item.toLowerCase();
    const isColorCode = Object.hasOwn(colorCodes, mcTextStringToLowerCase);
    const isFormattingCode = Object.hasOwn(extras, mcTextStringToLowerCase);
    // Check if current item is a color code (§a, §b, etc.)
    if (isColorCode) {
      // Colors reset formatting, formatting codes dont reset anything
      classList = [];

      colorVar = colorCodes[mcTextStringToLowerCase as ColorCodes];
      lastColorVar = colorVar;

      switch (mcTextStringToLowerCase) {
        // §f (white) acts as a reset for all formatting except color
        case "§f":
          classList = [];
          shouldRainbowColorCheck = false;
          break;
        // §9 (blue) enables rainbow color checking for enchanted items
        case "§9":
          shouldRainbowColorCheck = true;
          break;
        default:
          break;
      }
      isPostResetObfuscated = false;
    }
    // Check if current item is a formatting code (§l bold, §o italic, etc.) or reset (§r)
    else if (isFormattingCode) {
      if (mcTextStringToLowerCase === "§r") {
        // §r resets everything - color and formatting
        colorVar = undefined;
        classList = resetClasses;
        isPostResetObfuscated = false;
      } else {
        const resetOnlyState = isResetOnlyState();
        isPostResetObfuscated =
          resetOnlyState && mcTextStringToLowerCase === "§k" && !colorVar && Boolean(lastColorVar);
        if (resetOnlyState) {
          classList = [];
        }
        // Apply formatting styles (bold, italic, underline, etc.)
        classList.push(...extras[mcTextStringToLowerCase as FormattingCodes]);
      }
    }
    // Current item is actual text content, not a formatting code
    else {
      const shouldUseLastColorAfterResetForObfuscated =
        !colorVar &&
        classList.includes("obfuscated") &&
        Boolean(lastColorVar) &&
        (classList.includes("text-inherit") || isPostResetObfuscated);
      const effectiveColorVar = shouldUseLastColorAfterResetForObfuscated ? lastColorVar : colorVar;
      // Escape HTML characters to prevent XSS attacks and display properly
      const textContent: string = item !== "" ? htmlStringFormatting(item) : item;
      classList = classList.filter((className) => className !== "lore-enchantment");

      // Check if the text contains max-level enchantments (for special rainbow effect)
      shouldRainbowEnchantedCheck = MAX_ENCHANTS.has(normalizeEnchantText(item));

      // Only create HTML elements for non-empty text content
      if (textContent !== "") {
        const spanEl = document.createElement("span");
        let classesToApply = classList;

        // Apply color styling if a color is set
        if (effectiveColorVar) spanEl.style.color = effectiveColorVar;

        // Special case: Apply rainbow enchantment effect when both conditions are met:
        // 1. Blue color code (§9) was encountered (shouldRainbowColorCheck)
        // 2. Text contains max-level enchantments (shouldRainbowEnchantedCheck)
        if (shouldRainbowColorCheck && shouldRainbowEnchantedCheck) {
          classesToApply = [...classList, "lore-enchantment"];
          // Add animation delay for lore items (creates a typewriter effect)
          if (loreIndex) spanEl.style.animationDelay = `${index * loreIndex * 2}ms`;
        }

        // Apply all accumulated CSS classes (bold, italic, enchantment effects, etc.)
        if (classesToApply.length) spanEl.classList.add(...classesToApply);
        spanEl.innerHTML = textContent;

        // Add the span element to our result HTML
        resultHTML += spanEl.outerHTML;
        isPostResetObfuscated = false;
      }
    }
  });

  // Add a line break at the end if specified
  if (breakLine) {
    const brEl = document.createElement("br");
    resultHTML += brEl.outerHTML;
  }

  return resultHTML;
}
