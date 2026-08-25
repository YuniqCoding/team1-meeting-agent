#!/usr/bin/env node
/**
 * verify 칸 담당자를 실제로 부르는 자리.
 *
 *   받는 것 : 화면에서 넘어온 글 한 덩어리 (파일 경로 인자 또는 표준입력)
 *   내놓을 것 : 그 글을 verify 담당자가 처리한 결과 (표준출력)
 *
 * 지시문은 .claude/agents/verify.md 의 역할 지시문을 그대로 쓴다.
 * 열쇠는 팀 폴더 맨 위 .env 의 ANTHROPIC_API_KEY 를 읽어 쓴다. (이 파일에 적지 않는다)
 *
 * 쓰는 법
 *   node verify/call-agent.mjs verify/input-sample.md
 *   type verify\input-sample.md | node verify/call-agent.mjs
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");           // 팀 폴더 맨 위
const AGENT_FILE = path.join(ROOT, ".claude", "agents", "verify.md");
const ENV_FILE = path.join(ROOT, ".env");

/** .env 를 읽어 필요한 열쇠 하나만 꺼낸다. 값은 어디에도 적지 않는다. */
function readApiKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;

  if (!fs.existsSync(ENV_FILE)) {
    throw new Error(`.env 를 찾을 수 없습니다: ${ENV_FILE}`);
  }
  for (const line of fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?ANTHROPIC_API_KEY\s*=\s*(.*)$/);
    if (!m) continue;
    const value = m[1].trim().replace(/^(['"])(.*)\1$/, "$2");
    if (value) return value;
  }
  throw new Error(".env 에 ANTHROPIC_API_KEY 값이 비어 있습니다.");
}

/** .claude/agents/verify.md 에서 앞머리(frontmatter)를 걷어내고 역할 지시문만 그대로 돌려준다. */
function readRolePrompt() {
  if (!fs.existsSync(AGENT_FILE)) {
    throw new Error(`역할 지시문을 찾을 수 없습니다: ${AGENT_FILE}`);
  }
  const raw = fs.readFileSync(AGENT_FILE, "utf8");
  const body = raw.replace(/^\uFEFF/, "").replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  const prompt = body.trim();
  if (!prompt) throw new Error(`${AGENT_FILE} 에 역할 지시문이 비어 있습니다.`);
  return prompt;
}

/** 화면에서 넘어온 글 한 덩어리를 받는다: 인자로 준 파일, 없으면 표준입력. */
async function readIncomingText() {
  const arg = process.argv[2];
  if (arg) {
    if (!fs.existsSync(arg)) throw new Error(`입력 파일이 없습니다: ${arg}`);
    return fs.readFileSync(arg, "utf8");
  }
  if (process.stdin.isTTY) {
    throw new Error(
      "넘길 글이 없습니다.\n  쓰는 법: node verify/call-agent.mjs verify/input-sample.md",
    );
  }
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

/** 담당자를 부른다. 지시문은 system, 넘어온 글은 user 로 그대로 넣는다. */
export async function callVerifyAgent(incomingText) {
  const text = String(incomingText ?? "").trim();
  if (!text) throw new Error("넘어온 글이 비어 있습니다.");

  const client = new Anthropic({ apiKey: readApiKey() });

  const stream = client.beta.messages.stream({
    model: "claude-opus-5",
    max_tokens: 64000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    system: readRolePrompt(),
    messages: [{ role: "user", content: text }],
  });

  const message = await stream.finalMessage();

  if (message.stop_reason === "refusal") {
    throw new Error(`담당자가 처리를 거절했습니다: ${message.stop_details?.explanation ?? ""}`);
  }
  const answer = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  // 이번에 얼마나 썼는지: 글자 수와, API 가 알려준 토큰 수
  return {
    text: answer,
    usage: {
      inChars: text.length,
      outChars: answer.length,
      inTokens: message.usage?.input_tokens ?? null,
      outTokens: message.usage?.output_tokens ?? null,
    },
  };
}

/**
 * index.html 을 띄우는 자리.
 * 화면은 글만 보내고, 열쇠는 이 파일(서버 쪽)에서만 쓴다.
 */
function serve(port) {
  const server = http.createServer(async (req, res) => {
    const send = (code, type, payload) => {
      res.writeHead(code, { "Content-Type": type });
      res.end(payload);
    };

    if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
      return send(200, "text/html; charset=utf-8", fs.readFileSync(path.join(HERE, "index.html")));
    }

    if (req.method === "POST" && req.url === "/api/verify") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      try {
        const { text } = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        const { text: result, usage } = await callVerifyAgent(text);
        return send(200, "application/json; charset=utf-8", JSON.stringify({ result, usage }));
      } catch (err) {
        return send(500, "application/json; charset=utf-8", JSON.stringify({ error: err.message }));
      }
    }

    send(404, "text/plain; charset=utf-8", "없는 주소입니다.");
  });

  server.listen(port, () => {
    process.stdout.write(`verify 화면이 열렸습니다: http://localhost:${port} (멈추려면 Ctrl+C)\n`);
  });
}

// 직접 실행했을 때만 동작한다. 다른 파일에서 import 하면 callVerifyAgent 만 쓴다.
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.includes("--serve")) {
      serve(Number(process.env.PORT) || 8787);
    } else {
      const { text, usage } = await callVerifyAgent(await readIncomingText());
      process.stdout.write(text + "\n");
      // 쓴 양은 결과와 섞이지 않게 따로 알린다.
      process.stderr.write(
        `[call-agent] 넣은 글 ${usage.inChars}자 / 받은 글 ${usage.outChars}자` +
          (usage.inTokens ? ` (토큰 ${usage.inTokens} → ${usage.outTokens})` : "") + "\n",
      );
    }
  } catch (err) {
    process.stderr.write(`[call-agent] ${err.message}\n`);
    process.exit(1);
  }
}
