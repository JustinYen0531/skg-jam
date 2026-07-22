# SKG: Scorekeeper 核心音樂語言與生成提示詞

> 文件用途：所有 BGM 生成、改編、混音與遊戲內播放版本，都必須以本文件為共同依據。十一個階段不是十一首新曲，而是同一份音樂檔案在十二年中被覆蓋、損壞、讀取與補全的十一種狀態。

## 1. 核心語言原文

它不是配樂，而是一份被封存在遊戲裡十二年的音樂檔案。它不知道自己正在敘事，也不知道玩家正在調查它，因此它從來不刻意煽情，不刻意懸疑，不刻意恐怖。它始終保持著一首早期手機遊戲 BGM 該有的單純，只是在不同階段逐漸遺失、逐漸甦醒、逐漸補全。旋律永遠是同一首，真正改變的是時間留下的痕跡：樂器變少、音色老化、資料殘缺、錄音品質改變、頻率被削掉、播放器偶爾失真，彷彿玩家不是在聽新的音樂，而是在一層一層挖出被更新覆蓋的舊版本。直到最後，玩家第一次聽見完整的旋律，才明白這首歌從來沒有結束，只是十二年來，再也沒有人走到它的最後四個小節。

## 2. 不可變規則

1. 所有階段使用同一首旋律，不得替每章重新創作新主題。
2. 目前以固定 12 小節為製作基準：第 1–8 小節是反覆出現的核心旋律，第 9–12 小節直到真正抵達 256 才首次完整播放。
3. BPM、拍號、調性、和聲骨架與主要旋律音高固定；階段差異只來自配器、缺失資料、播放器狀態與保存品質。
4. 音樂不理解劇情，所以不使用恐怖、懸疑、悲傷或勝利的電影式提示。
5. 最終版本的「完整」是旋律終於走完，不是突然變成史詩管弦樂或現代高品質製作。
6. 十二年痕跡必須可以被聽見：單聲道、低取樣率、低位元率、高頻削減、時鐘漂移、缺失聲部、截斷循環與偶發失真都可以使用。
7. 每個新階段要保留上一階段的少量痕跡，像考古剝落，而不是突然換歌。

## 3. 防止隨機生成的製作方法

AI 音樂工具不一定能只靠文字提示穩定重現同一段旋律，因此製作時必須遵守以下順序：

1. 只生成一次「母版旋律」，選定後鎖定音訊參考、seed（若工具提供）、BPM、調性與 12 小節結構。
2. 保存母版的 MIDI、音訊或可重複上傳的 reference clip；後續十一階段都從這份來源衍生。
3. 優先要求 remix、variation、audio-to-audio 或 stem edit，不要重新用純文字從零生成。
4. 每次只修改一組變因，例如移除鼓、削減高頻或改成單聲道，不同時重寫旋律與配器。
5. 每次生成後核對第 1–8 小節旋律音高與節奏；若主旋律被改寫，即使氣氛正確也必須退回。
6. 第 9–12 小節在前十個階段不得被提前生成或洩漏；可以用截斷、循環重啟、靜音資料或無法解碼的尾端代替。

## 4. 十一階段安排

| 音樂階段 | 對應流程 | 固定旋律的保存／播放狀態 |
|---|---|---|
| 01 | Chapter 0：廉價 AI Flappy Bird | 明亮、過度壓縮的早期手機遊戲 BGM；方波主旋律、廉價鼓機與簡單和弦。第 8 小節後粗暴跳回開頭，讓缺少最後四小節看起來只是普通循環。 |
| 02 | Chapter 1：尋找 ARC_184 | 拿掉完整鼓組，只剩主旋律、薄低音與廉價節拍點。循環接點短暫卡頓，像播放器重新載入。 |
| 03 | Chapter 2：尋找舊版本 | 主旋律改成低解析單音脈衝，偶爾露出不完整第二聲部；部分音符因轉檔而縮短。 |
| 04 | Chapter 3：購買舊裝置 | 單聲道、低取樣率、老手機喇叭音質；播放速度有非常輕微的硬體時鐘漂移。 |
| 05 | Chapter 4：解讀 SKG | 只留下塑膠感主音與遠處和弦，高頻被削掉，像從螢幕錄音或紙本資料中重新取回。 |
| 06 | Chapter 5：被機器覆蓋的公司 | 裝飾聲部消失，只剩原始旋律骨架；節拍被冷淡地重新量化，像舊檔案遭企業模板重新包裝。 |
| 07 | Chapter 6：Noah 的社群帳號 | 單一廉價 lead 演奏主旋律，音符之間出現小空白；不是悲傷，而是原作者版本只剩一條聲部。 |
| 08 | Chapter 7：最喜歡的數字 | 旋律切成短句，句間留有可讀取的空白；低音像簡單高度感應器脈衝，讓音樂開始像可被解析的資料。 |
| 09 | Chapter 8：母親的舊帳號內容 | 音量非常低，像舊裝置內建喇叭播放；旋律偶爾被壓縮雜訊遮住，但不加入煽情樂器。 |
| 10 | Chapter 9：Mara 與 Noah 的對話 | 第 1–8 小節逐漸清楚，仍保留單聲道與頻率缺失；尾端像存在資料卻無法解碼，不能提前播放最後四小節。 |
| 11 | Chapter 10：取得高度路線、突破 Gate 40、抵達 256 | 節拍恢復穩定，八個高度可以對應八個旋律節點。抵達真正終點時，第 1–8 小節不再被截斷，第一次自然進入第 9–12 小節。音質仍可以老舊，但旋律終於完整。 |

## 5. 母版生成提示詞

後續生成時不必貼上整段核心語言，但必須保留以下提示詞作為固定前綴；每個階段只在其後追加「階段變因」。

```text
An early mobile game background-music loop preserved inside a twelve-year-old game file. A single simple, memorable melody with a fixed tempo, key, harmony and twelve-bar structure. Naive square-wave lead, primitive drum machine, minimal bass and uncomplicated chords. The music is emotionally neutral and unaware of the story: restrained, ordinary, sincere, non-cinematic, not suspenseful, not frightening and not sentimental. It should feel like an actual small mobile-game BGM file rather than a soundtrack commenting on the player.

All versions must preserve exactly the same melody and rhythm. Only the condition of the file may change: missing instruments, aged timbre, mono playback, low sample rate, low bitrate, clipped high frequencies, clock drift, missing audio data, abrupt loop restart and occasional old-player distortion. Bars 9–12 are the missing final phrase and must remain unheard until the true ending.
```

## 6. 階段變因模板

每次生成只將下面這段接在母版提示詞後方，替換括號內容：

```text
Stage condition: [階段編號與名稱].
Keep: [本階段仍存在的聲部].
Remove or damage: [遺失的聲部／頻率／資料].
Playback medium: [現代壓縮檔／舊手機喇叭／單聲道轉檔／受損播放器].
Loop ending: restart immediately after bar 8; do not reveal bars 9–12.
```

最終階段才改成：

```text
Loop ending: for the first time, continue naturally from bar 8 into the original missing bars 9–12. Do not add a cinematic climax; completion comes only from hearing the melody finish.
```

## 7. 固定禁止項目

```text
No cinematic strings, emotional piano, horror drone, suspense riser, jump scare, trailer impact, braam, choir, heroic modulation, triumphant orchestral finale, dramatic breakdown, new countermelody, rewritten chord progression, new theme, or genre change.
```

## 8. 版本命名建議

```text
SKG_BGM_MASTER_MELODY_v01
SKG_BGM_S01_CH0_CHEAP_UPDATE
SKG_BGM_S02_CH1_ARC184
...
SKG_BGM_S11_CH10_COMPLETE_256
```

每個輸出旁應保存：生成工具、模型版本、seed、BPM、調性、參考音訊版本與實際修改項目。若工具沒有 seed，也要保存原始生成音訊，之後只以該音訊作為 reference，不再從文字重新抽取。
