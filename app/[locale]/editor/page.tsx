'use client';

import { useState } from 'react';
import TinyMCEEditor from '@/components/TinyMCEEditor';

export default function EditorPage() {
  const [content, setContent] = useState('<p>Hello, world!</p>');

  const handleEditorChange = (newContent) => {
    setContent(newContent);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">TinyMCE Editor Example</h1>

      <div className="mb-6">
        <TinyMCEEditor
          initialValue={content}
          onChange={handleEditorChange}
          height={400}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Editor Content:</h2>
        <div className="p-4 border rounded bg-gray-50">
          <pre className="whitespace-pre-wrap">{content}</pre>
        </div>
      </div>
    </div>
  );
}