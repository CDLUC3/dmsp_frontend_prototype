import React from 'react';

import {
  Remirror,
  useRemirror,
  useRemirrorContext,
  EditorComponent,
  useChainedCommands,
  useActive,
} from '@remirror/react';

import {
  EditorState,
  prosemirrorNodeToHtml,
} from '@remirror/core-utils';

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
import './Editor.scss';

import { DmpIcon } from '@/components/Icons';
import {
  Button,
  Group,
  Separator,
  ToggleButton,
  Toolbar,
  Form,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
} from 'react-aria-components';


const AnnotationButton: React.FC = () => {
  const { commands, getState } = useRemirrorContext({ autoUpdate: true });

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
    <Button onPress={handleAnnotation}>
      <DmpIcon icon="chat" />
    </Button>
  )
}


const TableGroup: React.FC = () => {
  const { commands } = useRemirrorContext({ autoUpdate: true });

  return (
    <Group aria-label="Table Tools">
      <MenuTrigger>
        <Button aria-label="Menu">
          <DmpIcon icon="table" />
        </Button>
        <Popover>
          <Menu>
            <MenuItem onAction={() => commands.createTable()}>Add Table</MenuItem>
            <Separator />
            <MenuItem onAction={() => commands.addTableColumnBefore()}>Add Column Left</MenuItem>
            <MenuItem onAction={() => commands.addTableColumnAfter()}>Add Column Right</MenuItem>
            <MenuItem onAction={() => commands.deleteTableColumn()}>Delete Column</MenuItem>
            <Separator />
            <MenuItem onAction={() => commands.addTableRowBefore()}>Add Row Above</MenuItem>
            <MenuItem onAction={() => commands.addTableRowAfter()}>Add Row Below</MenuItem>
            <MenuItem onAction={() => commands.deleteTableRow()}>Delete Row</MenuItem>
            <Separator />
            <MenuItem onAction={() => commands.deleteTable()}>Delete Table</MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>
    </Group>
  )
}


const EditorToolbar = () => {
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

      <TableGroup />

    </Toolbar>
  )
}


interface DmpEditorProps {
  content: string;
  setContent: (newContent: string) => void;
}

export function DmpEditor({content, setContent}: DmpEditorProps) {
  const { manager, state, setState } = useRemirror({
    extensions: () => [
      new BoldExtension({}),
      new ItalicExtension(),
      new UnderlineExtension({}),
      new LinkExtension({autoLink: true}),
      new BulletListExtension({}),
      new OrderedListExtension(),
      new TableExtension({}),
      new AnnotationExtension({}),
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

  const handleChange = (newState: EditorState) => {
    const html = prosemirrorNodeToHtml(newState.doc);
    setContent(html);
    setState(newState);
  }

  return (
    <div className="dmp-editor">
      <Remirror
        manager={manager}
        state={state}
        initialContent={state}
        onChange={({state}) => handleChange(state)}
      >
        <EditorToolbar />
        <EditorComponent />
      </Remirror>
    </div>
  )
}
