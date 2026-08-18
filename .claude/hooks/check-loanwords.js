// 저장 전 외래어 검사 훅 (PreToolUse: Write | Edit)
//
// .txt / .md 문서를 저장할 때 아래 외래어가 들어 있으면 저장을 막고,
// "쉬운 우리말로 바꿔라"라는 안내를 Claude에게 돌려보냅니다.
//
// 막을 단어를 추가·삭제하려면 아래 WORDS 목록만 고치면 됩니다.

const WORDS = {
  '오픈': '열기 · 개장',
  '이벤트': '행사',
  '프로모션': '판촉 행사 · 할인 행사',
  '스페셜': '특별',
  '얼리버드': '사전 예약 · 미리 신청',
};

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

  // Write는 content, Edit은 new_string에 저장할 내용이 들어옵니다.
  const text = [input.content, input.new_string].filter(Boolean).join('\n');
  const hits = Object.keys(WORDS).filter((word) => text.includes(word));
  if (hits.length === 0) process.exit(0);

  const guide = hits.map((word) => `'${word}' → ${WORDS[word]}`).join(', ');
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          `외래어가 들어 있어 저장을 막았습니다. ` +
          `다음 외래어들을 쉬운 우리말로 바꾼 뒤 다시 저장하세요: ${guide}. ` +
          `문맥에 맞는 다른 우리말 표현을 써도 됩니다.`,
      },
    })
  );
});
