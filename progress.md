Original prompt: 實作 Meta 視角第一至第三階段：第二次 Gate 37 死亡後實際打開排行榜才鏡頭拉遠；顯示主角雙手、終端對話；手機按鈕改為延遲手指點擊；ViewTube 打字顯示虛擬鍵盤並讓手逐鍵觸碰。只做靜態分析與自動測試，不開瀏覽器。

## 2026-07-19

- 已確認 Meta 揭露不能直接沿用 `seenLeaderboard`，因為舊邏輯在第二次死亡時便提前設為 true。
- 新增純函式規則與測試：Meta 觸發、單一 pending interaction、reduced motion、虛擬鍵盤輸入。
- 已整合鏡頭場景：第二次 Gate 37 死亡後，必須實際點開排行榜才揭露桌面、雙手與終端對話。
- 已整合手機按鈕延遲點擊代理；Canvas 飛行操作維持即時。
- 已整合 ViewTube 搜尋虛擬鍵盤；實體與虛擬按鍵都排入單一手指動畫佇列，切換 App 時取消過期鍵盤輸入。
- 新增 `?meta=true` 開發驗收捷徑；正式觸發條件維持第二次 Gate 37 死亡後實際開啟排行榜。
- 修正死亡計數：只有 Gate 37 死亡會累加，並以 `gameOver` guard 防止同一幀重複死亡。
- 改用受控輸入 controller 更新 ViewTube 搜尋值，不再模擬原生 input event；reduced-motion 會立即輸入與執行。
- 最終靜態驗證：`npm test` 20/20、`npm run lint`、`npm run build` 全部通過。
- 依使用者要求未執行瀏覽器驗證；人工驗收可使用正式流程或 `?debug=true&meta=true` 捷徑。
- TODO：以人工視覺驗收調整手部造型、鏡頭縮放比例與打字節奏。
