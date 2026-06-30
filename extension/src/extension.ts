import * as vscode from "vscode";
import { CPBuddyPanel } from "./panel.ts";
import { callApi } from "./api.ts";

let hintCount = 0;

export function activate(context: vscode.ExtensionContext) {
  console.log("CPBuddy is active");

  const provider = new CPBuddyPanel(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("cpbuddy.sidebar", provider)
  );

  // Command: Detect Pattern
  context.subscriptions.push(
    vscode.commands.registerCommand("cpbuddy.analyse", async () => {
      const code = getActiveCode();
      if (!code) return;

      const language = getLanguage();
      provider.showLoading("Detecting pattern...");

      try {
        const result = await callApi("/api/analyse", { code, language });
        hintCount = 0;
        provider.showAnalysis(result);
      } catch (e: any) {
        vscode.window.showErrorMessage(`CPBuddy: ${e.message}`);
      }
    })
  );

  // Command: Get Hint
  context.subscriptions.push(
    vscode.commands.registerCommand("cpbuddy.hint", async () => {
      const code = getActiveCode();
      if (!code) return;

      const language = getLanguage();
      hintCount += 1;
      provider.showLoading("Thinking of a hint...");

      try {
        const result = await callApi("/api/hint", { code, language, hint_number: hintCount });
        provider.showHint(result, hintCount);
      } catch (e: any) {
        vscode.window.showErrorMessage(`CPBuddy: ${e.message}`);
      }
    })
  );
}

function getActiveCode(): string | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage("CPBuddy: Open a file with your solution first.");
    return null;
  }
  const selection = editor.selection;
  return selection.isEmpty
    ? editor.document.getText()
    : editor.document.getText(selection);
}

function getLanguage(): string {
  const editor = vscode.window.activeTextEditor;
  return editor?.document.languageId ?? "python";
}

export function deactivate() {}