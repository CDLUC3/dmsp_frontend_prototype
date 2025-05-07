'use client';

import { useEffect, useRef } from 'react';

export default function TinyMCEEditor({
  initialValue = '',
  height = 500
}) {
  const editorRef = useRef(null);
  const elementId = 'tiny-editor';

  useEffect(() => {
    // Check if tinymce is available
    if (typeof window !== 'undefined' && window.tinymce) {
      const initEditor = async () => {
        // Make sure previous instance is removed
        window.tinymce.remove(`#${elementId}`);

        // Initialize new editor
        window.tinymce.init({
          license_key: 'gpl',
          promotion: false,// Removes TinyMCE promotional link
          branding: false, // removed the tinyMCE branding
          statusbar: false, //removes the bottom status bar because page flickers with every edit
          selector: `#${elementId}`,
          height,
          menubar: true,
          plugins: [
            'table',
            'code'
          ],
          toolbar: 'undo redo | formatselect | bold italic backcolor | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | removeformat | help',
          content_style: `
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300&display=swap');
          body { font-family: "Poppins", sans-serif; color:#393939;}
          `,
          init_instance_callback: (editor) => {
            editorRef.current = editor;
            editor.setContent(initialValue);

            // editor.on('Change', () => {
            //   onChange(editor.getContent());
            // });
          }
        });
      };

      initEditor();
    }

    // Cleanup function
    return () => {
      if (typeof window !== 'undefined' && window.tinymce) {
        window.tinymce.remove(`#${elementId}`);
      }
    };
  }, [initialValue, height]);

  return (
    <div>
      <textarea id={elementId} style={{ visibility: 'hidden' }} />
    </div>
  );
}