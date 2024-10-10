import React from 'react';

import './SectionHeaderEdit.scss';
import {Button} from "react-aria-components";

interface SectionHeaderEditProps {
  title: string;
  sectionNumber: number;
  editUrl: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const SectionHeaderEdit: React.FC<SectionHeaderEditProps> = ({
                                                           title,
                                                           sectionNumber,
                                                           editUrl,
                                                           onMoveUp,
                                                           onMoveDown
                                                         }) => {
  return (
    <div className="section-header">
      <h2 className="section-title">
        <span className="section-number">Section {sectionNumber}</span>
        {title}
      </h2>
      <div className="button-group">
        <a href={editUrl} className="edit-button">Edit section</a>
        <Button className="btn-default order-button" onPress={onMoveUp}
                aria-label="Move section up">↑
        </Button>
        <Button className="btn-default  order-button" onPress={onMoveDown}
                aria-label="Move section down">↓
        </Button>
      </div>
    </div>
  );
};

export default SectionHeaderEdit;
