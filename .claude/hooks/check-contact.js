// 저장 전 문의처 검사 훅 (PreToolUse: Write | Edit)
//
// .txt / .md 문서를 저장할 때 맨 아래에 문의처 안내가 없으면 저장을 막고,
// "문의처를 추가하라"는 안내를 Claude에게 돌려보냅니다.
//
// 문의처로 인정할 표현을 늘리려면 아래 CONTACT_WORDS만 고치면 됩니다.

const fs = require('fs');

const CONTACT_WORDS = ['문의', '고객센터', '연락처'];
const TAIL_LINES = 3; // 맨 아래 몇 줄까지를 '맨 아래'로 볼지

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  raw += chunk;
});
process.stdin.on('end', () => {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    process.exit(0); // 입력을 못 읽으면 그냥 통과시킵니다
  }

  const input = data.tool_input || {};
  const filePath = String(input.file_path || '');

  // 검사 대상: .txt / .md 문서만. 설정 폴더(.claude)는 제외합니다.
  if (!/\.(txt|md)$/i.test(filePath)) process.exit(0);
  if (/[\\/]\.claude[\\/]/.test(filePath)) process.exit(0);

  // 저장이 끝난 뒤의 '문서 전체'를 만들어 봅니다.
  // Write는 content가 곧 전체 내용이고,
  // Edit은 일부만 바꾸므로 원본 파일을 읽어 바뀐 결과를 계산합니다.
  let finalText;
  if (typeof input.content === 'string') {
    finalText = input.content;
  } else if (typeof input.new_string === 'string') {
    let original = '';
    try {
      original = fs.readFileSync(filePath, 'utf8');
    } catch {
      process.exit(0); // 원본을 못 읽으면 판단하지 않고 통과시킵니다
    }
    const oldStr = String(input.old_string ?? '');
    finalText = input.replace_all
      ? original.split(oldStr).join(input.new_string)
      : original.replace(oldStr, input.new_string);
  } else {
    process.exit(0);
  }

  // 빈 문서는 검사하지 않습니다.
  const lines = finalText.split('\n').filter((line) => line.trim() !== '');
  if (lines.length === 0) process.exit(0);

  // 맨 아래 몇 줄 안에 문의처 표현이 있는지 봅니다.
  const tail = lines.slice(-TAIL_LINES).join('\n');
  if (CONTACT_WORDS.some((word) => tail.includes(word))) process.exit(0);

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          `문서 맨 아래에 문의처 안내가 없어 저장을 막았습니다. ` +
          `맨 아랫줄에 문의처를 추가한 뒤 다시 저장하세요. ` +
          `예: "문의: 갤럭시빈 고객센터". ` +
          `문의처를 모르면 지어내지 말고 사용자에게 물어보세요.`,
      },
    })
  );
});
