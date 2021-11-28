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

const inlineStyle = {
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

const inlineBlock: {
  [key: string]: InlineBlock;
} = {
  size: {
    close: '[[/size]]',
    suggestion(model, position) {
      const before = model.getValueInRange(range.l.before(model, position));
      const wordRange = range.w.c(model, position);
      // const word = model.getValueInRange(wordRange);

      if (before.endsWith('[['))
        return {
          kind: languages.CompletionItemKind.Constant,
          range: wordRange,
          insertText: 'size ${1:0.8}em',
          insertTextRules:
            languages.CompletionItemInsertTextRule.InsertAsSnippet,
          label: 'size',
          detail: 'change the size of the text inside',
          additionalTextEdits: [
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
              text: inlineBlock.size.close + '',
            },
          ],
        };

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
        return ['xx-small', 'x-small', 'large', 'x-large', 'xx-large'].map(
          (s) => {
            return {
              kind: languages.CompletionItemKind.Constant,
              range: wordRange,
              insertText: s,
              label: s,
            };
          }
        );
      }
    },
  },
};

export const WIKIDOT = {
  id: 'wikidot',
  inlineStyle,
  inlineBlock: inlineBlock,
};
