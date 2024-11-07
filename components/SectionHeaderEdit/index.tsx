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

  const UpArrowIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 15L12 9L6 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const DownArrowIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );


  return (
    <div className="section-header">
      <h2 className="section-title">
        <span className="section-number">Section {sectionNumber} </span>
        {title}
      </h2>
      <div className="button-group">
        <a href={editUrl} className="edit-button">Edit section</a>
        <Button className="btn-default order-button" onPress={onMoveUp}
                aria-label="Move section up">
          <UpArrowIcon/>
        </Button>
        <Button className="btn-default  order-button" onPress={onMoveDown}
                aria-label="Move section down">
          <DownArrowIcon/>
        </Button>
      </div>
    </div>
  );
};

export default SectionHeaderEdit;
