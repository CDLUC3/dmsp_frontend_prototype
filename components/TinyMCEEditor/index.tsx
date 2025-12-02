'use client';

import { useEffect, useRef, useState } from 'react';
import type { Editor as TinyMCEEditorType } from 'tinymce';
import { loadTinymceScript } from '@/utils/loadTinyMCE';
import EditorSkeleton from './EditorSkeleton';
import { createEditorConfig } from './tinyMCEConfig';
import styles from './tinyMCEEditor.module.scss';

// We need to reference "window.tinymce" but TypeScript doesn't know about it.
// This prevents "window.tinymce is undefined" runtime errors
// while still providing TypeScript type safety
declare global {
  interface Window {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    tinymce: any;
  }
}

interface TinyMCEEditorProps {
  content: string;
  setContent: (newContent: string) => void;
  onChange?: () => void; // Optional onChange prop for handling changes
  id: string;
  error?: string;
  labelId?: string;
  helpText?: string;
}

const TinyMCEEditor = ({ content, setContent, onChange, error, id, labelId, helpText }: TinyMCEEditorProps) => {
  const editorRef = useRef<TinyMCEEditorType | null>(null); // Update the type here
  const elementId = id || 'tiny-editor';
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    const initEditor = async () => {
      // Ensure tinymce library is available
      await loadTinymceScript();

      // Make sure previous instance is removed
      if (window.tinymce) {
        window.tinymce.remove(`#${elementId}`);
      }

      // Create configuration using shared config
      const editorConfig = createEditorConfig(elementId, content, setContent, onChange);

      // Initialize new editor with callback to set ref and ready state
      window.tinymce.init({
        ...editorConfig,
        init_instance_callback: (editor: TinyMCEEditorType) => {
          editorRef.current = editor;
          editor.setContent(content);
          setIsEditorReady(true);
        }
      });
    };

    // Initialize the editor
    initEditor();

    // Cleanup function when component unmounts
    return () => {
      if (window.tinymce) {
        window.tinymce.remove(`#${elementId}`);
      }
      editorRef.current = null;
      setIsEditorReady(false);
    };
  }, [elementId]); // Add isMounted to dependencies

  // Update editor content when content prop changes
  useEffect(() => {
    if (isEditorReady && editorRef.current && editorRef.current.getContent() !== content) {
      editorRef.current.setContent(content);
    }
  }, [content, isEditorReady]);

  return (
    <div className={styles['tinyMCE-editor-container']}>
      {!isEditorReady && <EditorSkeleton />}
      <div style={{ display: isEditorReady ? 'block' : 'none' }}>
        <textarea
          id={elementId}
          className={elementId}
          aria-label={id ?? 'Editor input area'}
          aria-labelledby={labelId ?? ''}
          aria-describedby={helpText ? `${elementId}-help-text` : ''}
          aria-invalid={error ? 'true' : 'false'}
          style={{ visibility: 'hidden' }
          }
        />
      </div>
      {error && <div className={`${styles['editor-help-text']} error-message`}>{error}</div>}
      {helpText && <div className={`${styles['editor-help-text']} help-text`}>{helpText}</div>}
    </div >
  );
}


export default TinyMCEEditor;