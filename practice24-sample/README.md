# 실습 24 샘플 — 처음부터 끝까지 한 번

실제 저장소에는 `verify` 칸만 있으므로, 이 폴더는 `inputs/6_report_material.txt`를 재료로 만든 **교육용 4칸 샘플**입니다. 기존 담당자가 실제 실행된 것처럼 꾸미지 않았습니다.

## 흐름

| 순서 | 받은 것 | 내놓은 것 | 다음 칸으로 |
| --- | --- | --- | --- |
| collect | `../inputs/6_report_material.txt` | `collect/result.md` | refine으로 넘어감 |
| refine | `collect/result.md` | `refine/result.md` | verify로 넘어감 |
| verify | 원문 + `refine/result.md` | `verify/result.md` | merge로 넘어감 |
| merge | `verify/result.md` | `merge/final.md` | 최종 출력 완료 |

## 캡처

- `screenshots/01-collect.png`
- `screenshots/02-refine.png`
- `screenshots/03-verify.png`
- `screenshots/04-merge.png`
- `screenshots/05-full-flow.png` — 제출용 한 화면 샘플

`flow.html`은 인터넷 연결 없이 열리는 정적 화면입니다. 각 카드의 내용은 위 결과 파일과 같은 사실만 사용합니다.

## 막힌 점 한 줄

끝까지 흘러감 — 원문에서 수집한 사실을 정리·검증한 뒤 최종 보고서로 합침.
