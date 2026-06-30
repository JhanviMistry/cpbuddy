import * as vscode from "vscode";
import * as https from "https";
import * as http from "http";

export async function callApi(path: string, body: object): Promise<any> {
  const config = vscode.workspace.getConfiguration("cpbuddy");
  const baseUrl: string = config.get("apiUrl") ?? "http://localhost:8000";

  const url = new URL(path, baseUrl);
  const payload = JSON.stringify(body);

  return new Promise((resolve, reject) => {
    const lib = url.protocol === "https:" ? https : http;
    const req = lib.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`API error ${res.statusCode}: ${data}`));
          } else {
            try {
              resolve(JSON.parse(data));
            } catch {
              reject(new Error("Invalid JSON from API"));
            }
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}
