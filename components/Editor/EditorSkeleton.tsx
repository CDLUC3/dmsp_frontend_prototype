// EditorSkeleton.tsx
import React from 'react';
import './Editor.scss';

export const EditorSkeleton: React.FC = () => {
  return (
    <div className="skeleton">
      <div className="skeleton-toolbar">
        <div className="skeleton-button"></div>
        <div className="skeleton-button"></div>
        <div className="skeleton-button"></div>
      </div>
      <div className="skeleton-editor"></div>
    </div>
  );
};