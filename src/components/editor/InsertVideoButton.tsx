import React, { useRef } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { saveVideoToWorkspace } from '../../services/video/videoAssetService';
import { createVideoMarkdown } from '../../lib/markdown/videoMarkdown';

export const InsertVideoButton: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const insertTextAtCursor =
    useEditorStore((state) => state.insertTextAtCursor);

  const handleSelectVideo = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const fileName = await saveVideoToWorkspace(file);

      const markdown =
        createVideoMarkdown(fileName);

      insertTextAtCursor(
        '',
        '',
        `${markdown}\n`,
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'درج ویدئو انجام نشد.',
      );
    }

    event.target.value = '';
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,.mp4"
        className="hidden"
        onChange={handleSelectVideo}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded px-3 py-1.5 text-sm font-medium hover:bg-bg"
      >
        🎬 درج ویدئو
      </button>
    </>
  );
};