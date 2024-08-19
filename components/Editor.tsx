import React, {
  // ReactNode,
  useRef,
  // useEffect,
  // useState,
} from 'react';

import {
  Remirror,
  useRemirror,
  useRemirrorContext,
  EditorComponent,
  useChainedCommands,
  useActive,
} from '@remirror/react';

import {
  BoldExtension,
  ItalicExtension,
  UnderlineExtension,
  LinkExtension,
  BulletListExtension,
  OrderedListExtension,
  AnnotationExtension,
  TableExtension,
} from 'remirror/extensions';

import 'remirror/styles/all.css';

import { DmpIcon } from '/components/Icons';
import {
  Button,
  Group,
  Separator,
  ToggleButton,
  Toolbar
} from 'react-aria-components';


const AnnotationButton: React.FC = () => {
  const { helpers, commands, getState } = useRemirrorContext({ autoUpdate: true });

  const handleAnnotation = () => {
    const selectedText = getState().selection;

    if (selectedText) {
      const annotation = prompt('Enter your annotation:', '');
      if (annotation) {
        commands.addAnnotation({ text: selectedText, annotation });
      }
    }
  };

  return (
    <Button onPress={handleAnnotation}> 💬 </Button>
  )
}

// TODO: Finish this
const LinkButton: React.FC = () => {
  const { helpers, commands, getState } = useRemirrorContext({ autoUpdate: true });

  const handleLinkEdit = () => {
    const selectedText = getState().selection;
    console.log(selectedText);
    console.log('TODO: Open modal to create the link');
  }

  return (
      <Button
        aria-label="Link"
        onPress={handleLinkEdit}
      >
        Link
      </Button>
  )
}


const TableGroup: React.FC = () => {
  const chain = useChainedCommands();
  const { helpers, commands, getState } = useRemirrorContext({ autoUpdate: true });

  // TODO: Detect is the cursor is inside a table, and if so, show the expanded
  // table tools.

  return (
    <Group aria-label="Table Tools">
      <span className="toolbar-break"></span>
      <Button
        aria-label="Insert Table"
        title="Insert Table"
        onPress={() => {
          commands.createTable();
        }}
      >
        <DmpIcon icon="table" />
      </Button>

      <Button
        aria-label="Delete Table"
        title="Delete Table"
        onPress={() => {
          commands.deleteTable();
        }}
      >
        <DmpIcon icon="delete" />
        Table
      </Button>

      <Button
        aria-label="Add Column Left"
        title="Add Column Left"
        onPress={() => {
          commands.addTableColumnBefore();
        }}
      >
        <DmpIcon icon="add_column_left" />
      </Button>

      <Button
        aria-label="Add Column Right"
        title="Add Column Right"
        onPress={() => {
          commands.addTableColumnAfter();
        }}
      >
        <DmpIcon icon="add_column_right" />
      </Button>

      <Button
        aria-label="Delete Column"
        title="Delete Column"
        onPress={() => {
          commands.deleteTableColumn();
        }}
      >
        DC
      </Button>

      <Button
        aria-label="Add Row Above"
        title="Add Row Above"
        onPress={() => {
          commands.addTableRowBefore();
        }}
      >
        <DmpIcon icon="add_row_above" />
      </Button>

      <Button
        aria-label="Add Row Below"
        title="Add Row Below"
        onPress={() => {
          commands.addTableRowAfter();
        }}
      >
        <DmpIcon icon="add_row_below" />
      </Button>

      <Button
        aria-label="Delete Row"
        title="Delete Row"
        onPress={() => {
          commands.deleteTableRow();
        }}
      >
        <DmpIcon icon="variable_remove" />
      </Button>
    </Group>
  )
}


const Menu = () => {
  const chain = useChainedCommands();
  const active = useActive();

  return (
    <Toolbar aria-label="Editor Tools">
      <Group aria-label="Style">
        <ToggleButton
          aria-label="Bold"
          onPress={() => {
            chain
              .toggleBold()
              .focus()
              .run();
          }}
          isSelected={active.bold()}
        >
          <DmpIcon icon="format_bold" />
        </ToggleButton>
        <ToggleButton
          aria-label="Italic"
          onPress={() => {
            chain
              .toggleItalic()
              .focus()
              .run();
          }}
          isSelected={active.italic()}
        >
          <DmpIcon icon="format_italic" />
        </ToggleButton>
        <ToggleButton
          aria-label="Underline"
          onPress={() => {
            chain
              .toggleUnderline()
              .focus()
              .run();
          }}
          isSelected={active.underline()}
        >
          <DmpIcon icon="format_underlined" />
        </ToggleButton>

        <LinkButton />

      </Group>

      <Separator orientation="vertical" />

      <Group aria-label="Lists">
        <ToggleButton
          aria-label="Bullet List"
          onPress={() => {
            chain
              .toggleBulletList()
              .focus()
              .run();
          }}
          isSelected={active.bulletList()}
        >
          <DmpIcon icon="format_list_bulleted" />
        </ToggleButton>

        <ToggleButton
          aria-label="Number List"
          onPress={() => {
            chain
              .toggleOrderedList()
              .focus()
              .run();
          }}
          isSelected={active.orderedList()}
        >
          <DmpIcon icon="format_list_numbered" />
        </ToggleButton>
      </Group>

      <Separator orientation="vertical" />

      <Group aria-label="Comments">
        <AnnotationButton />
      </Group>

      <TableGroup />

    </Toolbar>
  )
}


interface DmpEditorProps {
  content: string;
}

export function DmpEditor({content}: DmpEditorProps) {
  const { manager, state, setState } = useRemirror({
    extensions: () => [
      new BoldExtension(),
      new ItalicExtension(),
      new UnderlineExtension(),
      new LinkExtension({autoLink: true}),
      new BulletListExtension(),
      new OrderedListExtension(),
      new TableExtension(),
      new AnnotationExtension(),
    ],

    content: content,

    // Place the cursor at the start of the document. This can also be set to
    // `end`, `all` or a numbered position.
    selection: 'start',

    // Set the string handler which means the content provided will be
    // automatically handled as html.
    // `markdown` is also available when the `MarkdownExtension`
    // is added to the editor.
    stringHandler: 'html',
  });

  return (
    <div className="dmp-editor">
      <Remirror
        manager={manager}
        state={state}
        initialContent={state}
        onChange={(parameter) => {
          setState(parameter.state);
        }}
      >
        <Menu />
        <EditorComponent />
        <CommentList />
      </Remirror>
    </div>
  )
}

const CommentList: React.FC = () => {
  const { manager, commands, helpers } = useRemirrorContext({autoUpdate: true});
  const comments = helpers.getAnnotations();

  return (
    <div>
      <h3>Comments</h3>
      <ul>
        {comments.map((comment, i) => (
          <li key={i}>
            <strong>TODO</strong>: "highlited text snippet ..." {comment.annotation}
          </li>
        ))}
      </ul>
    </div>
  );
};
