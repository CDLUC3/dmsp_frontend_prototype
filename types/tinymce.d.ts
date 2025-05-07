/*Needed this for TinyMCEEditor because it doesn't know window.tinymce*/
declare global {
  interface Window {
    /*eslint-disable @typescript-eslint/no-explicit-any*/
    tinymce: any;
  }
}

export { };

