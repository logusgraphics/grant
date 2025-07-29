import { tokens } from '@/styles/tokens';

/**
 * Get the CSS classes for a tag color
 * @param color - The color identifier (e.g., 'purple', 'indigo')
 * @returns The CSS classes for the tag color
 */
export function getTagColorClasses(color: string): string {
  const tagColors = tokens.colors.tag as Record<string, string>;
  return tagColors[color] || tagColors.purple; // Default to purple if color not found
}

/**
 * Get all available tag colors
 * @returns Array of available color identifiers
 */
export function getAvailableTagColors(): string[] {
  return Object.keys(tokens.colors.tag);
}

/**
 * Check if a color is a valid tag color
 * @param color - The color identifier to check
 * @returns True if the color is valid
 */
export function isValidTagColor(color: string): boolean {
  return color in tokens.colors.tag;
}
