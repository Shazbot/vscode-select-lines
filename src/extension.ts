"use strict";
import * as vscode from "vscode";
import { InlineInput } from "./inline-input";
import { Selection, Position } from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("extension.selectLines", () => {
    let editor = vscode.window.activeTextEditor;

    if (!editor) {
      return;
    }

    let lineNumbersTemp = vscode.window.activeTextEditor!.options.lineNumbers;
    vscode.window.activeTextEditor!.options.lineNumbers = vscode.TextEditorLineNumbersStyle.Relative;

    new InlineInput()
      .show(editor, v => v)
      .then(async (value: string) => {
        if (!value) {
          return;
        }

        let reverseDirection = false;
        if (value === "-") {
          reverseDirection = true;
          value = String(
            await new InlineInput().show(editor!, v => v).then((value: string) => {
              return value;
            })
          );

          if (!value) {
            return;
          }
        }

        let num_lines = Number(value);

        if (num_lines && num_lines > 0) {
          let currentLineNum = editor!.selection.active.line;
          if (reverseDirection) {
            let startLineNum = currentLineNum - num_lines;
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
        }
      })
      .then(() => {
        vscode.window.activeTextEditor!.options.lineNumbers = lineNumbersTemp;
      })
      .catch(() => {
        vscode.window.activeTextEditor!.options.lineNumbers = lineNumbersTemp;
      });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
