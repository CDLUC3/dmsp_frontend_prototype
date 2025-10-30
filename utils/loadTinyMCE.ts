
let tinymceLoadPromise: Promise<void> | null = null;

export function loadTinymceScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.tinymce) return Promise.resolve();
  if (tinymceLoadPromise) return tinymceLoadPromise;

  tinymceLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="/tinymce/tinymce.min.js"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load TinyMCE script')));
      return;
    }

    const script = document.createElement('script');
    script.src = '/tinymce/tinymce.min.js';
    script.referrerPolicy = 'origin';
    script.async = true;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('Failed to load TinyMCE script')));
    document.head.appendChild(script);
  });

  return tinymceLoadPromise;
}