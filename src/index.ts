import * as _ from 'lodash';
import { editor, languages } from 'monaco-editor';
import { WIKIDOT } from './conf';
import './style.css';

const element = document.getElementById('wd-editor');

languages.register({
  id: WIKIDOT.id,
});

/**
 * auto closing inline styles, double square brackets
 */
languages.setLanguageConfiguration(WIKIDOT.id, {
  autoClosingPairs: [
    { open: '[[', close: ']]' },
    { open: '##', close: '##' },
    ..._.values(WIKIDOT.inlineStyle).map(({ mark }) => {
      return { open: mark, close: mark };
    }),
  ],
});

/**
 * auto complete inline blocks
 */
languages.registerCompletionItemProvider(WIKIDOT.id, {
  provideCompletionItems(model, position, context, token) {
    const suggestions = _.values(WIKIDOT.inlineBlock)
      .filter((v) => v.suggestion)
      .map(({ suggestion }) => suggestion(model, position, context, token))
      .filter((s) => s);

    console.log(suggestions, _.flatten(suggestions));

    return {
      suggestions: _.flatten(suggestions),
    };
  },
  triggerCharacters: ['[', ' ', '\n'],
});

const monacoInstance = editor.create(element, {
  language: WIKIDOT.id,
});
