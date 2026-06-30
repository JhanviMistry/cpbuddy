import * as vscode from "vscode";

export class CPBuddyPanel implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this._getBase();

    webviewView.webview.onDidReceiveMessage((msg) => {
      if (msg.command === "analyse") vscode.commands.executeCommand("cpbuddy.analyse");
      if (msg.command === "hint") vscode.commands.executeCommand("cpbuddy.hint");
    });
  }

  showLoading(message: string) {
    this._view?.webview.postMessage({ type: "loading", message });
  }

  showAnalysis(data: any) {
    this._view?.webview.postMessage({ type: "analysis", data });
  }

  showHint(data: any, hintNumber: number) {
    this._view?.webview.postMessage({ type: "hint", data, hintNumber });
  }

  private _getBase(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: var(--vscode-font-family);
    font-size: 13px;
    color: var(--vscode-foreground);
    background: var(--vscode-sideBar-background);
    padding: 12px;
    line-height: 1.5;
  }
  h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--vscode-descriptionForeground); margin-bottom: 10px; }
  .btn {
    width: 100%;
    padding: 7px 12px;
    margin-bottom: 6px;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    text-align: left;
  }
  .btn:hover { background: var(--vscode-button-hoverBackground); }
  .btn-secondary {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
  }
  .btn-secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }
  .card {
    background: var(--vscode-editor-background);
    border: 1px solid var(--vscode-widget-border);
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 10px;
  }
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 6px;
  }
  .badge-high { background: #1a4731; color: #4ec994; }
  .badge-medium { background: #3d3000; color: #e8b800; }
  .badge-low { background: #3d1a1a; color: #f47c7c; }
  .pattern { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
  .explanation { color: var(--vscode-descriptionForeground); font-size: 12px; margin-bottom: 10px; }
  .edge-list { list-style: none; }
  .edge-list li { padding: 3px 0; font-size: 12px; }
  .edge-list li::before { content: "⚠ "; color: #e8b800; }
  .hint-box {
    background: var(--vscode-textBlockQuote-background);
    border-left: 3px solid var(--vscode-textLink-foreground);
    padding: 8px 10px;
    border-radius: 0 4px 4px 0;
    font-size: 12px;
    margin-bottom: 10px;
    font-style: italic;
  }
  .loading { color: var(--vscode-descriptionForeground); font-size: 12px; padding: 8px 0; }
  .divider { border: none; border-top: 1px solid var(--vscode-widget-border); margin: 12px 0; }
  #welcome { color: var(--vscode-descriptionForeground); font-size: 12px; padding: 6px 0 12px; }
</style>
</head>
<body>
<h2>CPBuddy</h2>
<p id="welcome">Open your LeetCode solution, then run an analysis or ask for a hint.</p>

<button class="btn" onclick="send('analyse')">⚡ Detect Pattern</button>
<button class="btn btn-secondary" onclick="send('hint')">💡 Give Me a Hint</button>

<hr class="divider">
<div id="output"></div>

<script>
  const vscode = acquireVsCodeApi();
  function send(command) { vscode.postMessage({ command }); }

  window.addEventListener('message', e => {
    const { type, data, message, hintNumber } = e.data;
    const out = document.getElementById('output');

    if (type === 'loading') {
      out.innerHTML = '<p class="loading">⏳ ' + message + '</p>';
      return;
    }

    if (type === 'analysis') {
      const conf = data.confidence || 'medium';
      out.innerHTML = \`
        <div class="card">
          <span class="badge badge-\${conf}">\${conf} confidence</span>
          <div class="pattern">\${data.pattern}</div>
          <div class="explanation">\${data.explanation}</div>
          <h2 style="margin-bottom:6px">Edge cases to check</h2>
          <ul class="edge-list">
            \${data.edge_cases.map(e => '<li>' + e + '</li>').join('')}
          </ul>
        </div>
      \`;
    }

    if (type === 'hint') {
      const prev = out.innerHTML.includes('hint-box') ? out.innerHTML : '';
      out.innerHTML = \`
        <div class="hint-box">Hint #\${hintNumber}: \${data.hint}</div>
        \${data.should_reveal_more ? '<p style="font-size:11px;color:var(--vscode-descriptionForeground)">You\'ve had 3+ hints — consider checking the editorial.</p>' : ''}
        \${prev}
      \`;
    }
  });
</script>
</body>
</html>`;
  }
}
