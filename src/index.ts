import * as _ from 'lodash';
import { editor, languages } from 'monaco-editor';
import { completionItemProvider, WIKIDOT } from './wikidot';
import './style.css';

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

export const createEditor = (element: HTMLElement) => {
  return editor.create(element, {
    language: WIKIDOT.id,
  });
};
