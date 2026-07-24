# Chapter 2 主角內心獨白規格

> 狀態：A 版結尾已核准並接入遊戲。範圍從 Chapter 1 讀完 ARC_184 的回覆開始，到主角確認封存檔只能由 Lumen Arc 開啟、進入 Chapter 3 為止。

## 本章作用

Chapter 2 不是讓主角替玩家解副檔名選擇題，而是讓兩人一起瀏覽一個像真的舊遊戲封存站。獨白只整理已經看見的線索、對錯誤方向做輕微判斷，並在關鍵檔案被玩家自己找到後承認推論成立。

本章的情緒變化很小，但必須存在：開頭仍把事件當成一次作弊調查；結尾第一次讓 Lumen Arc 與主角模糊的家庭記憶碰在一起。主角不因此立刻理解母親、遊戲作者或整個真相。

## 主角此時知道什麼

進入 Chapter 2 時，主角只允許知道：

- ARC_184 的影片沒有剪接，他確實穿過 Gate 40。
- ARC_184 提到 Lumen Arc、LAOS、原生高度感測器，以及被回收的裝置。
- 同一串 ViewTube 留言提供 `Skyline256_LAOS_Final.ipa`，但主角仍需確認它屬於哪種封裝與哪個平台。
- 現行版本與 ARC_184 當年運行的版本可能不同，因此值得尋找舊版遊戲檔案。

主角此時不得知道：

- `.ipa` 一定是正確分類。
- SKG、Silver Kite Games、SKG Automation。
- Noah Kade、Mara 或任何後續人物。
- 母親留下的裝置目前在哪裡，或它是否還能使用。
- Chapter 3 應該去哪個 App、購買哪一件商品。

## 核心聲音

- 語氣：觀察細、克制、略帶乾笑；看到死連結與企業遺跡時有一點不耐煩。
- 推理：只根據頁面上的格式、平台、年代和檔名逐步排除。
- 陪伴感：玩家走錯分類時，主角承認那是一個合理猜測，不把錯誤說成失敗。
- 情緒：直到最後才出現非常短的家庭記憶，而且主角自己也不完全信任那段記憶。
- 禁止：說 `Choose IPA`、`This is the correct file`、`Click the third result`，或直接公布下一章要購買 Lumen Arc。
- 顯示：全部使用英文；每次一至兩句，出現在 `YOU · LOCAL PLAYER` 的 `LIVE TRANSCRIPT`。

## 主線事件

| 玩家事件 | 顯示台詞 |
|---|---|
| Chapter 1 結束、進入 Chapter 2 | `Gate forty was not always the end. The Legacy build proves that much.` / `The filename survived. Now I need to find out what kind of thing it is.` |
| 第一次回到首頁 | `Old software leaves traces.` / `Mirrors, backups, forgotten download pages.` |
| 打開 Browser | `Start broad. I am looking for an old game file, not the whole story.` |
| 看見 SearchFinder 首頁 | `The modern web, helpfully burying the past under shopping advice.` |
| 點擊 `I want to find an old game file` | `An actual file index. That's better than another article about nostalgia.` |
| Archive landing page 首次出現 | `Most of these mirrors are dead.` / `The filenames may still tell me what survived.` |
| 聚焦封存站的檔名搜尋 | `The comment gave me a filename.` / `Now I need the package category that actually contains it.` |
| 第一次切換格式標籤 | `Different devices, different packages.` / `One of these belongs to LAOS.` |
| 進入 `.ipa` 列表 | `Application packages.` / `Now I need the build that matches the recording.` |
| 點開 `Skyline256_LAOS_Final.ipa` | `Skyline 256.` / `LAOS 4.1, indexed in 2014. This could be his build.` |
| 嘗試開啟封存檔 | `The file survived. This device just cannot understand it.` / `Lumen Arc. Of course.` |
| 看見 Lumen Arc 相容性要求、完成 Chapter 2 | `Mom had one. I remember the silver edge beside the kitchen sink.` / `I do not know where it went. I need another way to find one.` |

## 格式標籤與錯誤方向

這些台詞只在玩家主動查看相應分類後出現。它們可以協助排除，但不能在玩家尚未點擊前預告正確格式。

| 玩家查看的分類 | 回應方向 | 台詞草稿 |
|---|---|---|
| `.zip` | 內容可能是壓縮資料、掃描或素材，不能直接證明是可執行舊版 | `Press kits, scans, mixed backups.` / `Useful evidence, maybe. Not a runnable build.` |
| `.apk` | 頁面已標明 Android，與 LAOS 不符 | `Android packages.` / `Reasonable guess. Wrong operating system.` |
| `.jar` | Java ME／MIDP 舊手機格式，年代合理但平台不符 | `Old enough, but built for Java phones.` / `ARC_184 said LAOS.` |
| `.sis` | Symbian 安裝檔，仍是另一個被淘汰的平台 | `Another dead mobile platform.` / `Not the one from the video.` |
| `.ipa` | 只承認此處值得繼續讀，不宣布答案 | `Application packages.` / `Let's read the records before deciding anything.` |

## 無法開啟的其他檔案

點擊或嘗試處理非目標紀錄時，從以下短句輪替。這些句子不應把玩家推回 `.ipa`，只描述目前紀錄為何不夠：

- `A filename and no mirror. Story of this entire site.`
- `Metadata only. Not enough to run, but enough to rule it out.`
- `Expired signature. The file outlived whoever vouched for it.`
- `Incomplete upload. Close, in the least useful way possible.`
- `Wrong build. Same ruins, different room.`
- `Nothing opens. The index is doing more archaeology than hosting.`

## 搜尋與提前輸入

玩家可以在封存站搜尋檔名。完整 IPA 名稱已由 ViewTube 留言提供，因此主角可以承認來源，但不能因此直接宣布目前分類或檔案就是正解。

| 提前或無關輸入 | 回應方向 | 台詞草稿 |
|---|---|---|
| 空白搜尋 | 保持輕微吐槽 | `Searching every filename at once. Technically efficient.` |
| 直接輸入完整 `Skyline256_LAOS_Final.ipa` | 承認來自留言，但不公布分類答案 | `That is the filename from the comment.` / `I still need the archive category that contains it.` |
| `Lumen Arc` | 已知道裝置名稱，但目前目標是辨識舊版 | `I know the device name.` / `I still need to know what it was running.` |
| `SKG`／Silver Kite | 尚無任何證據連結這些名稱 | `Three letters and no context.` / `That is not a lead yet.` |
| Noah／Mara | 仍是未取得的未來人物 | `That name has not appeared anywhere.` |
| `Gate 40` | 已完成影片調查，應回到軟體版本 | `I know where the trick happened.` / `Now I need the software that allowed it.` |
| 其他遊戲名稱 | 當成合理但不相關的封存探索 | `Another game that almost disappeared.` / `Not the one from the recording.` |

## 在錯誤 App 中的陪伴台詞

| App | 台詞草稿 |
|---|---|
| ViewTube | `I have squeezed everything useful out of that video for now.` |
| Flappy game | `The current version will keep killing me at forty. That is the problem.` |
| AmazeMart | `Buying random dead hardware before I know the required build seems expensive.` |
| FaceSpace | `I do not have a person to search for.` |
| Messages | `Nobody in my messages sent me a twelve-year-old game build.` |
| Screenshots | `Still empty. Apparently the past did not organize itself for me.` |
| About | `Preservation is the point. This is not the evidence.` |

重複回到首頁或長時間沒有進展時，可輪替：

- `The file existed once. That is enough to leave a trail.`
- `I am not stuck. I am reading very slowly on purpose.`
- `Old platform. Old build. One step at a time.`
- `The answer should look like a file, not a prophecy.`

## 結尾記憶決策

A 已由使用者核准並成為正式版本。

### A．模糊但具體（目前建議）

`Mom had one. I remember the silver edge beside the kitchen sink.`

`I do not know where it went. I need another way to find one.`

優點是有一個可見的生活細節，但不交代母親、裝置與遊戲之間的答案。它也保留「這段記憶是否可靠」的空間。

### B．更克制，延後家庭線

`I've seen a Lumen Arc before.`

`I cannot place where. Not yet.`

優點是謎團更乾淨；缺點是 Chapter 2 的情緒變化較弱，也會延後 GDD 原本安排的母親記憶。

### C．更明確地連到母親

`Mom kept a Lumen Arc after the recall.`

`If she still has it, the old system may be buried under years of updates.`

優點是 Chapter 3 動機非常清楚；缺點是主角知道得較多，容易讓後續購買／尋找舊裝置的探索顯得多繞一步。

## 已確認的設計邊界

1. 主角在 Chapter 2 結尾明確說出 `Mom`，採用 A 的銀色邊緣與廚房水槽記憶。
2. `Skyline 256` 第一次出現在檔名時，主角要不要把 `256` 與遊戲分數上限聯想在一起；目前草稿沒有替玩家下這個結論。
3. 主角對封存站的吐槽是否太多；目前控制在環境觀察，沒有嘲笑玩家。
4. Chapter 2 完成點目前定義為「嘗試開啟目標 IPA 並看見 Lumen Arc 相容性錯誤」，不是成功下載或儲存檔案。

## 實作接線範圍

正式台詞位於 `src/lib/chapterTwoDialogue.ts`，並接入章節進入、首頁、Browser、Trending lead、Archive landing、搜尋框、五個格式標籤、目標檔案紀錄、相容性錯誤、錯誤 App 與重複操作。

正式接線時必須保證：

- Chapter 1 的 dialogue state 不會滲入 Chapter 2。
- 每個事件只在玩家實際看見對應證據後說話。
- 重複操作採輪替短句，不把兩句主線提示無限重播。
- 完成 Chapter 2 前不得說出 AmazeMart、SKG、Silver Kite 或 Noah。
- 自動測試檢查英文限定、知識邊界、事件接線與章節完成點；語氣仍由人工審核決定。
