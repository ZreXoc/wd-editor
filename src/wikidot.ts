import * as _ from 'lodash';
import { CancellationToken, editor, languages, Position } from 'monaco-editor';
import { range } from './util';

type InlineBlock = {
  close?: string | boolean;

  suggestion?: (
    model: editor.ITextModel,
    position: Position,
    context: languages.CompletionContext,
    token: CancellationToken
  ) => languages.CompletionItem | languages.CompletionItem[];
};

const inlineMarks = {
  bold: {
    mark: '**',
  },
  italic: {
    mark: '//',
  },
  underline: {
    mark: '__',
  },
  strikethrough: {
    mark: '--',
  },
};

export const completionItemProvider: languages.CompletionItemProvider = {
  provideCompletionItems(model, position) {
    let suggestions: Array<
      languages.CompletionItem | languages.CompletionItem[]
    > = [];
    const before = model.getValueInRange(range.l.before(model, position));
    const wordRange = range.w.c(model, position);
    const word = model.getValueInRange(wordRange);

    console.log(before, word);

    switch (before[before.length - 1]) {
      //blocks
      case '#': {
        suggestions.push(
          [
            [
              'color',
              '##${1:color}|${2:text}##',
              'change the size of the text',
            ],
            [
              'size',
              '[[size ${1:0.8}em]]${2:text}[[/size]]',
              'change the size of the text',
            ],
            ['h1', '\n+ ${1}', 'header one'],
            ['h2', '\n++ ', 'header two'],
            ['h3', '\n+++ ', 'header three'],
            ['h4', '\n++++ ', 'header four'],
            ['h5', '\n+++++ ', 'header five'],
            ['h6', '\n++++++ ', 'header six'],
            ['quote', '\n> ', 'quote'],
            [
              'collapsible',
              '[[collapsible show="+ ${1:show}" hide="- ${2:hide}"]]\n${3:inside}\n[[/collapsible]]',
              'collapsible block',
            ],
          ].map(([label, insertText, detail]) => {
            return {
              kind: languages.CompletionItemKind.Constant,
              range: wordRange,
              insertText,
              insertTextRules:
                languages.CompletionItemInsertTextRule.InsertAsSnippet,
              label,
              detail,
              additionalTextEdits: [
                {
                  range: {
                    ...wordRange,
                    startColumn: wordRange.startColumn - 1,
                    endColumn: wordRange.startColumn,
                  },
                  text: '',
                },
              ], //delete the character '#' before
            };
          })
        );
      }
    }

    if (before.endsWith('[[')) {
      //block:size
      suggestions.push({
        kind: languages.CompletionItemKind.Constant,
        range: wordRange,
        insertText: 'size ${1:0.8}em',
        insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
        label: 'size',
        detail: 'change the size of the text inside',
        /* additionalTextEdits: [
          {
            range: {
              ...wordRange,
              startColumn: model.getLineLastNonWhitespaceColumn(
                position.lineNumber
              ),
              endColumn: model.getLineLastNonWhitespaceColumn(
                position.lineNumber
              ),
            },
            text: '[[size]]',
          },
        ], */
      });

      if (before.search(/\[\[size\s+$/) > -1) {
        /*  TODO: not work   
    const textSize = word.match(/^[0-9]+/);

    if (textSize)
      return ['px', 'em'].map((s) => {
        return {
          insertText: textSize + s,
          kind: languages.CompletionItemKind.Unit,
          label: s,
          range: wordRange,
        };
      });
*/
        suggestions.push(
          ['xx-small', 'x-small', 'large', 'x-large', 'xx-large'].map((s) => {
            return {
              kind: languages.CompletionItemKind.Constant,
              range: wordRange,
              insertText: s,
              label: s,
            };
          })
        );
      }
    }

    return {
      suggestions: _.flatten(suggestions),
    };
  },
  triggerCharacters: ['[', '$', '#', '\n'],
};

export const WIKIDOT = {
  id: 'wikidot',
  inlineMarks,
};
