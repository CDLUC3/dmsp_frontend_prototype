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
  AnnotationExtension,
  TableExtension,
} from 'remirror/extensions';

import 'remirror/styles/all.css';

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
    <Button onPress={handleAnnotation}> 💬 Comment </Button>
  )
}


const Menu = () => {
  const chain = useChainedCommands();
  const active = useActive();

  return (
    <Toolbar aria-label="Text formatting">
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
          <b>B</b>
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
          <i>I</i>
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
          <u>U</u>
        </ToggleButton>
      </Group>
      <Separator orientation="vertical" />
      <Group aria-label="Comments">
        <AnnotationButton />
      </Group>
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
