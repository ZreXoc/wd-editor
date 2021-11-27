import { CancellationToken, editor, languages, Position } from 'monaco-editor';
import { range } from './util';

type InlineBlock = {
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
    suggestion(model, position) {
      const before = model.getValueInRange(range.l.before(model, position));
      const wordRange = range.w.c(model, position);
      const word = model.getValueInRange(wordRange);

      if (before.endsWith('[['))
        return {
          insertText: 'size',
          kind: languages.CompletionItemKind.Constant,
          label: 'size',
          range: wordRange,
        };
      if (before.search(/\[\[size\s+$/) > -1) {
        const textSize = word.match(/^[0-9]+/);
        if (textSize) console.log(textSize);

        if (textSize)
          return ['px', 'em'].map((s) => {
            return {
              insertText: textSize + s,
              kind: languages.CompletionItemKind.Unit,
              label: s,
              range: wordRange,
            };
          });

        return ['xx-small', 'x-small', 'large', 'x-large', 'xx-large'].map(
          (s) => {
            return {
              insertText: s,
              kind: languages.CompletionItemKind.Constant,
              label: s,
              range: wordRange,
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
  inlineBlock,
};
