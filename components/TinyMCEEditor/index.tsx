'use client';

import { useEffect, useRef, useState } from 'react';
import type { Editor as TinyMCEEditorType } from 'tinymce';
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
  id?: string;
  error?: string;
  labelId?: string;
  helpText?: string;
}

const TinyMCEEditor = ({ content, setContent, error, id, labelId, helpText }: TinyMCEEditorProps) => {
  const editorRef = useRef<TinyMCEEditorType | null>(null); // Update the type here
  const elementId = id || 'tiny-editor';
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    const initEditor = async () => {
      // Make sure previous instance is removed
      window.tinymce.remove(`#${elementId}`);

      // Initialize new editor
      window.tinymce.init({
        license_key: 'gpl',
        promotion: false,// Removes TinyMCE promotional link
        branding: false, // removed the tinyMCE branding
        statusbar: false, //removes the bottom status bar
        selector: `#${elementId}`,
        menubar: false,
        max_height: 400,
        min_height: 200,
        plugins: [
          'autoresize',
          'table',
        ],
        toolbar: 'undo redo | formatselect | bold italic backcolor | ' +
          'alignleft aligncenter alignright alignjustify | ' +
          'bullist numlist outdent indent | removeformat | help | table',
        content_style: `
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
          body { font-family: "Poppins", sans-serif; color:#393939;};
          `,
        init_instance_callback: (editor: TinyMCEEditorType) => {
          editorRef.current = editor;
          editor.setContent(content);
          setIsEditorReady(true);

          editor.on('Change', () => {
            setContent(editor.getContent());
          });
        }
      });
    };

    // Initialize the editor
    initEditor();

    // Cleanup function when component unmounts
    return () => {
      window.tinymce.remove(`#${elementId}`);
      editorRef.current = null;
      setIsEditorReady(false);

    };
  }, [elementId]);

  // Update editor content when content prop changes
  useEffect(() => {
    if (isEditorReady && editorRef.current && editorRef.current.getContent() !== content) {
      editorRef.current.setContent(content);
    }
  }, [content, isEditorReady]);

  return (
    <div className={styles['tinyMCE-editor-container']}>
      <textarea
        id={elementId}
        aria-label={id ?? 'Editor input area'}
        aria-labelledby={labelId ?? ''}
        aria-describedby={helpText ? `${elementId}-help-text` : ''}
        aria-invalid={error ? 'true' : 'false'}
        style={{ visibility: 'hidden' }
        }
      />
      {error && <div className={`${styles['editor-help-text']} error-message`}>{error}</div>}
      {helpText && <div className={`${styles['editor-help-text']} help-text`}>{helpText}</div>}
    </div >
  );
}


export default TinyMCEEditor;