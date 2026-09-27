export const createImageMarkdown = (
  fileName: string,
  altText?: string,
): string => {
  const alt = altText?.trim() || fileName;

  return `![${alt}](assets/${fileName})`;
};