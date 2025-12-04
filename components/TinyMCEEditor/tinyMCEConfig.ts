// utils/tinymceConfig.ts
import type { Editor as TinyMCEEditorType } from 'tinymce';

// Base configuration that's shared across all editors
export const BASE_TINYMCE_CONFIG = {
  license_key: 'gpl',
  promotion: false,
  branding: false,
  statusbar: false,
  link_title: false,
  base_url: '/tinymce',
  suffix: '.min',
  menubar: false,
  max_height: 400,
  min_height: 100,
  popup_container: 'body',
  plugins: [
    'autoresize',
    'table',
    'lists',
    'link'
  ],
  toolbar: 'formatselect | bold italic forecolor backcolor | ' +
    'alignleft aligncenter alignright | ' +
    'bullist numlist | ' +
    'link unlink | table',
  default_link_target: '_blank',
  link_target_list: [
    { title: 'New window', value: '_blank' },
    { title: 'Current window', value: '_self' },
  ],
  content_style: `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
    body { font-family: "Poppins", sans-serif; color:#393939;};
  `,
};

// Helper function to create editor-specific config
export const createEditorConfig = (
  elementId: string,
  content: string,
  setContent: (content: string) => void,
  onChange?: () => void
) => ({
  ...BASE_TINYMCE_CONFIG,
  selector: `#${elementId}`,
  setup: (editor: TinyMCEEditorType) => {
    editor.on('Change KeyUp Input Blur', () => {
      setContent(editor.getContent());
      onChange?.();

      // Close all remaining open menus when content changes
      const openMenus = document.querySelectorAll('.tox-pop, .tox-menu, .tox-toolbar__overflow');
      openMenus.forEach(menu => {
        (menu as HTMLElement).style.display = 'none';
      });
    });
  },
  init_instance_callback: (editor: TinyMCEEditorType) => {
    editor.setContent(content);
  }
});