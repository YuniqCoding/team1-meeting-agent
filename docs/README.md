# 팀 페이지 (실습용)

회의록 처리 파이프라인을 4칸으로 나눠 팀원이 한 칸씩 맡습니다.

```
collect(수집) → summarize(요약) → verify(검증) → report(보고)
```

## 팀원별 담당 칸

| 칸 | 폴더 | 정의 파일 | 명세서 | 화면 |
| --- | --- | --- | --- | --- |
| 수집 | [collect/](../collect/) | [.claude/agents/collect.md](../.claude/agents/collect.md) | [agent-spec-collect.md](agent-spec-collect.md) | [collect/screen.html](../collect/screen.html) |
| 요약 | [summarize/](../summarize/) | [.claude/agents/summarize.md](../.claude/agents/summarize.md) | [agent-spec-summarize.md](agent-spec-summarize.md) | [summarize/screen.html](../summarize/screen.html) |
| 검증 | [verify/](../verify/) | [.claude/agents/verify.md](../.claude/agents/verify.md) | [agent-spec-verify.md](agent-spec-verify.md) | [verify/index.html](../verify/index.html) |
| 보고 | [report/](../report/) | [.claude/agents/report.md](../.claude/agents/report.md) | [agent-spec-report.md](agent-spec-report.md) | [report/screen.html](../report/screen.html) |

## 칸 폴더 안에 들어 있는 것 (4칸 모두 같음)

| 파일 | 무엇 |
| --- | --- |
| `stub.md` | 모양 견본 — 결과는 이 모양대로 만듭니다 |
| `input-sample.md` | 재료 한 벌 (연습용 가짜, 흠이 일부러 들어 있음) |
| `result.md` | 담당자가 실제로 만든 결과 |
| `input-empty.md` | 재료가 비었을 때를 시험하는 재료 |
| `result-empty.md` | 재료가 비었을 때 나온 결과 ("못 할 때" 규칙 확인용) |
| `screen.html` | 결과를 눌러서 보는 화면 (결과가 안에 박혀 있는 연습용) |

## 칸이 이어지는지 확인하는 법

같은 회의 하나가 4칸을 통과합니다. 앞 칸의 `result.md`와 다음 칸의 `input-sample.md`가 같은 내용이면 이어진 것입니다.

| 이어지는 자리 | 확인 |
| --- | --- |
| `collect/result.md` → `summarize/input-sample.md` | 회의 개요 + 발언 묶음 4개 |
| `summarize/result.md` → `verify/input-sample.md` | 핵심 세 줄 + 할 일 5건 |
| `verify/result.md` → `report/input-sample.md` | 통과 3건 / 반려 2건 |

재료에 일부러 넣어둔 흠은 두 가지이고, 칸마다 다르게 걸립니다.

| 흠 | collect | summarize | verify | report |
| --- | --- | --- | --- | --- |
| 잡담 3건 | 버린 발언으로 분리 | - | - | - |
| 담당자 미정 (교재 후보 정리) | - | `미정`으로 표기 | **반려** | 확인 필요로 분리 |
| 기한 없음 (일정표 공유) | - | 원문 표현 그대로 유지 | **반려** | 확인 필요로 분리 |
| 참여율 수치 없음 | - | - | - | `수치 미확정`으로 표기 |

## 보안 룰

- 여기 있는 재료·결과는 **전부 연습용 가짜**입니다. 회사 실제 자료가 아닙니다.
- 사람 이름은 `[담당자A]` 형태로만 씁니다. 실명·실제 거래처·고객 정보는 넣지 않습니다.
- 화면 파일에 박히는 내용도 저장소에 올라갑니다. 넣기 전에 한 번 읽어보세요.
- 열쇠(키)·비밀번호는 어떤 파일에도 적지 않습니다.
