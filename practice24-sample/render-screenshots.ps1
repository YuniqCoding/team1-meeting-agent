Add-Type -AssemblyName System.Drawing

$scriptRootPath = if ($PSScriptRoot) { $PSScriptRoot } else { (Resolve-Path 'practice24-sample').Path }
$outDir = Join-Path $scriptRootPath 'screenshots'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$stages = @(
  @{ Key='collect'; No='1'; Role='흩어진 메모에서 사실 수집'; In='월~금 진행상황 메모'; Out='업무 사실 7묶음'; Detail='결제 장애 약 20분`n가입 개선 QA 통과`n검색 수치는 집계 전' },
  @{ Key='refine'; No='2'; Role='보고 순서와 중요도로 정리'; In='collect/result.md'; Out='최우선 / 완료·진행 / 다음 주'; Detail='장애를 최상단으로 이동`n완료와 예정 분리`n중복 표현 제거' },
  @{ Key='verify'; No='3'; Role='원문과 표현을 대조'; In='원문 + refine/result.md'; Out='통과 4건 · 조건부 통과 2건'; Detail='검색은 정량 집계 전`n푸시 B안은 표본 부족`n단정 표현 금지' },
  @{ Key='merge'; No='4'; Role='검증된 내용만 최종 조립'; In='verify/result.md'; Out='긴급 사항 + 핵심 3줄 + 할 일'; Detail='장애 조치 명시`n유보 표현 유지`n다음 주 할 일 4건' }
)

function New-Canvas {
  $bmp = [Drawing.Bitmap]::new(1440,900)
  $g = [Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'; $g.TextRenderingHint = 'ClearTypeGridFit'
  $g.Clear([Drawing.Color]::FromArgb(244,247,251))
  return @($bmp,$g)
}
function Text($g,$s,$size,$x,$y,$color='#172033',$bold=$false) {
  $style = if($bold){[Drawing.FontStyle]::Bold}else{[Drawing.FontStyle]::Regular}
  $font=[Drawing.Font]::new('Malgun Gothic',$size,$style)
  $brush=[Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml($color))
  $g.DrawString($s,$font,$brush,$x,$y); $font.Dispose(); $brush.Dispose()
}
function Box($g,$x,$y,$w,$h,$fill='#FFFFFF',$border='#DBE3F1') {
  $b=[Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml($fill)); $p=[Drawing.Pen]::new([Drawing.ColorTranslator]::FromHtml($border),2)
  $g.FillRectangle($b,$x,$y,$w,$h); $g.DrawRectangle($p,$x,$y,$w,$h); $b.Dispose(); $p.Dispose()
}
function Header($g) {
  Text $g '연습용 화면 · 실제 가짜 재료로 재현' 14 42 30 '#3764D8' $true
  Text $g '주간보고 파이프라인 — 처음부터 끝까지' 28 42 57 '#172033' $true
  Box $g 975 30 420 72
  Text $g '처음 넣은 재료' 12 994 41 '#172033' $true
  Text $g 'inputs/6_report_material.txt' 15 994 65
}
function Draw-Card($g,$s,$x,$y,$w,$h,$large=$false) {
  Box $g $x $y $w $h
  Text $g $s.No 18 ($x+22) ($y+18) '#315FD4' $true
  Text $g $s.Key $(if($large){30}else{22}) ($x+22) ($y+60) '#172033' $true
  Text $g $s.Role 14 ($x+22) ($y+104) '#65718A'
  Text $g '받은 것' 11 ($x+22) ($y+150) '#68758C' $true
  Box $g ($x+22) ($y+176) ($w-44) 70 '#F6F8FC' '#D9E1EF'; Text $g $s.In 14 ($x+36) ($y+195)
  Text $g '내놓은 것' 11 ($x+22) ($y+268) '#68758C' $true
  Box $g ($x+22) ($y+294) ($w-44) 78 '#F1FBF6' '#8FD0AE'; Text $g $s.Out 14 ($x+36) ($y+314)
  Text $g '실제 내용 예' 11 ($x+22) ($y+394) '#68758C' $true
  Box $g ($x+22) ($y+420) ($w-44) 105 '#FFF9ED' '#E7C77F'; Text $g ($s.Detail -replace '`n',[Environment]::NewLine) 13 ($x+36) ($y+438)
  $next = if($s.Key -eq 'merge'){'✓ 최종 출력 완료'}else{"✓ 다음 칸으로 넘어감"}
  Text $g $next 15 ($x+22) ($y+$h-54) '#16804E' $true
}

$names=@('01-collect.png','02-refine.png','03-verify.png','04-merge.png')
for($i=0;$i -lt 4;$i++){
  $c=New-Canvas; $bmp=$c[0]; $g=$c[1]; Header $g
  Draw-Card $g $stages[$i] 390 145 660 680 $true
  $bmp.Save((Join-Path $outDir $names[$i]),[Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $bmp.Dispose()
}
$c=New-Canvas; $bmp=$c[0]; $g=$c[1]; Header $g
for($i=0;$i -lt 4;$i++){ Draw-Card $g $stages[$i] (42+$i*345) 135 310 625 }
Box $g 42 785 1353 70 '#172033' '#172033'
Text $g '모든 칸을 거쳤는가: 예        앞 칸 결과를 실제로 썼는가: 예        막힌 점: 끝까지 흘러감' 16 78 807 '#FFFFFF' $true
$bmp.Save((Join-Path $outDir '05-full-flow.png'),[Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $bmp.Dispose()
