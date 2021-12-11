import * as _ from 'lodash';
import { editor, languages } from 'monaco-editor';
import { completionItemProvider, listenKeyEvent, WIKIDOT } from './wikidot';
import './style.css';

const onEditorWillCreate = (element: HTMLElement) => {
  languages.register({
    id: WIKIDOT.id,
  });

  /**
   * auto closing inline styles, double square brackets
   */
  languages.setLanguageConfiguration(WIKIDOT.id, {
    autoClosingPairs: [
      { open: "'", close: "'" },
      { open: '"', close: '"' },
      { open: '[', close: ']' },
      { open: '{', close: '}' },
      { open: '“', close: '”' }, //Chinese double quote
      { open: '‘', close: '’' }, //Chinese single quote
      { open: '（', close: '）' }, //Chinese round bracket
      ..._.values(WIKIDOT.inlineMarks).map(({ mark }) => {
        return { open: mark, close: mark };
      }),
    ],
  });

  languages.registerCompletionItemProvider(WIKIDOT.id, completionItemProvider);
};

const onEditorDidCreate = (
  element: HTMLElement,
  instance: editor.IStandaloneCodeEditor
) => {
  listenKeyEvent(instance);
};

export const createEditor = (element: HTMLElement) => {
  onEditorWillCreate(element);
  const instance = editor.create(element, {
    language: WIKIDOT.id,
    wordWrap: 'on',
  });
  onEditorDidCreate(element, instance);
  return { instance };
};
