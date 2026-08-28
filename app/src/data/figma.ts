/** The design wall reads every shot exported from Figma. Files live in the
 *  shared asset folder as figma-01.jpg … figma-48.jpg. */
export const FIGMA_COUNT = 48;

export const figmaShots: string[] = Array.from(
  { length: FIGMA_COUNT },
  (_, i) => `figma/figma-${String(i + 1).padStart(2, '0')}.jpg`,
);
