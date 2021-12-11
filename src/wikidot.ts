import * as _ from 'lodash';
import {
  CancellationToken,
  editor,
  KeyCode,
  languages,
  Position,
} from 'monaco-editor';
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
  superscript: {
    mark: '^^',
  },
  subscript: {
    mark: ',,',
  },
  raw: {
    mark: '@@',
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
            ['link', '[[[${1:link} ${2:text}]]]'],
            [
              'image',
              '[[include component:image-block name=${1:source} |caption=${2:description}]]',
            ],
            [
              'collapsible',
              '[[collapsible show="+ ${1:show}" hide="- ${2:hide}"]]\n${3:inside}\n[[/collapsible]]',
              'collapsible block',
            ],
            ['note', '[[note]]${1:note}[[/note]]'],
            ['code', '[[code]]${1:code}[[/code]]'],
            ['span', '[[span]]${1:text}[[/span]]'],
            ['div', '[[div]]${1:text}[[/div]]'],
            ['html', '[[html]]${1:html}[[/html]]'],
            [
              'invisible',
              '[!-- ${1:invisible comment} --]',
              'the words inside will not be seen',
            ],
            [
              'pinyin',
              '[[span class="ruby"]]${1:拼音或其他文字标示}[[span class="rt"]]${2:Pīnyīn huò qítā wénzì biāoshì}[[/span]][[/span]]',
              'pinyin or other text markings',
            ],
            ['keycap', '[[span class="keycap"]]${1:Ctrl}[[/span]]'],
            ['user', '[[user ${1:username}]]'],
            [
              'tab view',
              '[[tabview]]\n[[tab ${1:晓（あかつき）}]]\n${2:text}\n[[/tab]]\n[[/tabview]]\n',
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

export const listenKeyEvent = (instance: editor.IStandaloneCodeEditor) => {
  //listen enter
  instance.onKeyDown((e) => {
    if (!e.equals(KeyCode.Enter)) return;

    const selection = instance.getSelection();
    const currentLine = instance
      .getModel()
      .getLineContent(instance.getPosition().lineNumber);

    //http://www.wikidot.com/doc-wiki-syntax:block-quotes
    //http://www.wikidot.com/doc-wiki-syntax:lists
    const matchQuote = currentLine.match(/^(>+\s)|(\s*(\*|#)\s)/);
    if (matchQuote && !currentLine.endsWith('\\')) {
      e.preventDefault();
      instance.executeEdits('keyListener', [
        {
          range: selection,
          text: `\n${matchQuote[0]}`,
          forceMoveMarkers: true,
        },
      ]);
      return;
    }
  });
};

export const WIKIDOT = {
  id: 'wikidot',
  inlineMarks,
};
