import { editor, Position } from 'monaco-editor';

export const range = {
  /**
   * word
   */
  w: {
    /**
     * current word
     */
    c(model: editor.ITextModel, position: Position) {
      const word = model.getWordUntilPosition(position);
      return {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
    },
  },
  /**
   * ranges in current line
   */
  l: {
    before(model: editor.ITextModel, position: Position) {
      const word = model.getWordUntilPosition(position);
      return {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: 0,
        endColumn: word.startColumn,
      };
    },
  },
};
