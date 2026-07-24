# 內容擴充規格：讓資訊流變得擁擠、冷淡、值得挖掘

> 本文件是一次**整體性內容更新**的規格書，不是新功能提案。它只擴充「文字內容池」——留言、貼文、部落格、登入頁、錯誤訊息、頁尾——讓每個 App 從「只放謎題提示與大片空白」變成「一個真的有人在用、而且並不特別歡迎你的平台」。
>
> 核心體驗（North Star 的延伸）：**玩家是在一群並不討好他的訊息裡，翻找少數真正重要的線索。** 不是每一句都有意義，但雜訊本身要有質感，而且要有相當數量的訊息「明顯隱含著後面的劇情」，卻又不能真的把答案講出來。
>
> 實作前請先讀 [`GDD.md`](./GDD.md) 第 7、8 節（謎題鏈與排行榜真相）與 [`CHAPTER_1_PROTAGONIST_DIALOGUE.md`](./CHAPTER_1_PROTAGONIST_DIALOGUE.md)。本文件與那兩份衝突時，以劇情鎖與依賴鏈為準。

---

## 0. 目錄

1. [設計原則與硬約束](#1-設計原則與硬約束)
2. [三種聲音（語氣指南）](#2-三種聲音語氣指南)
3. [Chapter 1 · ViewTube 影片留言擴充（本次重點）](#3-chapter-1--viewtube-影片留言擴充本次重點)
4. [Chapter 3–5 · Wayback Machine 與網站登入頁文案](#4-chapter-35--wayback-machine-與網站登入頁文案)
5. [其他 App 內容池補充](#5-其他-app-內容池補充)
6. [實作對照表](#6-實作對照表)

---

## 1. 設計原則與硬約束

### 1.1 訊號與雜訊比

| 類別 | 佔比目標 | 作用 |
| --- | --- | --- |
| **承重線索（LOAD-BEARING）** | 極少數 | 真正推進謎題、觸發 `completePuzzleChapter`。**只有這些能動謎題狀態。** |
| **隱含伏筆（FORESHADOW）** | 約 25–35% | 明顯指向後面的劇情（開發者消失、負分、母親買下數百份、遊戲原本會結束……），但**不可行動化**——讀了會起雞皮疙瘩，卻拿不到可直接輸入的答案。 |
| **氛圍雜訊（NOISE / HOSTILE）** | 過半 | 冷淡、嘲諷、迷因、離題、業配 bot。讓玩家感覺自己在一個不在乎他的人群裡撈針。 |

### 1.2 不可違反的硬約束（與 GDD 一致）

1. **偽隨機只能重排，不能生成新答案，也不能破壞依賴鏈。** 新增的內容池全部是「風味」，只有既有的承重字串能推進謎題。
2. **不得提前洩漏後段專有答案。** 以下東西在它們各自的謎題階段之前，**任何留言／貼文／頁尾都不准出現字面值**：
   - 人名真身：`Noah Kade` / `Mara` / `Elias Vale` / ARC_184 的真名
   - 密碼：`ARC184GATE40END256`
   - 負分：`−65535`（以及 `65537` / 16-bit 溢位的機制解釋）
   - 終點：256 關的 `SERVICE TERMINATED` 黑牆與「高度 0 落下」通關法
3. **伏筆可以「指向」上述東西，但要用旁人的無知口吻包裝**，例如「有人說排行榜滑到最底會出事」可以暗示負分，但不能寫出數字或機制。
4. **主角獨白仍以 [`CHAPTER_1_PROTAGONIST_DIALOGUE.md`](./CHAPTER_1_PROTAGONIST_DIALOGUE.md) 為準**；本文件擴充的是「別人寫的字」，主角讀到超前的東西時只會困惑、懷疑，不會突然全知。
5. **不用恐怖手法。** 伏筆靠冷淡、時間感、旁人的漫不經心製造重量，不是靠 jump scare 或血字。

### 1.3 Chapter 1 玩家「已知 / 未知」邊界

寫留言時隨時對照這條線——留言可以碰到「已知欄」與「暗示欄」，**絕不能字面寫出「機密欄」**：

| 已知（可明說） | 可暗示（隱含伏筆） | 機密（禁止出現字面值） |
| --- | --- | --- |
| 40 分有牆、大家都卡 40 | Lumen Arc 是被回收的舊裝置 | 高度序列的任何數字 |
| ARC_184 宣稱 184 分 | LAOS 靠某種節奏／感應器誤差穿牆 | 密碼字串 |
| 影片有壓縮、像十二年前手機錄影 | 原版遊戲「本來會結束」 | Noah / Mara / Elias 的名字 |
| Internet Archive 上有舊 IPA | 開發者更新完就消失了 | −65535、溢位機制 |
| | 母親輩有人買了一堆、留給小孩 | 256 終點通關法 |
| | 排行榜最底端「怪怪的」 | |
| | 公司被某「自動化」商收購後爛掉 | |

---

## 2. 三種聲音（語氣指南）

所有新文案必須落在以下三種聲音之一，混用會讓世界失真。**遊戲內字串一律英文**（沿用現有 UI 語言），中文只作註解。

### 2.1 2026 現代廉價層（SKG Automation slop）

- 語感：企業行話、生成式贅字、把「無人」講成賣點、把「貨幣化」講得像使命。
- 關鍵詞庫：`asset`, `optimize`, `monetization efficiency`, `unstaffed`, `legacy inventory`, `programmatically`, `stakeholder`, `resolution assistant`, `synergize`。
- 情緒：空洞、過度自信、沒有人味。看久了會不舒服。

### 2.2 2014 手作誠懇層（Silver Kite Games / 舊網頁）

- 語感：獨立開發者的真誠、一點點笨拙、對「完成」的執著、對商業化的抗拒。
- 排版風味：米黃底、藍色死連結、破圖佔位、訪客計數器、退信的 webmaster 信箱。
- 情緒：溫暖但正在流失。你知道這些人後來輸了。

### 2.3 LAOS 殘留層（舊系統奪回顯示權時）

- 語感：冷、方、有耐心、稍慢一拍。全大寫或等寬，一個暖色重點，1px 髮絲線。
- 用於：Silver Kite Database Node 登入、舊系統錯誤訊息、被移植殘留的欄位。
- 情緒：像一台以為自己還在服役的機器，禮貌地等你輸入正確的東西。

### 2.4 留言群眾（Chapter 1 影片底下）

- 這是第四種、**只在留言區出現**的聲音：十二年前的網路群眾 + 十二年後被演算法沖回來的路人。
- 允許：全小寫、拼字懶散、迷因、`L + ratio`、嘲諷、gatekeeping、業配 bot、`first`。
- 目標：讓玩家覺得「這裡沒有人是為了幫我而寫的」。

---

## 3. Chapter 1 · ViewTube 影片留言擴充（本次重點）

**現況：** [`ViewTube.tsx`](../src/components/ViewTube.tsx) 的 `#vt-comments` 只有 3 則留言，且全部承重。標題卻寫「Discussion (142)」。玩家一眼看完就沒有「翻找」的感覺。

**目標：** 顯示 **約 28 則**留言，維持「142 則」的總數幻覺（其餘視為摺疊 / 次要）。其中只有 3 則承重（保留現有），其餘為伏筆與雜訊，交錯排列，讓玩家必須捲動、略讀、忽略大量廢話，才會撞見那 3 則關鍵。

### 3.1 承重留言（3 則 · 一字不改地保留）

這 3 則已存在且驅動謎題 1→2，**不得改寫、不得移出可見區、不得被雜訊淹沒到需要展開才看得到**。它們是唯一能碰謎題狀態的留言：

| Handle | 作用 |
| --- | --- |
| `SkyFlapMaster` | 質疑造假 → 內含可點的 **ARC_184 回覆**（Lumen Arc / LAOS 高度感應器），點擊觸發 `completePuzzleChapter(1)`。 |
| `LumenHacker` | 確認「特定節奏頻率可繞過碰撞」＋「哪裡還找得到能動的 Lumen Arc」。 |
| `WaybackLover` | 指出 `Skyline256_LAOS_Final.ipa` 保存在 Internet Archive。 |

> **排版規則：** 承重留言用現有的實心卡片樣式（`bg-slate-900/50` 邊框），伏筆與雜訊留言用**更低調**的樣式（更小字、更淡、無邊框或虛線），讓承重留言在視覺上仍「浮得起來」。這是可用性底線——玩家要能在雜訊中認出訊號，只是要花點力氣。

### 3.2 伏筆留言（FORESHADOW · 明顯隱含後段劇情，但不可行動化）

每則後面標註〔指向：___〕。這些**不觸發任何謎題狀態**，純風味。

```text
[F1]  handle: quietframes         age: 11y ago
      whatever happened to the person who actually made the original?
      one final update, then just... gone. nobody ever talks about them.
      〔指向：Noah 的消失。禁止出現名字。〕

[F2]  handle: mall_ghost_2011      age: 10y ago
      old heads know this used to be a game you could FINISH.
      like it had an ending. an actual one. not this infinite ad slop.
      〔指向：Skyline 256 的有限終點。禁止描述通關機制。〕

[F3]  handle: not_a_bot_i_swear    age: 9y ago
      has anyone scrolled the leaderboard all the way to the BOTTOM?
      it does something weird down there. like the sort just gives up.
      〔指向：−65535 隱藏底端。禁止出現任何數字或「負分/溢位」字眼。〕

[F4]  handle: keeps_receipts       age: 12y ago
      my mum had one of these devices. bought a whole stack of them once,
      wouldn't say why. she's not really... around to ask anymore.
      〔指向：Mara 買下數百份、記憶衰退。禁止出現名字。〕

[F5]  handle: former_QA_maybe      age: 12y ago
      he's not tapping randomly. watch the rhythm.
      it's like he's reading a map only he can see.
      〔指向：高度序列即「路」。禁止出現任何數字。〕

[F6]  handle: dead_link_collector  age: 8y ago
      this got swallowed by some "automation" company. they gut old apps,
      staple ads on the corpse, call it a business model. classic.
      〔指向：SKG Automation 收購（謎題 4–5）。可提「automation」，禁止提 Elias。〕

[F7]  handle: warranty_void        age: 10y ago
      fun fact these things got recalled for overheating lol.
      government made them collect every unit. rip my childhood brick.
      〔指向：Lumen Arc 回收。已是 Chapter 2 合法線索，可較明確。〕

[F8]  handle: soft_reset           age: 9y ago
      i don't think 184 was even the point for this guy.
      feels like he was trying to show us the score isn't the score.
      〔指向：高分不是終點的主題。刻意曖昧，不可解釋。〕

[F9]  handle: cardboardbox_archive age: 7y ago
      the original store page listed it under a totally different name.
      three letters. i forget which. someone renamed the whole thing.
      〔指向：SKG / Skyline 256 原名（謎題 3–4）。禁止拼出全名。〕

[F10] handle: latekeeper           age: 6y ago
      if you have to ask how he did it, the answer won't help you yet.
      you find the device first. everything else is downstream.
      〔指向：依賴鏈本身（先找裝置）。像 gatekeeping，其實是給玩家的節奏提示。〕
```

### 3.3 氛圍雜訊留言（NOISE / HOSTILE · 過半 · 不討好玩家）

這些**完全無劇情功能**，只負責「人群感」與「冷淡感」。可自由增刪、可進偽隨機池重排。

```text
[N1]  first
[N2]  who's here in 2026 💀 the algorithm really said "remember this?"
[N3]  142 comments and not one of you is going to touch grass
[N4]  cope. it's edited. next video.
[N5]  imagine caring this much about a flappy clone
[N6]  bro made a 21 second video just to flex a number. respect ig
[N7]  the compression on this is a war crime, i can't see anything
[N8]  why is this in my recommended twelve years later
[N9]  not me watching a bird die at gate 40 instead of sleeping
[N10] L + ratio + it's fake + didn't watch
[N11] 🔥 WANT UNLIMITED COINS?? check my profile for the mod 🔥   ← 業配 bot，SKG-slop 時代垃圾留言
[N12] downloading an entire dead operating system to beat a bird game is
      certified insane behavior and i am taking notes
[N13] this comment section is genuinely more entertaining than the run
[N14] what's the song at 0:12
[N15] he peaked here and honestly good for him
[N16] pinned comment explains everything, read before you type please
[N17] my nephew could do 40 in his sleep, 184 is just sweaty
[N18] the way everyone in here is a forensic analyst all of a sudden
[N19] tapped so hard my screen has ARC_184's fingerprints now
[N20] chat is this real   ← 十二年前不存在「chat」用法，但正是被沖回來的 2026 路人留的，刻意時代錯置
[N21] i miss when phones were weird shapes ngl
[N22] blocked, reported, moving on (jk this is kinda impressive)
[N23] the real world record is the friends we ratioed along the way
[N24] gatekept, gaslit, girlbossed his way past gate 40
[N25] average flappy enjoyer vs average lumen arc chad
```

> N19、N24、N20 這類把後段關鍵詞（ARC_184 / Lumen Arc / Gate 40）當迷因玩梗的留言很重要：它讓「關鍵詞」淹在玩笑裡，玩家得自己分辨哪句是玩梗、哪句是承重。這正是「在不討好的人群裡找線索」的核心手感。

### 3.4 排列與實作規則

1. **總量與計數：** 顯示 ~28 則，標題維持 `Discussion (142)`；可在底部放一則 `View 114 more comments`（不可點或點了只播 `ui.disabled`），維持總量幻覺。
2. **交錯順序：** 讓 3 則承重留言分別落在「上段、中段」的可見位置，不要三則相鄰。伏筆與雜訊填滿其間。建議固定順序（非承重可進偽隨機池），確保每次進來承重留言位置穩定、玩家重玩能記得路。
3. **視覺分層（可用性底線）：** 承重＝實心卡片；伏筆＝淡色小字、可加一條極細左緣線；純雜訊＝最淡、可壓成單行。**絕不可讓承重留言在視覺上和雜訊無法區分**——難度來自「量」，不是來自「藏」。
4. **偽隨機邊界：** 只有 N 類與部分 F 類可進 `shuffleFeed` 重排池；承重 3 則與其相對順序固定。重排不得改字、不得新增答案（沿用 [`pseudoFeed`](../src/lib/pseudoFeed.ts) 現有規則）。
5. **音效：** 捲動留言沿用 `phone.scroll` / 邊界 `phone.scrollLimit`；點 bot 業配等死連結播 `ui.disabled`；承重的 ARC_184 回覆維持既有 `playTick` → 進度音。不得為某則留言加獨特音效而暗示它重要。

---

## 4. Chapter 3–5 · Wayback Machine 與網站登入頁文案

這段涵蓋玩家在 Browser／Archive 裡會遇到的三個「站點狀態」，每個都要有可信的登入頁 / 閘門文案。三站分別對應三種聲音（§2）。

### 4.1 站點地圖

| 站點 | 出現時機 | 聲音 | 登入 / 閘門性質 |
| --- | --- | --- | --- |
| **SearchFinder**（通用搜尋結果頁） | 謎題 4 解讀 SKG 時 | 中性 slop | 無登入，但要有「一堆相似縮寫」的干擾結果 |
| **SKG Automation**（2026 現行站） | 謎題 4–5 | 2026 廉價層 | 「無人客服 bot」支援閘門，永遠 dead-end |
| **Silver Kite Games**（2014 快照） | 謎題 5 | 2014 誠懇層 | 舊網頁本體（已存在）＋更多部落格與破圖 |
| **Silver Kite Database Node**（移植殘留登入） | 謎題 8 | LAOS 殘留層 | 座標密碼登入（已存在，本節補全錯誤狀態） |

### 4.2 SearchFinder — SKG 消歧義干擾結果（謎題 4）

GDD 謎題 4 需要玩家從一堆相似縮寫裡排除、才鎖定 `SKG Automation`。現在 `browser-generic-result` 只丟一句「No matches found」。改成一份**擁擠的搜尋結果頁**，讓玩家自己刪去法：

```text
SearchFinder — results for "SKG"        About 47,300,000 results (0.38 seconds)

1. Smart Kitchen Group — Connected Cookware & Recipes
   smartkitchengroup.example · Sponsored
   Your fridge, but it has opinions. Subscribe to your own groceries.

2. Secure Key Gateway (SKG) — Enterprise Auth Middleware
   docs.securekeygateway.example
   API reference for SKG token rotation. Last updated 3 years ago.

3. Skyline Knowledge Grid — B2B Data Orchestration
   skg-grid.example
   Synergize your unstructured data lakes into actionable... [truncated]

4. Sustainable Kinetic Goods — Ethical Motion Products
   skg.eco
   We make things that move, responsibly. Carbon-neutral since last Tuesday.

5. SKG Automation — Legacy Asset Monetization
   skg-automation.com
   Formerly a games studio (2009–2014). Now 1.2M+ apps under automated management.
   〔← 唯一正解。刻意排在第 5，前面全是雜訊。括號裡的年份是可核對線索。〕

6. "skg" in Slang Dictionary — 4 conflicting definitions
7. SKG Airport (regional) — Departures & Arrivals
8. skg.tar.gz — index of /pub/mirrors/ (directory listing)
```

> 設計意圖：正解不在第一條，而且它自己就洩露「formerly a games studio 2009–2014」——這句把玩家從「一堆縮寫」導向「回溯 2014 快照」，是謎題 4→5 的橋。其餘 7 條純干擾，不可行動化。

### 4.3 SKG Automation — 無人客服 bot 支援閘門（謎題 4–5）

現有站點底部只有一句「Contact our unstaffed bot」。把它做成一個**點開後永遠繞圈的支援 portal**，讓「2026 沒有人」這件事變得可觸摸。這是本次要新增的登入頁核心之一。

**Portal 標題列**

```text
SKG Automation · Legacy Asset Support Node
STATUS: OPERATIONAL · HUMAN AGENTS: 0 · EST. WAIT: —
```

**Bot 開場（罐頭，打字機式逐行吐出）**

```text
ARC-BOT ▸ Hello, valued asset stakeholder. I am ARC-BOT, your unstaffed
          resolution assistant. How may I optimize your inquiry today?
```

**選單（三顆按鈕，全部 dead-end，各自吐一段罐頭）**

```text
[ I want to claim ownership of a legacy app ]
  ARC-BOT ▸ Ownership is a legacy concept. All catalog assets are managed
            programmatically for maximum monetization efficiency. Your
            sentiment has been logged. Ticket #AUTO-7731 — status: resolved.

[ Who created the original Skyline game? ]
  ARC-BOT ▸ Creator metadata was not retained during asset onboarding.
            No personnel records are available. Would you like a
            procedurally generated portrait instead? [ Y ] [ also Y ]
  〔指向：Noah 被抹除。禁止出現名字。「also Y」是冷笑話式無選擇。〕

[ Restore the old version of the game ]
  ARC-BOT ▸ Downgrades reduce lifetime ad exposure and are not supported.
            Have you considered upgrading your expectations instead?
```

**若玩家在輸入框打任何字（自由文字閘門）**

```text
ARC-BOT ▸ I've escalated this to a human specialist.
          (No human specialists are currently, or ever, scheduled.)
          Your request has been archived. It will be processed never.
```

**Cookie / 同意橫幅（若做，預設選最保護隱私那顆）**

```text
We value your data more than you do.
[ Accept everything ]   [ Manage 412 partners ]   ← 預設高亮「拒絕非必要」而非「全部接受」
```

**頁尾法律 slop**

```text
SKG Automation is not affiliated with, and disclaims all memory of, its
predecessor. Portraits generated on request. No personnel records maintained.
Established 2009. Reinvented 2014. Operated by nobody since.
```

> 這個 portal **不推進謎題**——它是死路，但死得有意義：它讓玩家親身撞到「公司把創作者刪掉了」。真正的線索仍在 2014 快照。若擔心玩家卡住，bot 第二顆按鈕的回答（creator metadata not retained）可作為「該去看舊版本」的軟提示。

### 4.4 Silver Kite Games 2014 — 更多部落格與破圖（謎題 5）

現有 [`indie-2014`](../src/components/BrowserApp.tsx) 有 2 篇 blog。補到 **5 篇**（時間由新到舊），讓「逐年剝開」有實感。伏筆規則同 §1.2。

```text
[BLOG A · 2013-06-02 · Noah Kade]  Log: We're partnering with Lumen Arc!
  Signed the deal today. A handheld that wants to keep you company for a
  lifetime, not a quarter. This is the platform of the future. I believe that.
  〔已知合法：Lumen Arc 合作。溫暖、樂觀，與後來的崩壞形成落差。〕
  broken image: launch_party_group_photo.jpg — image not archived
  〔破圖檔名暗示「有一群人」，不點名。〕

[BLOG B · 2013-11-20 · Noah Kade]  Log: Why 256, and why it ends
  People keep asking for infinite mode. I keep saying no. A flight that
  never lands isn't freedom, it's a treadmill. 256 gates, then you're done.
  That number isn't a limit. It's a promise I intend to keep.
  〔指向：有限終點的設計哲學。禁止描述「高度 0 落下」通關法。〕

[BLOG C · 2014-03-08 · Noah Kade]  Log: Skyline 256 Completion Build   ← 已存在，保留
  broken image: nk_altitude_final_184.gif — image not archived   ← 已存在，保留

[BLOG D · 2014-04-02 · Noah Kade]  Log: I left something in the last build
  I'm not going to explain it here. If you ever read the source the way it
  was meant to be read, you'll already know where to look. Some doors only
  open for the person patient enough to stop pushing.
  〔指向：隱藏路線的存在。刻意不可行動化——沒有數字、沒有機制。〕
  broken image: family_2014_do_not_publish.jpg — image not archived
  〔指向：Noah、Mara 與當時年幼的 Arcane。檔名說「別公開」，玩家看得到卻打不開，剛好呼應保存主題。〕

[BLOG E · 2014-04-14 · Noah Kade]  Log: The Recall Decision   ← 已存在，保留
  broken image: recall_notice_scan.jpg — image not archived   ← 已存在，保留
```

**舊網頁留言板 / 訪客簿殘條（新增一小塊，period-authentic）**

```text
GUESTBOOK (archived · 6 of 214 entries recovered)
  ▸ xX_skydiver_Xx (2013)   "finished all 256 last night. cried a little. thank you."
  ▸ mara_k (2014)           "proud of you. always." 〔← 僅 handle 縮寫，不出現全名 Mara Kade；
                                                       這是灰色地帶，若團隊認為太接近可刪。〕
  ▸ guest_00417 (2014)      "wait it ENDS?? games can do that??"
  ▸ [entry corrupted]       "▓▓▓▓ below zero ▓▓▓▓ don't submit it"
                            〔指向：−65535 與結局選擇。用損毀遮住關鍵，只留氣味。禁止出現數字。〕
  ▸ silverkite_admin (2014) "forum going read-only. servers won't last the year."
  ▸ [entry expired]         "message no longer available"
```

> `mara_k` 那條要小心：它靠近「提前洩漏 Mara」的紅線。**建議做法**：只用小寫 handle `mara_k`、不加姓、不連結任何檔案，讓它讀起來像上百個訪客之一；玩家此刻不會知道她是誰，直到謎題 6–7 才回頭恍然。若團隊仍覺得越線，直接改成 `m_k` 或刪除——伏筆的重量不依賴這一條。

### 4.5 Silver Kite Database Node — 登入頁錯誤狀態補全（謎題 8）

登入頁本體已存在於 [`MessagesApp.tsx`](../src/components/MessagesApp.tsx)（LAOS 殘留層）。本節只**補全並統一錯誤／狀態文案**，讓所有登入頁的「拒絕語氣」一致：耐心、冷、稍慢、對超前輸入的玩家帶一點乾幽默。

```text
FIELD LABELS
  CREATOR ID:            MARA_KADE (SEC_PARTNER)     ← disabled，已存在
  COORDINATE PASSWORD:   ARC___GATE__END___          ← placeholder 已存在

STATES
  空白提交:      COORDINATE STRING REQUIRED. THE NODE HAS WAITED TWELVE YEARS. IT CAN WAIT LONGER.
  格式錯誤:      CREDENTIALS REJECTED. ENSURE ARC, GATE, AND END VALUES ARE PROPERLY SEQUENCE-PAIRED.  ← 已存在
  正解但太早:    NICE TRY, TIME TRAVELER. FIND THE CLUES BEFORE THE PASSWORD FINDS YOU.  ← 已存在
  正解且合法:    （無錯誤字串，直接解鎖）
  第 3 次連錯:   HINT WITHHELD. HE LEFT THIS FOR SOMEONE WHO WALKS THE PATH, NOT SOMEONE WHO GUESSES IT.
                〔可選：連錯計數達 3 才出現，強化「自己走完」主題。不得洩漏答案。〕
```

### 4.6 Internet Archive 快照外框（Wayback chrome）

現有 2014 頁頂只有一條「ARCHIVED SNAPSHOT · 2014-04-14」。補一組**擬真的 Wayback 外框文案**，讓「這是被保存下來的東西」本身成為主題的一部分（呼應 Stop Killing Games）：

```text
TOP BAR
  ⟲ INTERNET ARCHIVE · WAYBACK MACHINE
  Saved 4 times between 2013 and 2014.   ‹ 2013-06-02 · 2013-11-20 · 2014-04-14 · 2014-04-20 ›
  This snapshot may be incomplete. Some page elements failed to load.   ← 部分已存在

SIDE NOTES（散落，淡色小字）
  ▸ robots.txt was ignored to preserve this capture.
  ▸ 3 images missing · 1 stylesheet partial · JavaScript disabled in archive view
  ▸ This page is preserved because someone chose to save it. Consider preserving something today.
    〔← 主題直球，但用 Archive 募款口吻包裝，不出戲。〕
```

---

## 5. 其他 App 內容池補充

以下較輕，列出方向與少量範例即可，實作時可依 §1、§2 規則自行擴寫。全部為風味，**不得承重**。

### 5.1 AmazeMart（謎題 3 · 購買假裝置）

- 目標：讓「花錢買到的其實是一疊截圖」這個轉折前，商品頁看起來像真的電商。
- 補充：假評論池（多為離題／機器人）、「常一起購買」推薦、退貨政策 slop、賣家 `SilverKite_Games` 的沉睡帳號徽章。

```text
LISTING: "Lumen Arc Handheld (Vintage / Untested / As-Is)"
  Sold by: SilverKite_Games  ·  ★ inactive seller · last online 12 years ago
  Condition: the listing says "like new." the listing is lying.

FAKE REVIEWS (mostly noise)
  ★☆☆☆☆ "arrived as a folder of screenshots. somehow still my favorite purchase."
         〔← 對玩家即將發生的事的黑色預告。〕
  ★★★★★ "great paperweight. does not turn on. as described (it was not described)."
  ★★★☆☆ "bot review, ignore" — verified by nobody
  ★☆☆☆☆ "recalled for a reason. mine got warm and so did my feelings."   〔指向：回收〕
```

### 5.2 FaceSpace 首頁 feed（雜訊池擴充）

- 現有 `FACESPACE_FEED` 已有 8 則風味貼文（含 `fs-5` 「記得手遊被允許結束的時候嗎」這種伏筆）。再加 4–6 則同調雜訊即可，維持「演算法沖刷的冷淡動態牆」。
- 建議新增一則極淡的伏筆：某個「舊遊戲保存社團」在招人，呼應第三結局的保存者社群（不點名 ARC_184）。

### 5.3 Messages 衰減殘條（母親分頁）

- 現有已有 `Message unavailable · expired from carrier archive` 與「Mara is typing…」永不完成。
- 可再加 1–2 條不同的衰減文案，讓「系統保留了格子，卻沒保留話」更有層次：

```text
  ▸ [voice message · 0:04 · could not be restored]
  ▸ "sweetheart did you eat" — sent 4 years ago, delivered today
    〔指向：記憶錯亂／時間感。不推進謎題。〕
```

---

## 6. 實作對照表

| 內容區塊 | 目標檔案 | 承重？ | 備註 |
| --- | --- | --- | --- |
| Chapter 1 影片留言 ×28 | [`ViewTube.tsx`](../src/components/ViewTube.tsx) `#vt-comments` | 僅既有 3 則 | 新增留言抽成陣列常數；承重 3 則位置固定，其餘可進偽隨機池；三層視覺分級 |
| `View 114 more` 死按鈕 | 同上 | 否 | 點擊播 `ui.disabled` |
| SearchFinder 干擾結果 | [`BrowserApp.tsx`](../src/components/BrowserApp.tsx) `#browser-generic-result` | 否 | 取代單句 no-match；第 5 條為正解橋 |
| SKG 無人 bot portal | [`BrowserApp.tsx`](../src/components/BrowserApp.tsx) 2026 分支 | 否 | 新子畫面或 modal；全 dead-end |
| Silver Kite blog A/B/D + 訪客簿 | [`BrowserApp.tsx`](../src/components/BrowserApp.tsx) `#indie-blogs` | 否 | C/E 保留；破圖檔名照 §4.4 |
| Wayback 外框補文 | [`BrowserApp.tsx`](../src/components/BrowserApp.tsx) `#indie-2014` 頂部 | 否 | 純氛圍 |
| DB Node 錯誤狀態補全 | [`MessagesApp.tsx`](../src/components/MessagesApp.tsx) `handleAdminLogin` | 否（登入本身承重） | 只加空白／連錯狀態字串 |
| AmazeMart 假評論池 | `AmazeMart.tsx` | 否 | |
| FaceSpace feed +4–6 | [`SocialApp.tsx`](../src/components/SocialApp.tsx) `FACESPACE_FEED` | 否 | 進現有 shuffle |
| Messages 衰減殘條 ×1–2 | [`MessagesApp.tsx`](../src/components/MessagesApp.tsx) mom 分頁 | 否 | |

### 6.1 驗收清單

- [ ] 影片留言區給人「翻找」感：捲動距離變長，承重 3 則仍能被視覺分級認出。
- [ ] 全文件無任何字串在其謎題階段前洩漏 §1.2 的五類機密（名字／密碼／高度／負分／256 通關法）。
- [ ] 偽隨機重排後，承重內容與相對順序不變，謎題依賴鏈完好（`canUseProgressionAction` 行為不變）。
- [ ] 三種聲音（§2）不混用：2026 slop、2014 誠懇、LAOS 殘留各自純粹。
- [ ] 所有新死路（bot portal、死按鈕）都有對應音效且不誤導其為重要線索。
- [ ] `tsc` 乾淨、既有測試全綠（新增內容不得破壞 `tests/*` 對既有 id/class 的斷言）。

---

> **一句話總結：** 這次更新不加謎題、不改答案，只把每個畫面從「一張提示卡」變成「一個冷淡、擁擠、真的被人用過又被人遺忘的地方」——玩家在其中翻找的過程，本身就是這款遊戲想講的事。
