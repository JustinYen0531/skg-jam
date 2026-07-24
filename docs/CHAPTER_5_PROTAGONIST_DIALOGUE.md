# Chapter 5 主角內心獨白規格

> 狀態：草案，待人工審核台詞語氣。範圍從 Chapter 4 確認遊戲真名 `SKG` 開始，到主角搜尋 SKG、穿過 SKG Automation 那層無人的 2026 企業外殼、把 Snapshot 時間軸拖回 2014、看見被覆蓋掉的原始工作室 Silver Kite Games 與開發者 Noah Kade、進入 Chapter 6 為止。

## 本章作用

Chapter 5 是「被覆蓋的公司」。玩家拿 Chapter 4 得到的 `SKG` 去搜尋，先撞上一整面把「SKG」洗成任何別的東西的雜訊，再進到 SKG Automation——一個無人、全自動、把停產遊戲當資產變現的 2026 企業網站。玩家必須自己想到：現在的 SKG 是空的，真正的東西被埋在時間軸更早的位置。把 Snapshot 拖回 2014，原本的 Silver Kite Games 才會浮出來。

本章的情緒轉折是「第一次看見一個人」。前四章主角在追一次作弊、一台裝置、一包截圖；到 Chapter 5，2026 的企業殼越自動、越無人，2014 的部落格就越像有溫度的真人。主角對企業殼的乾式諷刺會更利、更冷，但讀到 Noah Kade 親手寫的字時會安靜下來、收起玩笑。他第一次隱約意識到：把這間工作室埋掉的那種自動化空洞，和他整場遊戲一路穿過的，是同一種東西。

本章同時讓 `Noah Kade` 這個名字第一次出現，成為 Chapter 6 的搜尋對象。

## 主角此時知道什麼

進入 Chapter 5 時，主角只允許知道：

- 遊戲真名是 `SKG: Skyline 256`（Chapter 4）；`SKG` 是一個可以搜尋的詞。
- ARC_184 的分數 `184`、Gate 40 是牆、256 是上限、`Skyline256_LAOS_Final.ipa` 是 2014 LAOS 4.1 舊版、需要 Lumen Arc、母親曾有一台。

主角此時不得知道（直到 2014 站台逐步揭露前 / 本章結束前）：

- Silver Kite Games、Noah Kade、Elias。
- `SKG` 就是被重組成 SKG Automation、把原工作室蓋掉的那間公司——這正是本章要揭露的真相，不能在搜尋或企業殼階段就先講破。
- 回收事件的細節、`I left something in the last build` 那條隱藏路線的用途。
- 留言板裡 `m_k`、`▓▓▓ below zero ▓▓▓ don't submit it` 的含義（後續章節）。
- Mara、admin 登入、密碼字串、任何結局。

特別注意：主角在真正載入 2014 站台之前，不得預先說出「SKG 是被埋掉的工作室」。搜尋撞牆與 2026 企業殼只能讓他「越查越覺得這個名字被洗掉、被自動化蓋過」，把真相留給玩家自己把時間軸拖回去揭開。

## 核心聲音

- 語氣：一致的乾式幽默、半調侃；面對 2026 自動化企業殼時諷刺更利、更冷，帶一點克制的不屑；讀到 2014 真人字句時安靜下來、不吐槽。
- 推理：從「搜尋結果被廣告洗掉」「企業網站上沒有一個人名」「時間軸只有 2014 真的存到東西」逐步判斷真正的內容在更早的年份。
- 陪伴感：玩家點錯 disambiguation 結果、被側欄廣告吸走、跟無人 bot 對話、把時間軸拖到沒有快照的年份時，主角都補一句短吐槽，承認那是合理的亂點，不把它說成失敗，也不嘲笑玩家。
- 情緒：最後在 2014 站台不擴寫、不煽情；只承認「有人把這個保存了下來」，並記下一個能往下查的名字。
- 禁止：說 `Click the SKG Automation result`、`Drag the slider to 2014`、`This is Noah Kade's studio`、或提前說出 Elias／Mara／密碼。
- 顯示：全部使用英文；每次一至兩句，出現在 `YOU · LOCAL PLAYER` 的 `LIVE TRANSCRIPT`。

## 主線事件

| 玩家事件 | 顯示台詞 |
|---|---|
| Chapter 4 結束、進入 Chapter 5 | `SKG is a name now, not just three letters.` / `Time to find out what it turned into.` |
| Browser 首次開啟、SearchFinder 首頁 | `SearchFinder. The web, arranged by whoever paid the most for it.` |
| 聚焦搜尋框 | `One word: SKG. Let's see how far the ads let me get.` |
| 搜尋 `SKG`（相關）、看見 disambiguation 結果 | `Eight results, and the engine is trying very hard to make those letters mean anything but a studio.` |
| 點開 bridge：`SKG Automation — Legacy Asset Monetization` | `"Formerly a games studio. Two thousand nine to two thousand fourteen."` / `Something happened to it the year it stopped.` |
| 看見 SKG Automation 2026 企業殼 | `A whole company, and not one human name anywhere on it.` / `They didn't shut the studio down. They automated the corpse.` |
| 讀到 footer `Established 2009. Reinvented 2014.` | `"Reinvented." That's a generous word for whatever this replaced.` |
| 第一次注意 Snapshot 時間軸 | `This page is all present tense. The studio lived in an earlier one.` / `The reel goes back further than 2026.` |
| 把時間軸拖到 2014 以外的年份 | 見〈時間軸與沒有快照的年份〉輪替 |
| 拖到 2014、載入 Silver Kite Games 站台、完成 Chapter 5 | `There. Before the automation buried it.` / `Silver Kite Games. A person actually made this.` |

拖到 2014 的那一刻即完成 Chapter 5（與 `handleYearChange` 一致）。載入後玩家會在同一頁往下讀部落格，那段閱讀是 Chapter 5 的情緒收尾、同時把 `Noah Kade` 交給 Chapter 6，其台詞見〈2014 站台上的閱讀〉。

## Disambiguation 搜尋結果（七個把 SKG 洗成別的東西的誘餌）

搜尋 `SKG` 後出現八個結果，只有 `SKG Automation` 那一個是真的；其餘七個是把三個字母洗成別的產業的雜訊。玩家點到任何一個誘餌都值得一句專屬吐槽——這正是本章最該補足的「按錯地方的小吐槽」，每個誘餌各給一種語氣，不共用同一句。

| 玩家點到的結果 | 台詞草稿 |
|---|---|
| `Smart Kitchen Group`（會訂閱你的冰箱） | `A fridge with a subscription plan. Not the SKG I'm looking for, thankfully.` |
| `Secure Key Gateway`（企業驗證中介） | `Enterprise auth middleware. Three letters, zero relevance, last updated never.` |
| `Skyline Knowledge Grid`（B2B 資料） | `It has the word "Skyline" in it and still manages to mean absolutely nothing.` |
| `Sustainable Kinetic Goods`（碳中和） | `"Carbon-neutral since last Tuesday." I believe every word of that.` |
| `"skg" in Slang Dictionary`（四個矛盾定義） | `Four definitions, three of them typos. The internet, summarized.` |
| `SKG Regional Airport`（兩個登機門） | `An airport. Two gates, one permanently delayed. At least it's honest.` |
| `Index of /pub/mirrors/skg.tar.gz`（permission denied） | `A file behind a permission wall. The story of every useful thing online.` |
| bridge：`SKG Automation`（唯一承認自己曾是工作室） | 走主線的 `"Formerly a games studio…"` |

若玩家反覆點誘餌，維持輪替、不重播同一句；主角可以偶爾補一句「這搜尋引擎比我還努力假裝 SKG 不是一間工作室」的整體吐槽。

## 不相關搜尋（OFFTOPIC）

玩家如果搜尋和 SKG／Silver／Kite 無關的字，只會拿到一堆填充結果（生產力 App、天氣、促銷、冰箱論壇）。從以下短句輪替：

- `I searched for a studio and got a weather forecast. Efficient.`
- `Deals near me. The past, unfortunately, is not on sale.`
- `Whatever I just typed, it wasn't the name. The engine noticed and gave up.`
- `Seventeen productivity apps. Zero of them remember a games studio.`

## 側欄入口噪音（Portal 廣告）

搜尋頁與封存頁兩側的 portal 噪音都是可點的廣告與推薦。玩家被它們吸走時，從以下短句輪替，語氣是對「介面每個角落都在賣東西、就是沒人記得那間工作室」的冷吐槽：

- `The margins are advertising at me. Hard pass.`
- `Sponsored, trending, recommended. None of it remembers a studio.`
- `Everything on this page wants a click except the one thing I need.`
- `The whole layout is monetized. The history is the only thing nobody's selling.`

## 2026 企業殼與無人的 ARC-BOT

SKG Automation 的 2026 網站是全自動、無人維護的。主角面對它時諷刺最利；這裡也埋著「他們刪掉了人、只留下資產」的伏筆，但主角不得因此直接說出被埋工作室的真相。

| 玩家看到／點到 | 台詞草稿 |
|---|---|
| 企業統計（`1.2M+ Apps Auto-Replaced`、`100% Unstaffed`） | `1.2 million apps "auto-replaced." Somebody made each of those once.` |
| Leadership Matrix（生成的臉、無人事紀錄） | `Faceless leadership, portraits generated on request. Nobody is actually in there.` |
| 開啟 ARC-BOT（0 human agents） | `A support bot with zero human agents and infinite patience. Ask it anything, receive nothing.` |
| bot 回覆 `ownership`（所有權是過時概念） | `"Ownership is a legacy concept," says the company that owns fourteen thousand things it didn't make.` |
| bot 回覆 `creator`（無創作者紀錄／生成頭像） | `No creator on record. They scraped the game and forgot the person who wrote it.` |
| bot 回覆 `restore`（升級你的期待） | `"Upgrade your expectations." I'll treasure that one.` |
| bot 自由輸入（轉接不存在的專員） | `Escalated to a human specialist who is never, ever scheduled. Naturally.` |

## 時間軸與沒有快照的年份

Snapshot 時間軸橫跨 2008–2026，但只有 2014 真的存到頁面，其餘每一年都是空的（`no snapshot`）。玩家拖到錯的年份時，用以下短句把他推向「只有某一年存了東西」的直覺，但不直接說出 2014。

- 拖到 2015–2025（較新）：`Newer snapshots. Same automated nothing, just fresher.`
- 拖到 2008–2013（更早，仍空）：`Nothing saved before it existed. Keep sliding until a page actually loads.`
- 拖到最底 2008：`The reel bottoms out on an empty year. Too early to have left a trace.`
- 拖過中間任一空年：`The label ticks. The page doesn't. Only one year here actually kept anything.`

## 2014 站台上的閱讀

載入 2014 的 Silver Kite Games 站台後（此時章節已推進），玩家會往下讀部落格、留言板與封存下載區。主角在這裡不擴寫、不煽情，語氣安靜；同時第一次讀到 `Noah Kade` 這個名字，交給 Chapter 6。

| 玩家讀到 | 台詞草稿 |
|---|---|
| 站台標題 `SILVER KITE GAMES` | `Silver Kite Games. The name the corporate version scrubbed off.` |
| 任一部落格署名 `Noah Kade` | `Every log is signed. Noah Kade. That's the name I take with me.` |
| `Log: Why 256, and why it ends` | `"256 gates, then you're done. A promise, not a limit."` / `He built the ending on purpose.` |
| `Log: We're partnering with Lumen Arc!` | `The same handheld Mom kept. This studio put the game on it.` |
| `Log: The Recall Decision`（回收 + 夥伴重組成 SKG Automation） | `A recall killed the hardware. A partner turned what was left into a catalog.` / `So that's what buried it.` |
| 死連結與缺圖（Forum offline、`*_not_archived`、guestbook 損毀） | 見〈2014 站台上的死連結與碎片〉 |
| `I left something in the last build`（隱藏路線伏筆） | `He left something in the final build. He won't say what.` / `Not yet. I don't even know where to look.` |
| 損毀留言 `▓▓▓ below zero ▓▓▓ don't submit it` | `One entry's corrupted down to a warning. "Don't submit it." Submit what?` |

主角讀到 `Elias`（在回收與重組段落）時，只能當成「那個把遊戲看成資產的夥伴」，不得預先說出他是誰、也不得展開後續。

## 2014 站台上的死連結與碎片

老站台上大量連結已失效、圖片沒被封存、留言只剩片段。玩家去點這些死東西時，從以下短句輪替，語氣是安靜的、對「保存本身也在流失」的乾式感嘆，不再是對企業殼那種利的諷刺：

- `The forum was already read-only. Everyone left before the servers did.`
- `The photos didn't survive the archive. Only the captions, describing what's gone.`
- `Half the guestbook is corrupted. The other half is people saying goodbye.`
- `A visitor counter still ticking, and a webmaster inbox that bounces. The site outlived its own mail.`

## 在錯誤 App 中的陪伴台詞

| App | 台詞草稿 |
|---|---|
| ViewTube | `The recording gave me the score. This is where the score's studio went to die.` |
| AmazeMart | `I already bought the screenshots. Now I'm reading what they pointed at.` |
| Screenshots | `I found the name in there. The web is where I see what happened to it.` |
| FaceSpace | `Give me a name first. The old site should be about to hand me one.` |
| Flappy game | `Same wall at forty. The people who built it are a search away now.` |
| Messages | `Nobody messaged me a corporate history. I have to dig this one up.` |
| About | `Preservation is the whole point today. I'm watching a company that chose the opposite.` |

重複回到首頁或長時間沒有進展時，可輪替：

- `The current SKG is a wall of ads. The real one is older than this page.`
- `Search, sidebar, support bot. All present tense. I need the past.`
- `Somewhere on that reel is the year it was still a studio.`
- `They kept the assets and deleted the people. The archive did the opposite.`

## 結尾選擇

以下三版都停在「拖回 2014、看見 Silver Kite Games、確認是真人做的、並記下一個能往下查的名字 Noah Kade」，不得解讀回收全貌、`m_k`、隱藏路線，或任何結局。

### A．克制、直接接回調查（目前建議）

`Silver Kite Games. A person made this, and then something automated straight over it.`

`Every log carries one name: Noah Kade. That's where I go next.`

優點是先坐實「被覆蓋的公司」這個主題，再自然把 `Noah Kade` 交給 Chapter 6；不提前解讀回收或家庭線。

### B．對企業的諷刺更利

`The company deleted the people and archived the assets.`

`The internet did the opposite, and kept a name: Noah Kade.`

優點是延續本章對自動化企業的冷諷；缺點是章末溫度較低，可能削弱「第一次看見一個真人」的轉折。

### C．保存主題更明顯

`Two thousand fourteen. Preserved because someone chose to save it.`

`Under all the automation, one name survived: Noah Kade.`

優點是直接呼應整部作品的保存主題；缺點是比較像作者總結，主角此時可能顯得太快理解全貌。

## 待確認的設計邊界

1. 七個 disambiguation 誘餌是否每個都值得一句專屬吐槽；本章刻意採「一個誘餌一種語氣」以補足前一章偏少的按錯吐槽，需確認整體節奏不會太鬧。
2. 對 2026 企業殼的諷刺利度是否過頭；目前控制在對「自動化、無人、把遊戲當資產」的冷吐槽，不嘲笑玩家、也不在企業殼階段講破真相。
3. 主角在 2014 站台讀到 `Noah Kade` 立刻記名是否太快；設計上 `Noah Kade` 正是 Chapter 6 的搜尋詞，因此在此第一次出現、被記下是合理的，但不得展開成人物故事。
4. 章節完成點定義為「把時間軸拖到 2014、Silver Kite Games 站台載入」；此後的部落格閱讀屬於情緒收尾與 Chapter 6 的橋接，需確認 dialogue 接線不把「已推進到 Chapter 6」誤當成錯誤狀態。

## Runtime 接線範圍

正式台詞應新增 `src/lib/chapterFiveDialogue.ts`，並接入 `BrowserApp`（Chapter 5，即 `progress.currentChapter === 5`）：

- Chapter 5 進入、SearchFinder 首頁（`#browser-landing`）、搜尋框（`#browser-address-input`）聚焦。
- 送出搜尋：相關（`isSkgRelated`）→ disambiguation 結果；不相關 → OFFTOPIC 輪替；`skg-locked` 僅為 Chapter 4 未完成時的保險狀態，Chapter 5 不應觸發。
- Disambiguation 八個結果：bridge（`SKG Automation`，`openSkgResult`）走主線；七個誘餌各自的專屬吐槽。
- 側欄 portal 噪音（`handlePortalDistraction`、`search-trending-*`）的輪替吐槽。
- SKG Automation 2026 企業殼（`#corporate-2026`）、ARC-BOT（`#skg-bot-trigger`／`#skg-bot-portal`）四種回覆、企業統計與 Leadership Matrix。
- Snapshot 時間軸（`#wayback-scrubber`／`#wayback-year-label`）：拖到 2014 以外年份的〈沒有快照〉輪替；拖到 2014 載入 `#indie-2014` 的完成句。
- 2014 站台（`#indie-2014`／`#indie-blogs`／`#indie-guestbook`／`#browser-archive-box`）的閱讀句與死連結碎片輪替。
- 錯誤 App 與重複操作的陪伴輪替句。

正式接線時必須保證：

- Chapter 2 的封存站流程（trending 的 `I want to find an old game file`、`ChapterTwoArchiveFinder`）只在 `currentChapter === 2` 出現，Chapter 5 不重用其台詞。
- 每句話只在玩家實際看見或點到對應內容後出現。
- 只有把時間軸拖到 2014、Silver Kite Games 站台載入才完成 Chapter 5（與 `completePuzzleChapter(prev, 5, …)` 一致）；disambiguation 誘餌、企業殼、bot、空年份都不得推進章節。
- 載入 2014 站台之前，獨白不得先說出 Silver Kite Games、Noah Kade、Elias 或「SKG 是被埋掉的工作室」。
- `Noah Kade` 的名字第一次出現在 2014 站台，並作為 Chapter 6 的搜尋詞；本章不得展開 Elias、`m_k`、隱藏路線或結局。
- 自動測試檢查英文限定、知識邊界、事件接線與完成點；語氣、諷刺利度與閱讀節奏仍由人工審核決定。

## 手動實測路線

1. 執行 `npm run dev`，開啟 `http://localhost:3000/?debug=true`。
2. 在 Developer Debug Mode 選擇 Chapter 5，關閉面板；桌面、雙手、手機與底部對話框應繼續存在。
3. 打開 Browser，確認落在 SearchFinder 2026 首頁，且 trending 沒有 Chapter 2 的封存入口。
4. 在搜尋框輸入不相關字（如 `weather`），確認出現 OFFTOPIC 結果與〈不相關搜尋〉輪替；點兩側 portal 廣告，確認〈側欄入口噪音〉輪替。
5. 搜尋 `SKG`，確認出現八個 disambiguation 結果；逐一點七個誘餌，確認每個都有專屬吐槽、且不進入企業網站。
6. 點 `SKG Automation` bridge 進入 2026 企業殼；開 ARC-BOT，逐一點四種回覆，確認冷諷吐槽；讀企業統計與 Leadership Matrix。
7. 操作 Snapshot 時間軸：先拖到 2020、2010、拉到最底 2008，確認顯示 `no snapshot` 與〈沒有快照〉輪替、頁面不變；再拖到 2014，確認載入 Silver Kite Games 站台並完成 Chapter 5、進入 Chapter 6。
8. 在 2014 站台往下讀：確認讀到 `Noah Kade`、`Why 256`、回收段落時的安靜語氣；點死連結（Forum offline、缺圖、損毀留言），確認〈死連結與碎片〉輪替；確認獨白不提前說出 Elias 身分、`m_k` 或隱藏路線用途。
9. 完成前後分別打開 ViewTube、AmazeMart、Screenshots、FaceSpace，確認錯誤 App 陪伴句符合本章知識邊界，且不提前揭露後續答案。

自動驗證只檢查事件接線、知識邊界、英文限定與完成點；語氣、諷刺利度及是否真的有陪伴感，保留給玩家實測判斷。
