export const createVideoMarkdown = (
  fileName: string,
): string => {
  return `<video controls src="assets/${fileName}"></video>`;
};