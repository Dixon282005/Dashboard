import fs from "fs";
import path from "path";


const logDir = path.join(process.cwd(), "src/server/logs");
fs.mkdirSync(logDir, { recursive: true });

// Archivo de trazas, si no existe se creara xd
const traceFile = path.join(logDir, "http_trace.jsonl");
if (!fs.existsSync(traceFile)) {
  fs.writeFileSync(traceFile, "", "utf8");
}

export function logTrace(entry) {
  try {
    fs.appendFileSync(traceFile, JSON.stringify(entry) + "\n", "utf8");
  } catch (err) {
    console.error("Error escribiendo log:", err);
  }
}
