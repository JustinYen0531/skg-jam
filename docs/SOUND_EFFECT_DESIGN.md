# SKG: Scorekeeper 音效設計文件

> 文件用途：定義遊戲內所有非音樂聲音的語言、事件、優先級、製作規格與程式掛載方式。本文件處理 SFX、UI 聲、文字聲、環境聲與 Meta 實體動作；BGM 的旋律與版本演化仍以 [核心音樂語言與生成提示詞](./CORE_MUSIC_LANGUAGE.md) 為準。

## 1. 音效北極星

音效必須支撐同一個核心轉變：玩家最初以為自己正在操作一款吵鬧、廉價、過度包裝的生成式手機遊戲，後來才逐步聽見被廣告、更新與資料損壞覆蓋的舊作品。

音效不能先替劇情洩漏答案。它不應用電影式低頻、突然尖叫或恐怖 Glitch 告訴玩家「這裡有陰謀」，而應讓差異來自材質：新版聲音過度明亮、壓縮且討好；舊資料聲音狹窄、缺損但真誠；Meta 視角則乾燥、近距離，像真的手指、玻璃與桌面。

## 2. 設計支柱

1. **操作必須立即可讀。** 上升、得分、碰撞、按鍵、送出與錯誤都要在動作發生後立刻回應，玩家不需要看文字才知道結果。
2. **同一功能不等於同一聲音。** `playTick` 不應同時代表開 App、打字、按讚、關閉視窗與實體手指碰玻璃；每個互動家族要有自己的材質。
3. **揭露靠去除覆蓋，而不是突然恐怖。** 越接近舊版與真相，越少廣告式裝飾，越能聽見簡單的早期手機遊戲聲、資料讀取聲與安靜的實體空間。
4. **聲音不能妨礙閱讀。** 逐字獨白、鍵盤與彈幕密集時要限制同時發聲數量，不能把玩家的注意力從證據文字上搶走。

## 3. 五個聲音世界

| 聲音層 | 使用範圍 | 聲音特徵 | 禁止事項 |
|---|---|---|---|
| 廉價 AI 廣告表層 | Flappy 首頁、PLAY NOW、促銷條、公開排行榜 | 過亮、短促、過度討好、微削波、塑膠感合成音 | 不要真的刺耳；不要每個按鈕都用勝利音 |
| 飛行遊戲本體 | 上升、通過水管、撞擊、死亡、秘密路線 | 早期手機遊戲波形、短包絡、節奏清楚 | 不要厚重爆炸；小鳥不是戰鬥機 |
| 手機與應用程式 | App、搜尋、鍵盤、下載、登入、捲動 | 小型喇叭、乾淨數位 UI、不同 App 可有輕微材質差 | 不要用同一個 tick 包辦所有操作 |
| Meta 實體空間 | 手指移動、碰玻璃、滑動、手機框、桌面、房間底噪 | 近距離、乾燥、輕微摩擦與接觸聲、幾乎沒有殘響 | 不要科幻機械手臂聲；不要讓手勢比內容更搶戲 |
| 舊資料與保存層 | Archive、LAOS、舊影片、隱藏榜、−65535、256 終點 | 低取樣率、單聲道、讀取缺口、簡單真誠 | 不要把資料損壞做成隨機恐怖噪音 |

## 4. 完整音效事件清單

### 4.1 飛行與分數

| ID | 觸發 | 聲音設計 | 變化規則 | 優先級 |
|---|---|---|---|---|
| `sfx_flight_flap` | 每次點擊／按鍵讓小鳥上升 | 70–130 ms 的輕短上揚音，帶一點紙片拍動或塑膠翼感 | 至少 3 個音高／材質變體；連點時輪替，不隨機大幅變調 | P0 |
| `sfx_flight_score` | 小鳥真正通過一根水管並加分 | 40–80 ms 的小型計分 ping；比 flap 更高、更乾淨 | 每 5 或 10 分可加一層很輕的高音，不可每分奏旋律 | P0 |
| `sfx_flight_pipe_hit` | 撞到普通水管正面或特殊表面 | 短而鈍的塑膠／金屬殼碰撞，先有接觸再有失速 | 依普通水管、Level 2 材質、尖刺分 2–3 類 | P0 |
| `sfx_flight_bird_fall` | 碰撞後開始下墜 | 150–300 ms 的下滑音，不需額外爆炸 | 與撞擊分開，讓死亡因果可讀 | P0 |
| `sfx_flight_death_result` | 死亡結果面板出現 | 廉價廣告遊戲式失敗 sting，短、尷尬、略顯開心 | 第一次 Gate 40 死亡仍保持廉價表層；真正開榜後才讓 Meta 揭露接管 | P0 |
| `sfx_flight_restart` | Retry／重新開始 | 80–140 ms 的反向吸入或快速重置音 | 不使用解鎖和成功音 | P0 |
| `sfx_flight_gate40_block` | 撞上看得見的 Gate 40 | 普通碰撞後疊一個非常短的低頻鎖定脈衝 | 第一次死亡不能自行暗示 Meta 或秘密路線 | P1 |
| `sfx_flight_level2_material` | 首次進入 Level 2 | 舊版合成音重新接通，像被壓住的聲道恢復 | 只播放一次，不做電影式爆發 | P1 |
| `sfx_flight_altitude_step` | 高度序列中的一步被正確維持 | 柔和感應器脈衝，音高依序列位置而非高度數值排列 | 錯誤時不立刻鳴笛，讓飛行失敗本身回饋 | P1 |
| `sfx_flight_collision_bypass` | 第六個高度造成短暫穿牆 | 兩段極短資料錯位：碰撞聲被切掉，留下缺失感 | 不用大 Glitch，不可蓋過通過水管的聲音 | P1 |
| `sfx_flight_score184` | 玩家超過 ARC_184 | 原本計分 ping 暫時少一層，而非更華麗 | 讓「排名失去意義」開始可聽見 | P2 |
| `sfx_flight_no_input_descent` | 256 黑牆前玩家停止操作 | 不新增提示音；讓 flap 的缺席與風聲下降形成線索 | 必須避免用聲音直接告訴玩家答案 | P0（設計規則） |
| `sfx_flight_complete` | 進入隱藏完成區域 | 簡單、未炫耀的早期手機完成音，接回完整 BGM 最後四小節 | 不使用現有五段式大勝利和弦 | P0 |

### 4.2 廉價廣告遊戲與排行榜 UI

| ID | 觸發 | 聲音設計 | 優先級 |
|---|---|---|---|
| `sfx_ad_play_now` | 巨大 PLAY NOW／開始遊戲 | 過度明亮的兩音上升，像廉價廣告 CTA | P0 |
| `sfx_ui_primary_tap` | Retry、Investigate、確認等主要按鈕 | 乾淨、稍厚的 40–70 ms 點擊 | P0 |
| `sfx_ui_secondary_tap` | 分頁、排序、Like、返回等次要操作 | 更小、更乾的 click，不帶音階 | P0 |
| `sfx_ui_close` | 關閉 modal／排行榜／Learn More | 短下行或軟塑膠釋放聲 | P1 |
| `sfx_ui_toggle` | 靜音、燈、排序模式等切換 | 開與關使用同材質、相反方向 | P1 |
| `sfx_leaderboard_open` | 公開排行榜展開 | 快速數列掃描後停住，不揭露隱藏資料 | P0 |
| `sfx_leaderboard_row_pass` | 玩家捲動經過具名或自己的一列 | 僅自己列／故事列發出很輕的定位 tick | P2 |
| `sfx_leaderboard_percent` | 「擊敗玩家百分比」更新 | 廣告式小亮音，但設冷卻，不能每幀播放 | P2 |
| `sfx_ui_disabled` | 點擊 disabled 或未解鎖功能 | 很短的悶點，不使用錯誤警報 | P1 |

### 4.3 手機桌面、App 與導覽

| ID | 觸發 | 聲音設計 | 優先級 |
|---|---|---|---|
| `sfx_phone_app_open` | 開啟任一 App | 90–140 ms 小型展開聲 | P0 |
| `sfx_phone_home` | 返回手機桌面 | 同材質的收回聲 | P0 |
| `sfx_phone_tab` | App 內切換分頁 | 很短的橫向切換 tick | P1 |
| `sfx_phone_scroll` | 滑鼠滾輪／手指滑動頁面 | 手指與玻璃的極輕摩擦，只在手勢開始與結束出現 | P1 |
| `sfx_phone_scroll_limit` | 到達捲動頂／底仍繼續 | 柔軟的邊界彈回聲，需冷卻 | P2 |
| `sfx_phone_modal_open` | 詳情、放大圖、Learn More | 輕薄的卡片展開，不是 App 開啟聲 | P1 |
| `sfx_phone_modal_close` | 關閉卡片／圖片 | 與展開相反的短收束 | P1 |
| `sfx_phone_notification` | 新訊息或新線索通知 | 單一低音量提示，不使用常見品牌音型 | P1 |

### 4.4 搜尋、鍵盤與文字輸入

| ID | 觸發 | 聲音設計 | 變化規則 | 優先級 |
|---|---|---|---|---|
| `sfx_key_character` | 輸入英數字元 | 20–35 ms 的軟塑膠／玻璃 tap | 4 個微變體循環；同一秒最多約 18 次 | P0 |
| `sfx_key_space` | 空白鍵 | 比字元鍵低、稍寬 | 不必每個空白都響，可隔次播放 | P1 |
| `sfx_key_backspace` | 刪除字元 | 短促反向 click，音高略低 | 長按時限速，避免機關槍聲 | P0 |
| `sfx_key_enter` | Enter／Search／送出密碼 | 60–100 ms 的確認接觸加短下壓 | 與搜尋結果成功音分開 | P0 |
| `sfx_search_loading` | 搜尋送出到結果出現之間 | 1–3 個低音量資料脈衝，最長 500 ms | 結果立即出現時可省略 | P2 |
| `sfx_search_no_result` | 搜尋無結果或提前猜答案 | 兩個短而收斂的數位音，不用刺耳 buzzer | P0 |
| `sfx_search_found` | 找到正確帳號／檔案／影片 | 單一清楚定位音，之後才由 clue 音接手 | P0 |
| `sfx_password_wrong` | 密碼錯誤 | 乾燥、低音、100 ms 內結束 | 不與資料損壞 Glitch 共用 | P0 |
| `sfx_password_correct` | 正確登入母親舊帳號 | 先是鎖扣鬆開，再出現舊系統短和弦 | P0 |

### 4.5 主角獨白與終端文字

主角目前沒有配音；聲音代表文字被主角意識捕捉、逐字形成，而不是角色真的在說話。

| ID | 觸發 | 聲音設計 | 規則 | 優先級 |
|---|---|---|---|---|
| `sfx_monologue_glyph` | `LIVE TRANSCRIPT` 新字元顯示 | 8–20 ms、非常低音量的乾燥終端微響 | 不對空格發聲；標點只保留句號、問號與破折號 | P0 |
| `sfx_monologue_word` | 快速文字或效能不足時的替代模式 | 每 2–4 個字元／每個詞播放一次 | 與 glyph 模式二選一，不可疊加 | P0 fallback |
| `sfx_monologue_line_end` | 一行獨白完成 | 30–50 ms 的輕微落點，不做句尾旋律 | P1 |
| `sfx_monologue_interrupt` | 新證據打斷上一句、來源切換 | 極短的磁帶切口或游標中止聲 | 只在內容真的被取代時播放 | P1 |
| `sfx_monologue_clue_emphasis` | 首次出現已被證據支持的關鍵詞 | 比普通字元更實的單一 tick | 不得用於尚未揭露的人名、密碼或高度 | P1 |
| `sfx_terminal_system_line` | 系統行、輸入來源、連線狀態更新 | 比主角文字更高、更冷的短 pulse | 保持主角與系統聲音身份分離 | P1 |

逐字播放建議：基準間隔 32–45 ms；連續字元可有 ±3% 音高差，但不得使用完全隨機的大幅變調。若一段文字是整段瞬間出現，改用一次 `word` 或 `line_end`，不要在同一幀播放數十個聲音。

### 4.6 Meta 手掌、手機與實體空間

| ID | 觸發 | 聲音設計 | 優先級 |
|---|---|---|---|
| `sfx_meta_camera_pullback` | 第一次 Gate 40 死亡後實際開榜，鏡頭拉遠 | 螢幕錄影訊號切斷＋很輕的房間空氣出現 | P0 |
| `sfx_meta_hand_depart` | 右側握持手離開，操作手開始移動 | 低音量皮膚／布料摩擦，100 ms 內 | P1 |
| `sfx_meta_finger_contact` | 食指真正碰到玻璃 | 柔軟指腹 tap，包含極短玻璃高頻 | P0 |
| `sfx_meta_finger_release` | 食指離開玻璃 | 更輕的黏離聲，可只在重要按鈕使用 | P2 |
| `sfx_meta_finger_swipe` | 滾輪對應的垂直滑動 | 120–350 ms 的細摩擦，依滑動距離控制長度 | P1 |
| `sfx_meta_regrip` | 右手回到握持姿勢 | 輕微手機框接觸與手掌落位 | P1 |
| `sfx_meta_device_creak` | 長時間握持或重大揭露後微調手機 | 極低頻率、不可循環過密 | P2 |
| `sfx_meta_room_tone` | Meta 視角持續存在 | 很低的房間／電器底噪，不應被注意到 | P1 |
| `sfx_meta_desk_contact` | 手機首次落入完整實體構圖 | 小而沉的桌面接觸，不是撞擊 | P2 |

### 4.7 各 App 的證據互動

| ID | 觸發 | 聲音設計 | 優先級 |
|---|---|---|---|
| `sfx_viewtube_video_start` | ARC_184 或其他影片開始 | 舊播放器 relay click＋壓縮音訊底噪接通 | P1 |
| `sfx_viewtube_video_pause` | 主角自動點擊 42 分證據點 | 機械式 pause click，背景錄影聲立即截斷 | P0 |
| `sfx_viewtube_comment_barrage` | 41–42 洗板彈幕開始 | 不逐則發聲；只用一次密度上升的資料沙沙聲 | P1 |
| `sfx_archive_year_switch` | 2026／2014 快照切換 | 磁頭定位或舊硬碟短 seek | P1 |
| `sfx_archive_download_start` | 下載舊 IPA | 老式資料傳輸起始 chirp | P1 |
| `sfx_archive_download_complete` | 檔案完成下載 | 短、克制的資料落盤聲 | P0 |
| `sfx_amazemart_purchase` | 購買 Lumen Arc | 故意過度開心的商店結帳音 | P1 |
| `sfx_amazemart_delivery` | 假裝置變成截圖包 | 結帳音被截斷，接一個檔案解壓落下聲 | P1 |
| `sfx_screenshot_zoom` | 放大紙張／截圖 | 紙張靠近或玻璃放大聲 | P1 |
| `sfx_screenshot_rotate` | 旋轉、排列證據 | 輕紙張摩擦／桌面拖曳 | P2 |
| `sfx_social_sort` | FaceSpace 切換最早／最新 | 卡片洗牌或短時間軸回捲 | P1 |
| `sfx_messages_incoming` | Mara 訊息出現 | 溫和、舊裝置式單音通知 | P1 |
| `sfx_messages_typing` | `Mara is typing…` | 稀疏、不規則的 2–3 個軟鍵聲，之後停住 | P1 |
| `sfx_messages_admin_open` | 私人舊帳號解鎖 | 老系統解鎖聲，不使用現代成功亮音 | P0 |

### 4.8 真相、隱藏排行榜與結尾

| ID | 觸發 | 聲音設計 | 優先級 |
|---|---|---|---|
| `sfx_clue_unlock` | 一項調查旗標首次成立 | 2–4 音的克制上行；只在首次解鎖播放 | P0 |
| `sfx_data_corrupt` | 真正的檔案缺損／讀取錯誤 | 受控、可重現的 100–250 ms 資料缺口 | P1 |
| `sfx_hidden_entries_prompt` | `SHOW HIDDEN ENTRIES?` | 排序馬達停住後出現單一低脈衝 | P0 |
| `sfx_signed_value_reveal` | `NOAH_KADE — −65535` 首次出現 | 幾乎沒有 sting；先抽掉其他 UI 聲，再留一個低解析度確認音 | P0 |
| `sfx_service_terminated` | 256 黑牆出現 | 電子服務斷線聲，乾燥而非爆炸 | P1 |
| `sfx_score_overflow` | `256 → 65535 → −65535` | 三個狀態各一個資料步進，最後一音回到最初音高 | P0 |
| `sfx_ending_submit` | 提交 257 分 | 現代廣告式勝利音，完整但空洞 | P1 |
| `sfx_ending_publicize` | 公開秘密 | 通知群聚後被伺服器關閉聲切斷 | P1 |
| `sfx_ending_preserve` | 保存遊戲 | 單一檔案寫入完成聲，接 BGM 最後四小節 | P0 |
| `sfx_download_count` | 保存結局下載數 1 → 2 | 每次一個非常小的舊系統 tick | P1 |

## 5. 章節演化規則

音效不是每章換一套素材，而是同一套聲音逐漸改變播放狀態，與 BGM 的「同一份檔案被挖出來」一致。

| 流程 | 音效狀態 |
|---|---|
| 序章／0–40 | 新版廣告聲最亮、最擠；飛行聲被壓縮，UI 比遊戲內容更大聲 |
| Chapter 1 | Meta 鏡頭揭露後，第一次加入真實指腹、玻璃、房間底噪；影片使用舊錄影頻寬 |
| Chapter 2–3 | Archive、下載、紙張與裝置材質出現；數位聲開始變窄但更具體 |
| Chapter 4–5 | 公司網站聲音從手工頁面逐年變成罐頭企業 UI；可沿用同音型但提高量化與壓縮 |
| Chapter 6–9 | 人物訊息與私人資料減少廣告音，留下較溫和、較少裝飾的舊裝置聲 |
| Chapter 10／突破 40 | 感應器脈衝與舊版飛行聲接回；新版 CTA 聲逐步停止 |
| 41–184 | 廣告與公開排行榜聲音消失；得分聲逐步簡化 |
| 185–256 | 排名聲停止，只保留距離、飛行與資料狀態 |
| 真正完成 | 不用電影式勝利；完成音只負責確認，情緒交給完整 BGM 最後四小節 |

## 6. 混音與播放規則

### 6.1 Bus 分組

- `BGM`：十一個保存狀態的同一首音樂。
- `GAMEPLAY`：flap、score、collision、death、complete。
- `UI`：按鈕、App、搜尋、鍵盤、排行榜。
- `NARRATIVE`：逐字獨白、系統行、線索揭露。
- `META_FOLEY`：手指、玻璃、手機框、桌面。
- `AMBIENCE`：房間底噪、舊播放器噪聲、裝置 hum。

### 6.2 相對音量

- 碰撞、完成與重要錯誤是最高 SFX 優先級，但峰值仍不得明顯高於 BGM 6 dB 以上。
- 一般 UI 約比 gameplay collision 低 6–10 dB。
- 鍵盤與逐字音再比一般 UI 低 4–8 dB。
- Room tone 必須在玩家刻意聽時才察覺；不能像持續警報。
- 重要獨白開始時，BGM 與非必要 UI 可在 80–120 ms 內 duck 2–4 dB，文字結束後平滑恢復。

### 6.3 同時發聲限制

- `flap`：最多同時 2 個，新的聲音可截短最舊聲音。
- `score`：最多 3 個；高速重播可合併為每 2–3 分一次。
- `key_character`：最多 4 個，超過時丟棄最舊聲音。
- `monologue_glyph`：最多 2 個，不能累積延遲播放。
- `meta_finger_contact`：每次操作只播放一次，不能同時由 UI click 再播放相同材質。
- Glitch／資料聲必須有明確事件來源，禁止背景隨機觸發。

## 7. 現有程式盤點與拆分建議

目前 `src/lib/audio.ts` 使用 Web Audio API 合成七種聲音。它適合作為原型，但事件身份過度共用。

| 現有方法 | 現況 | 建議拆分 |
|---|---|---|
| `playJump()` | 已掛到小鳥上升 | 保留為 `playFlap()`，加入 3 個受控變體 |
| `playTick()` | App、按鈕、分頁、Like、搜尋等大量共用 | 拆成 `playPrimaryTap`、`playSecondaryTap`、`playKeyTap`、`playPhoneNav` |
| `playExplode()` | 所有飛行死亡共用 | 拆成 `playPipeHit`、`playBirdFall`、`playDeathResult` |
| `playGlitch()` | 搜尋錯誤、提前輸入、資料異常共用 | 拆成 `playInputError` 與 `playDataCorrupt`；後者才允許缺損質感 |
| `playUnlock()` | 線索、App 行為與一般提示共用 | 限制為首次 `playClueUnlock`，普通操作改用 UI 聲 |
| `playSuccess()` | 登入、完成與其他成功共用 | 拆成 `playLoginSuccess`、`playDownloadComplete`、`playGameComplete` |
| `startAmbientHum()` | 單一 55 Hz 正弦底噪 | 分成 `phoneHum` 與 `metaRoomTone`，並提供獨立音量 |

目前 `playGlitch()` 使用 `Math.random()` 產生頻率與時長。若聲音需要和重播、測試或章節狀態一致，應改為固定變體輪替或 seeded variant，不要讓關鍵資料事件每次聽起來完全不同。

## 8. 建議的程式介面

```ts
type SfxEvent =
  | 'flight.flap'
  | 'flight.score'
  | 'flight.pipeHit'
  | 'flight.complete'
  | 'ui.primaryTap'
  | 'ui.secondaryTap'
  | 'keyboard.character'
  | 'keyboard.backspace'
  | 'keyboard.enter'
  | 'monologue.glyph'
  | 'meta.fingerContact'
  | 'meta.fingerSwipe'
  | 'story.clueUnlock'
  | 'story.signedValueReveal';

audio.play(event, {
  variant: 0,
  intensity: 0.5,
  playbackState: 'modern' | 'archive' | 'restored',
});
```

事件名稱描述「發生了什麼」，播放狀態描述「它現在是新版、舊檔或恢復版」。不要在元件裡直接指定振盪器頻率，避免每個 App 各自長出一套無法統一的聲音。

## 9. 製作與檔案規格

- 母帶：WAV，48 kHz／24-bit。
- UI、鍵盤、飛行：以 mono 為主；環境與特殊揭露可使用 stereo。
- Web 交付：優先 `.ogg`，另備 `.mp3` 或 `.m4a` fallback；短音效可保留 WAV，但須檢查總下載量。
- 命名：`sfx_<system>_<event>_<variant>_v01.wav`。
- 例：`sfx_flight_flap_01_v01.wav`、`sfx_key_character_03_v01.wav`。
- 短操作聲頭部不可留多餘靜音；需要 sample-accurate 的接觸感。
- 所有音效避免內建長殘響；空間感由 bus 或場景統一處理。
- 素材必須記錄作者、來源 URL、授權、修改方式與下載日期。

## 10. MVP 優先順序

### P0：沒有就會影響操作或敘事理解

1. Flap、通過得分、撞擊、下墜／死亡、Retry。
2. 主要／次要按鈕、App 開啟、返回桌面。
3. 字元、Backspace、Enter、搜尋失敗／找到結果。
4. 主角逐字微響與系統文字聲。
5. 實體手指碰玻璃、Meta 鏡頭拉遠。
6. 線索首次解鎖、正確／錯誤登入。
7. 影片在 42 分自動暫停。
8. `−65535` 揭露、分數溢位、真正完成、保存結局。

### P1：建立世界材質與章節差異

- Gate 40 鎖定、Level 2 接通、高度感應器、碰撞繞過。
- 滑動、regrip、房間底噪。
- Archive 年份切換、下載、紙張、社群排序、訊息通知。
- 其他兩個結局的專屬聲音。

### P2：有時間再做的細節

- 排行榜列定位、百分比更新、捲動邊界。
- 手指 release、手機框微響、桌面接觸。
- 圖片旋轉、下載數增加、分數里程碑變體。

## 11. 素材搜尋／生成關鍵詞

搜尋時優先找乾燥、短促、無殘響素材，再自行做低取樣率與壓縮版本：

- `soft finger tap glass close up`
- `finger swipe glass subtle`
- `small plastic button click dry`
- `mobile keyboard tap soft`
- `retro game flap short`
- `retro score ping minimal`
- `plastic impact short game`
- `old hard drive seek short`
- `data read error subtle`
- `cassette stop click`
- `paper slide desk close`
- `quiet room electronics hum`

生成音效時避免使用 `horror`、`cinematic glitch`、`epic win`、`massive impact` 等詞；它們會把故事變成聲音先行解說。

## 12. 驗收條件

- 閉眼操作時，玩家能分辨 flap、得分、撞擊、按鈕、鍵盤與錯誤。
- 同一個 `tick` 不再同時代表五種以上不同動作。
- 打字與獨白快速出現時沒有爆音、延遲堆積或機關槍感。
- Meta 手指接觸聲與畫面按下時刻一致，不在手仍移動時提前播放。
- 第一次 Meta 揭露前不出現房間、手指或桌面聲。
- `−65535` 前不使用專屬低頻或異常聲提前提示。
- 進入舊版後，聲音是變得簡單與具體，不是全面變恐怖。
- 靜音必須同時控制 BGM、SFX、文字聲與環境聲，並保留清楚的視覺回饋。
- Reduced Motion 不等於靜音；取消動畫時，確認與錯誤聲仍需在正確事件點播放。

## 13. 第一輪實作建議

第一輪不要一次製作整張清單。先完成 P0 中最常重複的十二個聲音家族：`flap`、`score`、`pipeHit`、`death`、`primaryTap`、`secondaryTap`、`keyCharacter`、`keyEnter`、`inputError`、`monologueGlyph`、`fingerContact`、`clueUnlock`。確認它們能清楚共存後，再製作 Archive、紙張、排行榜真相與三個結局。
