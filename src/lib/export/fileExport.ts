/**
 * دانلود متن به صورت یک فایل محلی با پسوند تعیین شده
 */
export const downloadFile = (
  content: string,
  filename: string,
  mimeType: string = 'text/markdown;charset=utf-8;',
) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * خروجی مارک‌داون اصلی
 */
export const exportAsMarkdown = (content: string, filename: string) => {
  const validFilename = filename.endsWith('.md') ? filename : `${filename}.md`;
  downloadFile(content, validFilename);
};
