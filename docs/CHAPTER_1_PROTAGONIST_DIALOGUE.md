# Chapter 1 主角內心獨白規格

> 範圍只包含 Chapter 1「尋找第一名」。這份文件是目前遊戲內英文台詞的依據；後續章節不得直接沿用或提前揭露本章尚未取得的知識。

## 核心聲音

主角不是任務系統，也不是全知旁白。他和玩家同時第一次看見證據，會替玩家說出直覺、輕微吐槽錯誤操作、指出目前不重要的內容，並在重複嘗試時維持陪伴感。

- 語氣：好奇、克制、半調侃；像一起查案的人，不像教學機器人。
- 功能：說出玩家心聲、提示下一個合理方向、阻止過早跳關、淡化無關內容。
- 禁止：直接公布答案、知道未讀過的人名或裝置、嘲笑玩家能力、使用恐怖或煽情措辭。
- 顯示：全部使用英文；每次顯示一至兩句，出現在 `YOU · LOCAL PLAYER` 的 `LIVE TRANSCRIPT`。

## 主線事件

| 玩家事件 | 顯示台詞 |
|---|---|
| 開榜觸發 Chapter 1 | `That isn't a record.` / `That's cheating.` |
| 第一次回首頁 | `People upload everything. Maybe he posted the run somewhere.` / `If there's footage, it's probably on a video platform.` |
| 打開 ViewTube | `ViewTube. Let’s see whether ARC_184 wanted an audience.` / `Start with the only name I have: ARC_184.` |
| 聚焦搜尋框 | `ARC_184. No theories yet. Just evidence.` |
| 點擊熱門搜尋提示 | `An erased record run. That sounds like my problem.` / `The name at the top again: ARC_184.` |
| 正確搜尋 `ARC_184` | `There you are.` / `“I BROKE THE UNBEATABLE FLAPPY GAME.” Subtle.` |
| 播放影片 | `All right. Show me the trick.` / `Wait. He goes low at Gate 40.` |
| 影片抵達 42、主角自動伸手暫停 | `I've seen enough. He's pulling some kind of cheating trick.` / `What I need is the exact moment forty becomes forty-one.` |
| 播放後點擊影片證據 | `That should have killed him.` / `No cut. No jump. So what changed?` |
| 播放前點 ARC 回覆 | `184 points. If this is edited, I want to see where.` |
| 播放後點 ARC 回覆 | 收集第一條證據：`So the old Legacy build really could pass from forty to forty-one.` / `That proves the route existed. It doesn't tell me where the build went.` |
| 點擊最底部 IPA 留言 | 收集第二條證據：`There. A filename, not a theory.` / `Skyline256_LAOS_Final.ipa. That is something an archive can actually find.` |
| 收齊兩條證據 | `Two pieces. The old route existed, and the build has a name.` / `Next stop: an archive.`；此時才進入 Chapter 2 |

## 無關操作與陪伴感

點擊 ViewTube 推薦影片時輪替短句，例如：

- `I'm not interested in this video right now.`
- `Tempting. Completely irrelevant.`
- `I can procrastinate after I explain the impossible score.`
- `The algorithm can wait.`
- `Cute bird. Wrong mystery.`

留言區的普通留言也可點擊。具體內容依留言輪替，例如十二年後被演算法重新推薦時回應 `Twelve years later, and the algorithm is doing archaeology by accident.`；畫質抱怨回應 `The compression is awful. Unfortunately, the score still changes.`；完全沒有證據的留言則回應 `A timestamp, an opinion, and no evidence.`。這些反應只提供陪伴感，不增加 `EVIDENCE` 計數。

Chapter 1 打開其他 App 時，依 App 回應目前為何不重要。例如 AmazeMart 顯示 `I'm investigating cheating, not shopping.`，Browser 顯示 `An archive of what? I don't even know what I'm looking for yet.`。重複回首頁則輪替 `Still here.`、`I'm thinking.`、`Let's follow what we actually know.` 等陪伴句，不反覆複誦同一個教學提示。

## 搜尋與提前輸入

只有 `ARC_184` 的合理格式變體（如 `ARC184`、`arc 184`）會顯示目標影片。單獨輸入 `184` 不算成功，避免任何含有未來數字的字串誤跳關。

| 提前或錯誤輸入 | 回應方向 |
|---|---|
| 空白 | `Searching for nothing. Bold strategy.` |
| `ARC184GATE40END256` | 把它當成來自未來的可疑密碼，不解鎖 |
| 完整高度序列 | 稱它為「mysterious number ritual」，不解鎖 |
| Noah／Mara／Elias | 指出主角尚未從任何證據得知此人 |
| `Lumen Arc` | 指出這像「沒有問題的答案」，不解鎖 |
| Silver Kite／SKG | 指出目前只有名稱、沒有脈絡 |
| `Gate 40` | 提醒玩家已知牆存在，現在要查 ARC_184 如何通過 |
| 其他搜尋 | 回到「目前唯一有用的名字」與 evidence-first 的調查方向 |

## 手動實測路線

1. 執行 `npm run dev`，開啟 `http://localhost:3000/?debug=true`。
2. 在 Developer Debug Mode 選擇 Chapter 1，接著按 `Ctrl + Shift + D` 關閉面板；桌面、雙手、手機和底部對話框應繼續存在。
3. 確認初始句為 `That isn't a record.` 與 `That's cheating.`。
4. 回首頁兩次：第一次引導 ViewTube，第二次開始出現陪伴句。
5. 依序打開 AmazeMart、Browser、Messages，再打開 ViewTube；每個錯誤 App 都應有英文短句。
6. 在 ViewTube 點擊至少三個推薦影片，確認吐槽會輪替，且不會切換成那些影片。
7. 搜尋 `ARC184GATE40END256`、`Noah Kade`、`Lumen Arc`；都只能收到提前輸入警示，不得出現 ARC_184 影片。
8. 搜尋 `ARC_184` 並播放影片：0–40 應有少量無底色彈幕流過；41–42 才突然出現大小不一的密集洗板，關鍵穿越幾乎看不清，但分數增加仍可被察覺。水管經過小鳥後只能繼續向左，不得消失或上下跳動。
9. 42 分附近主角右手應自行伸出點擊 Canvas 並暫停，底部顯示 `I've seen enough…`；這就是本段影片結尾，再次點擊只能顯示證據獨白，不得續播或產生 42 之後的畫面。
10. 點擊幾則普通留言，確認會出現對應英文內心反應，但 `EVIDENCE` 保持 `0/2`。
11. 點 ARC_184 的黃色回覆，確認只揭露舊 Legacy build 的 40→41 可通過，計數變成 `1/2`，且整個 ViewTube 頁面不出現 Lumen Arc。
12. 捲到留言區最底部，點擊 `Skyline256_LAOS_Final.ipa`；計數變成 `2/2`，此時才完成 Chapter 1。
13. 重新以 Chapter 1 測試 `ARC184` 與 `arc 184` 可成功；單獨 `184` 不可成功。

自動驗證只檢查事件接線、搜尋分類、英文限定與建置安全；語氣、閱讀節奏及是否真的有陪伴感，保留給玩家實測判斷。
