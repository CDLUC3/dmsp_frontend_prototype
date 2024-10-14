'use client';

import React from 'react';
import {Link} from "react-aria-components";


const TemplateListPage: React.FC = () => {
  return (
    <>
      <h1>Templates</h1>

      <Link href="/template/create">Create</Link>

      <p>
        List of templates here
      </p>

      <ul>
        <li>
          <Link href="/template/tpl_2525235">Template 1</Link>
        </li>

        <li>
          <Link href="/template/tpl_Ad525">Template 2</Link>
        </li>
      </ul>


    </>
  );
}

export default TemplateListPage;
