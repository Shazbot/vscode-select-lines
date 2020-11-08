"use strict";
import * as vscode from "vscode";
import { window, Selection, Position } from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("extension.selectLines", async () => {
    let editor = vscode.window.activeTextEditor;

    if (!editor) {
      return;
    }

    let lineNumbersTemp = editor.options.lineNumbers;

    try {
      editor.options.lineNumbers = vscode.TextEditorLineNumbersStyle.Relative;

      let num_lines_as_string = (await window.showInputBox()) as string;
      let num_lines = parseInt(num_lines_as_string.trim(), 10);

      if (num_lines_as_string === "") {
        num_lines = 0;
      }

      if (isNaN(num_lines)) {
        return;
      }

      let reverseDirection = num_lines < 0;

      let currentLineNum = editor!.selection.active.line;
      if (reverseDirection) {
        let startLineNum = currentLineNum + num_lines;
        let startLine = editor!.document.lineAt(startLineNum);
        let start = startLine.range.start.character + startLine.firstNonWhitespaceCharacterIndex;
        let end = editor!.document.lineAt(currentLineNum).range.end.character;

        editor!.selection = new Selection(
          new Position(startLineNum, start),
          new Position(currentLineNum, end)
        );
      } else {
        let startLineNum = currentLineNum;
        let startLine = editor!.document.lineAt(startLineNum);
        let start =
          editor!.document.lineAt(currentLineNum).range.start.character +
          startLine.firstNonWhitespaceCharacterIndex;
        let end = editor!.document.lineAt(currentLineNum + num_lines).range.end.character;

        editor!.selection = new Selection(
          new Position(startLineNum, start),
          new Position(startLineNum + num_lines, end)
        );
      }
    } catch {
    } finally {
      vscode.window.activeTextEditor!.options.lineNumbers = lineNumbersTemp;
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
