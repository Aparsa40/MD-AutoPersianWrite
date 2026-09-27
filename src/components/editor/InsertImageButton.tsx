import React, { useRef } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { saveImageToWorkspace } from '../../services/image/imageAssetService';
import { createImageMarkdown } from '../../lib/markdown/imageMarkdown';

export const InsertImageButton: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const insertTextAtCursor =
    useEditorStore((state) => state.insertTextAtCursor);

  const handleSelectImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const fileName = await saveImageToWorkspace(file);

      const markdown =
        createImageMarkdown(fileName);

      insertTextAtCursor(
        '',
        '',
        `${markdown}\n`,
      );

    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'درج تصویر انجام نشد.',
      );
    }

    event.target.value = '';
  };


  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelectImage}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded px-3 py-1.5 text-sm font-medium hover:bg-bg"
      >
        🖼 درج تصویر
      </button>
    </>
  );
};