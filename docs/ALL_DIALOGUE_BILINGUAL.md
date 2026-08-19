# SKG Scorekeeper 全部台詞／雙語對照

> 狀態：依目前 runtime 來源整理。英文是遊戲現行原文；繁體中文是對照翻譯，不會回寫遊戲程式。
>
> 範圍：主角內心獨白、角色／訊息對話、互動回應、章節結局台詞、Arcane 飛行反思、Noah 結局傳訊與結尾字幕。純按鈕、狀態欄、Debug 文字、商品文案與非敘事背景訊息不列入本表。
>
> 使用方式：每個 `English` 後面緊接 `繁中`；同一個事件可能依玩家操作、重複次數或分支顯示不同句子，因此保留所有目前程式中的變體。

## 目錄

- [Chapter 1 — 尋找第一名](#chapter-1--尋找第一名)
- [Chapter 2 — 找到舊版檔案](#chapter-2--找到舊版檔案)
- [Chapter 3 — 找到 Lumen Arc](#chapter-3--找到-lumen-arc)
- [Chapter 4 — 讀取交付包裹](#chapter-4--讀取交付包裹)
- [Chapter 5 — 找到 Noah Kade](#chapter-5--找到-noah-kade)
- [Chapter 6 — 找到父親的公開身分](#chapter-6--找到父親的公開身分)
- [Chapter 7 — 以母親的記憶組出密碼](#chapter-7--以母親的記憶組出密碼)
- [Chapter 8 — 修復 Noah 的對話](#chapter-8--修復-noah-的對話)
- [Chapter 9 — Make Room](#chapter-9--make-room)
- [Chapter 10 — 最後一趟飛行與結局](#chapter-10--最後一趟飛行與結局)
- [來源與整理界線](#來源與整理界線)

---

## Chapter 1 — 尋找第一名

來源：`src/lib/chapterOneDialogue.ts`。

### 主線

**entry**

- English: “That isn't a record.”  
  繁中：這不是紀錄。
- English: “That's cheating.”  
  繁中：這是在作弊。

**leaderboardRead**

- English: “Everyone else stops at forty. ARC_184 made it to 184.”  
  繁中：其他人都停在四十。ARC_184 卻到了 184。
- English: “He didn't just beat the wall. He knew how it worked.”  
  繁中：他不只是穿過那道牆。他知道那道牆是怎麼運作的。

**homeReturned**

- English: “People upload everything. Maybe he posted the run somewhere.”  
  繁中：人們什麼都會上傳。也許他把那趟紀錄放在某個地方。
- English: “If there's footage, it's probably on a video platform.”  
  繁中：如果有影片，應該會在影片平台上。

**viewTubeOpened**

- English: “ViewTube. Let’s see whether ARC_184 wanted an audience.”  
  繁中：ViewTube。看看 ARC_184 是不是想讓人看見。
- English: “Start with the only name I have: ARC_184.”  
  繁中：先從我唯一知道的名字開始：ARC_184。

**searchFocused**

- English: “ARC_184. No theories yet. Just evidence.”  
  繁中：ARC_184。先別急著下理論。只有證據。

**rumorSelected**

- English: “An erased record run. That sounds like my problem.”  
  繁中：一趟被抹掉的紀錄。聽起來就是我的問題。
- English: “The name at the top again: ARC_184.”  
  繁中：最上面的名字又出現了：ARC_184。

**arcSearchFound**

- English: “There you are.”  
  繁中：原來你在這裡。
- English: ““I BROKE THE UNBEATABLE FLAPPY GAME.” Subtle.”  
  繁中：「我打破了無法打敗的 Flappy 遊戲。」真是低調。

**videoReady**

- English: “184 points. If this is edited, I want to see where.”  
  繁中：184 分。如果這是剪出來的，我想知道剪接點在哪裡。

**videoStarted**

- English: “All right. Show me the trick.”  
  繁中：好。讓我看看這個把戲。
- English: “Wait. He goes low at Gate 40.”  
  繁中：等等。他在 Gate 40 降低高度。

**videoEvidence**

- English: “That should have killed him.”  
  繁中：那一下本來應該會讓他死掉。
- English: “No cut. No jump. So what changed?”  
  繁中：沒有剪接。沒有跳接。那到底改變了什麼？

**videoPaused**

- English: “I've seen enough. He's pulling some kind of cheating trick.”  
  繁中：我看夠了。他用了某種作弊把戲。
- English: “What I need is the exact moment forty becomes forty-one.”  
  繁中：我需要的是四十變成四十一的那個確切瞬間。

**legacyPassageLead**

- English: “So the update can imitate the old route. That does not prove the old build did it.”  
  繁中：所以新版可以模仿舊路線。但這不能證明舊版就是這樣做到的。
- English: “The upload is new. The record isn't. I need the 2014 build.”  
  繁中：上傳檔是新的。紀錄不是。我需要 2014 年的版本。

**ipaLead**

- English: “There. A filename, not a theory.”  
  繁中：就是這個。是一個檔名，不是一套理論。
- English: “Skyline256_LAOS_Final.ipa. That is something an archive can actually find.”  
  繁中：Skyline256_LAOS_Final.ipa。這是檔案庫真的找得到的東西。

**evidenceComplete**

- English: “Two pieces. The old route existed, and the build has a name.”  
  繁中：兩塊拼圖。舊路線確實存在，而且這個版本有名字。
- English: “Next stop: an archive.”  
  繁中：下一站：檔案庫。

**evidenceAlreadyCollected**

- English: “Already filed. I need the other piece.”  
  繁中：已經歸檔了。我需要另一塊拼圖。

### 陪伴、錯誤操作與搜尋回應

**推薦影片輪替**

- English: “I'm not interested in this video right now.”  
  繁中：我現在對這部影片沒興趣。
- English: “Tempting. Completely irrelevant.”  
  繁中：很誘人。完全不相關。
- English: “I can procrastinate after I explain the impossible score.”  
  繁中：等我解釋完這個不可能的分數，再來拖延也不遲。
- English: “No. I'm looking for one specific run.”  
  繁中：不。我在找一趟特定的紀錄。
- English: “The algorithm can wait.”  
  繁中：演算法可以等。
- English: “Cute bird. Wrong mystery.”  
  繁中：鳥很可愛。謎題找錯了。
- English: “I refuse to get distracted by another list video.”  
  繁中：我拒絕再被另一部排行榜影片分心。

**重複搜尋與首頁陪伴**

- English: “I have one useful name. I should probably use it.”  
  繁中：我有一個有用的名字。也許該拿來用。
- English: “We're investigating a score, not testing the search engine.”  
  繁中：我們在調查一個分數，不是在測試搜尋引擎。
- English: “Evidence first. Conspiracy board later.”  
  繁中：先找證據。陰謀論白板晚點再說。
- English: “I don't need the whole answer yet. Just the next piece.”  
  繁中：我還不需要完整答案。只要下一塊拼圖。
- English: “Still here.”  
  繁中：我還在這裡。
- English: “I'm thinking.”  
  繁中：我在想。
- English: “Let's follow what we actually know.”  
  繁中：跟著我們真正知道的東西走。
- English: “I'm curious too. That's becoming a problem.”  
  繁中：我也很好奇。這開始變成問題了。

**留言反應**

- English: “A 2026 update turned a 2014 record into algorithm bait.”  
  繁中：2026 年的更新，把 2014 年的紀錄變成了餵給演算法的誘餌。
- English: “The record is twelve years old. This upload is not. Important difference.”  
  繁中：紀錄有十二年歷史。這次上傳不是。差別很重要。
- English: “The uploader isn't the developer. Different mystery.”  
  繁中：上傳者不是開發者。這是另一個謎。
- English: “The compression is awful. Unfortunately, the score still changes.”  
  繁中：壓縮糟透了。可惜分數還是會變。
- English: “A route, maybe. But through which version?”  
  繁中：也許是一條路線。但是哪個版本的路線？
- English: “An actual ending. Not useful yet, but not nothing.”  
  繁中：一個真正的結局。現在還沒用，但也不是毫無意義。
- English: “At least somebody is enjoying this.”  
  繁中：至少有人享受其中。
- English: “That's exactly what I'm trying to determine.”  
  繁中：這正是我想確認的事。
- English: “A timestamp, an opinion, and no evidence.”  
  繁中：一個時間戳、一個意見，還有零證據。
- English: “The comment section remains undefeated at saying almost nothing.”  
  繁中：留言區在幾乎什麼都沒說這件事上，依然無人能敵。
- English: “Noted. Filed under ‘people also watched the video.’”  
  繁中：記下了。歸檔到「也看過這部影片的人」底下。
- English: “One hundred forty-two comments. Naturally, the useful part is buried.”  
  繁中：142 則留言。當然，有用的部分被埋在最下面。

**錯誤 App**

- English: “I can hit Gate 40 again, but that won't explain how he passed it.”  
  繁中：我可以再撞一次 Gate 40，但那不會解釋他是怎麼通過的。
- English: “I'm investigating cheating, not shopping.”  
  繁中：我在調查作弊，不是在購物。
- English: “An archive of what? I don't even know what I'm looking for yet.”  
  繁中：要查什麼的檔案庫？我甚至還不知道自己在找什麼。
- English: “I don't have a person to search for.”  
  繁中：我沒有要搜尋的人。
- English: “My messages aren't going to explain ARC_184's score.”  
  繁中：我的訊息不會解釋 ARC_184 的分數。
- English: “Nothing here yet. Just an impressively empty folder.”  
  繁中：這裡還沒有東西。只有一個空得很有氣勢的資料夾。
- English: “Interesting cause. Wrong tab.”  
  繁中：原因很有意思。分頁開錯了。

**搜尋輸入**

- English: “Searching for nothing. Bold strategy.”  
  繁中：搜尋空無一物。真是大膽的策略。
- English: “That is either a password or someone fell asleep on the keyboard.”  
  繁中：那不是密碼，就是有人趴在鍵盤上睡著了。
- English: “Let's pretend I didn't just receive information from the future.”  
  繁中：我們假裝我剛才沒有收到來自未來的資訊。
- English: “That name means nothing to me yet.”  
  繁中：那個名字目前對我毫無意義。
- English: “Suspiciously specific. Where did I supposedly learn it?”  
  繁中：具體得可疑。我到底是被說成在哪裡知道它的？
- English: “I don't know what that is yet.”  
  繁中：我還不知道那是什麼。
- English: “That sounds like an answer without a question.”  
  繁中：聽起來像一個沒有問題的答案。
- English: “I have three letters and no context.”  
  繁中：我只有三個字母，沒有脈絡。
- English: “I'm several conclusions ahead of the evidence.”  
  繁中：我已經比證據多推了好幾個結論。
- English: “I already know the wall exists.”  
  繁中：我已經知道那道牆存在。
- English: “I need to know how ARC_184 crossed it.”  
  繁中：我需要知道 ARC_184 是怎麼穿過它的。
- English: “Yes, that's me. Very informative.”  
  繁中：對，那就是我。資訊真豐富。
- English: “That won't explain how someone passed Gate 40.”  
  繁中：那不會解釋某人是怎麼通過 Gate 40 的。

---

## Chapter 2 — 找到舊版檔案

來源：`src/lib/chapterTwoDialogue.ts`。

### 主線

**entry**

- English: “Gate forty was not always the end. The Legacy build proves that much.”  
  繁中：Gate 40 並不總是終點。Legacy 版本至少證明了這件事。
- English: “The filename survived. Now I need to find out what kind of thing it is.”  
  繁中：檔名留了下來。現在我需要弄清楚它到底是什麼。

**homeReturned**

- English: “Old software leaves traces.”  
  繁中：舊軟體會留下痕跡。
- English: “Mirrors, backups, forgotten download pages.”  
  繁中：鏡像、備份、被遺忘的下載頁面。

**browserOpened**

- English: “Start broad. I am looking for an old game file, not the whole story.”  
  繁中：先從大方向開始。我在找一個舊遊戲檔，不是整個故事。

**searchFinderVisible**

- English: “The modern web, helpfully burying the past under shopping advice.”  
  繁中：現代網路很貼心地用購物建議把過去埋起來。

**archiveLeadSelected**

- English: “An actual file index. That's better than another article about nostalgia.”  
  繁中：真正的檔案索引。比另一篇懷舊文章好多了。
- English: “Most of these mirrors are dead. The filenames may still tell me what survived.”  
  繁中：這些鏡像大多已經死了。但檔名也許還能告訴我留下了什麼。

**archiveSearchFocused**

- English: “The comment gave me a filename.”  
  繁中：留言給了我一個檔名。
- English: “Now I need the package category that actually contains it.”  
  繁中：現在我需要找到真正包含它的套件分類。

**fileOpened**

- English: “Skyline 256.”  
  繁中：Skyline 256。
- English: “LAOS 4.1, indexed in 2014. This could be his build.”  
  繁中：LAOS 4.1，2014 年建立索引。這可能是他的版本。

**compatibilityBlocked**

- English: “The file survived. This device just cannot understand it.”  
  繁中：檔案活了下來。只是這台裝置無法理解它。
- English: “Lumen Arc. Of course.”  
  繁中：Lumen Arc。當然。

**maternalMemory**

- English: “Mom had one. I remember the silver edge beside the kitchen sink.”  
  繁中：媽媽以前有一台。我記得廚房水槽旁那道銀色邊緣。
- English: “I do not know where it went. I need another way to find one.”  
  繁中：我不知道它去了哪裡。我需要另一種方法找到一台。

### 檔案格式、錯誤 App 與瀏覽器噪音

**格式選擇**

- English: “Press kits, scans, mixed backups.”  
  繁中：新聞包、掃描檔、混合備份。
- English: “Useful evidence, maybe. Not a runnable build.”  
  繁中：也許是有用的證據。但不是可執行版本。
- English: “Android packages.”  
  繁中：Android 套件。
- English: “Reasonable guess. Wrong operating system.”  
  繁中：合理的猜測。錯誤的作業系統。
- English: “Old enough, but built for Java phones.”  
  繁中：夠老了，但它是給 Java 手機用的。
- English: “ARC_184 said LAOS.”  
  繁中：ARC_184 說的是 LAOS。
- English: “Another dead mobile platform.”  
  繁中：另一個已經死去的行動平台。
- English: “Not the one from the video.”  
  繁中：不是影片裡的那個。
- English: “Application packages.”  
  繁中：應用程式套件。
- English: “Let's read the records before deciding anything.”  
  繁中：先讀紀錄，再決定任何事。

**錯誤 App／陪伴**

- English: “The current version will keep killing me at forty. That is the problem.”  
  繁中：現在的版本還是會在四十讓我死掉。問題就在這裡。
- English: “I have squeezed everything useful out of that video for now.”  
  繁中：那部影片目前能榨出的有用資訊，我都拿到了。
- English: “Buying random dead hardware before I know the required build seems expensive.”  
  繁中：在知道需要哪個版本以前，亂買已經死掉的硬體，聽起來很貴。
- English: “I do not have a person to search for.”  
  繁中：我沒有要搜尋的人。
- English: “Nobody in my messages sent me a twelve-year-old game build.”  
  繁中：我的訊息裡沒有人寄給我一個十二年前的遊戲版本。
- English: “Still empty. Apparently the past did not organize itself for me.”  
  繁中：還是空的。看來過去沒有為我整理好自己。
- English: “Preservation is the point. This is not the evidence.”  
  繁中：保存才是重點。這不是證據。
- English: “The file existed once. That is enough to leave a trail.”  
  繁中：這個檔案曾經存在。這就足以留下線索。
- English: “I am not stuck. I am reading very slowly on purpose.”  
  繁中：我沒有卡住。我只是故意讀得很慢。
- English: “Old platform. Old build. One step at a time.”  
  繁中：舊平台。舊版本。一步一步來。
- English: “The answer should look like a file, not a prophecy.”  
  繁中：答案應該看起來像檔案，不是預言。

**入口網站分心**

- English: “The browser has plenty of ideas. None of them are mine.”  
  繁中：瀏覽器有很多想法。沒有一個是我的。
- English: “Interesting to somebody, probably. Not useful to me.”  
  繁中：對某些人來說也許很有趣。對我沒有用。
- English: “The headlines can wait. Dead software usually cannot.”  
  繁中：新聞可以等。死去的軟體通常不能。
- English: “Another article explaining the present. I need something the present forgot.”  
  繁中：又一篇解釋現在的文章。我需要的是現在忘記的東西。
- English: “Cold outside. Still not a filename.”  
  繁中：外面很冷。還是不是檔名。
- English: “The forecast is more certain than this archive trail.”  
  繁中：天氣預報都比這條檔案線索更確定。
- English: “Numbers moving for reasons nobody can explain. Familiar, but irrelevant.”  
  繁中：數字因為沒人能解釋的理由移動。很熟悉，但不相關。
- English: “The market is alive. The platform I need is not.”  
  繁中：市場還活著。我需要的平台沒有。
- English: “Everyone is posting. Nobody is preserving the useful part.”  
  繁中：每個人都在發文。沒有人保存有用的部分。
- English: “A lot of activity. Very little evidence.”  
  繁中：活動很多。證據很少。
- English: “A free trial is not a lead.”  
  繁中：免費試用不是線索。
- English: “The advertisement found me before the file did.”  
  繁中：廣告比檔案更早找到我。
- English: “Useful to someone cataloguing the catalog. Not to me.”  
  繁中：對整理目錄的人也許有用。對我沒有。
- English: “More preservation paperwork. I need the package itself.”  
  繁中：又是更多保存文書。我需要的是套件本身。

**搜尋回應**

- English: “Searching for nothing. Technically efficient.”  
  繁中：搜尋空無一物。技術上很有效率。
- English: “That is the filename from the comment.”  
  繁中：那就是留言裡的檔名。
- English: “I still need the archive category that contains it.”  
  繁中：我還是需要找到包含它的檔案庫分類。
- English: “I know the device name.”  
  繁中：我知道裝置名稱。
- English: “I still need to know what it was running.”  
  繁中：我還需要知道它執行的是什麼。
- English: “Three letters and no context.”  
  繁中：三個字母，沒有脈絡。
- English: “That is not a lead yet.”  
  繁中：那還不能算線索。
- English: “That name has not appeared anywhere.”  
  繁中：那個名字還沒有出現在任何地方。
- English: “I know where the trick happened.”  
  繁中：我知道把戲發生在哪裡。
- English: “Now I need the software that allowed it.”  
  繁中：現在我需要找到讓它成為可能的軟體。
- English: “Another game that almost disappeared.”  
  繁中：另一個差點消失的遊戲。

---

## Chapter 3 — 找到 Lumen Arc

來源：`src/lib/chapterThreeDialogue.ts`。

### 主線

**entry**

- English: “I do not know where Mom's Lumen Arc went.”  
  繁中：我不知道媽媽的 Lumen Arc 去了哪裡。
- English: “But recalls never collect everything.”  
  繁中：但回收事件從來不會把所有東西都收走。

**homeReturned**

- English: “Someone kept one.”  
  繁中：有人留了一台。
- English: “Collectors, resellers, people who ignore safety notices.”  
  繁中：收藏家、轉賣商、無視安全通知的人。

**amazeMartOpened**

- English: “AmazeMart. Where bad decisions arrive by tomorrow.”  
  繁中：AmazeMart。讓錯誤決定在明天送到你家的地方。
- English: “I only need one discontinued device.”  
  繁中：我只需要一台停產裝置。

**storefrontVisible**

- English: “Nine thousand products I do not need.”  
  繁中：九千件我不需要的商品。
- English: “One name should narrow this down.”  
  繁中：一個名字應該能縮小範圍。

**searchFocused**

- English: “Lumen Arc. Hardware, not accessories.”  
  繁中：Lumen Arc。我要的是硬體，不是配件。

**recalledSuggestion**

- English: “Apparently the algorithm remembers what people were told to throw away.”  
  繁中：看來演算法記得人們曾被要求丟掉什麼。

**correctSearch**

- English: “Zero certified matches.”  
  繁中：零筆認證結果。
- English: “The sponsored results seem less discouraged.”  
  繁中：贊助結果看起來沒那麼氣餒。

**decoyResults**

- English: “A projector. A smart mug. A pillow with firmware.”  
  繁中：投影機。智慧馬克杯。內建韌體的枕頭。
- English: “The search engine is negotiating with the word “relevant.””  
  繁中：搜尋引擎正在和「相關」這個詞協商。

**filteredRecords**

- English: “Three marketplace records are being hidden.”  
  繁中：三筆市場紀錄正被隱藏。
- English: “Trust and Safety may have accidentally found the useful part.”  
  繁中：Trust and Safety 可能意外找到了有用的部分。

**sellerRevealed**

- English: “There.”  
  繁中：就是這裡。
- English: “One listing the marketplace would rather pretend is not here.”  
  繁中：一筆市場寧願假裝不存在的商品。

**sellerExpanded**

- English: “A Lumen Arc recovery lot for $1.84.”  
  繁中：一批售價 1.84 美元的 Lumen Arc 回收品。
- English: “That price is trying very hard to mean something.”  
  繁中：這個價格非常努力地想代表某種意義。

**reviewsSeen**

- English: “Nobody agrees that it works.”  
  繁中：沒有人同意它能運作。
- English: “That is not the same as saying nothing survived.”  
  繁中：這不等於什麼都沒有留下。

**orderRequested**

- English: “This is a terrible purchase.”  
  繁中：這是一筆糟糕的購買。
- English: “It is also the only listing.”  
  繁中：但它也是唯一的商品。

**riskVisible**

- English: “Fraudulent, unsafe, imaginary.”  
  繁中：詐騙、不安全、虛構。
- English: “At least the warning is comprehensive.”  
  繁中：至少警告寫得很完整。

**riskCancelled**

- English: “Good instinct.”  
  繁中：直覺不錯。
- English: “Unfortunately, I still need another lead.”  
  繁中：可惜我還是需要另一條線索。

**riskAccepted**

- English: “I do not need the phone to work.”  
  繁中：我不需要這支手機能運作。
- English: “I need whatever survived with it.”  
  繁中：我需要的是和它一起留下來的任何東西。

**sellerNotification**

- English: “That was fast.”  
  繁中：真快。
- English: “Too fast.”  
  繁中：快過頭了。
- English: “The store sent the check somewhere else. Messages.”  
  繁中：商店把檢查結果送到別的地方了。Messages。

**sellerRelayOpened**

- English: “A buyer check. Not money—a score.”  
  繁中：買家驗證。不是錢，是分數。
- English: “They know why someone would want this device.”  
  繁中：他們知道為什麼有人會想要這台裝置。

**correctScore**

- English: “ARC_184.”  
  繁中：ARC_184。
- English: “The score was sitting in the name the whole time.”  
  繁中：那個分數一直都藏在名字裡。

**sellerMatched**

- English: “Match.”  
  繁中：吻合。
- English: “The delivery archive just updated.”  
  繁中：交付檔案剛剛更新了。

**approvedEndingA**

- English: “The seller sent something.”  
  繁中：賣家寄來了某個東西。
- English: “Whatever it is, it is waiting in Deliveries.”  
  繁中：不管那是什麼，它正在 Deliveries 裡等著。

### 商店分心、錯誤 App 與輸入回應

- English: “Useful object. Wrong obsolete object.”  
  繁中：有用的物品。錯的過時物品。
- English: “The discount is impressive. The relevance is not.”  
  繁中：折扣很驚人。相關性沒有。
- English: “I can ruin my finances after I find the device.”  
  繁中：找到裝置後，我再來搞垮自己的財務。
- English: “Tomorrow delivery. Twelve years late.”  
  繁中：明天送達。遲了十二年。
- English: “The marketplace has confused urgency with importance.”  
  繁中：這個市場把緊急和重要搞混了。
- English: “Organized nonsense is still nonsense.”  
  繁中：整理過的胡說八道，還是胡說八道。
- English: “A reasonable category. An unreasonable search.”  
  繁中：合理的分類。不合理的搜尋。
- English: “Cheaper. Better rated. Equally unrelated.”  
  繁中：更便宜。評價更好。同樣不相關。
- English: “Filtering the storefront will not create discontinued inventory.”  
  繁中：篩選商店不會憑空製造停產庫存。
- English: “Harborview delivery is not the difficult part.”  
  繁中：送到 Harborview 不是困難的部分。
- English: “Pay more to save on shipping. A flawless system.”  
  繁中：多付錢來節省運費。完美的系統。
- English: “The advertisement found me before the hardware did.”  
  繁中：廣告比硬體更早找到我。
- English: “I found the file. This browser cannot run it.”  
  繁中：我找到檔案了。這個瀏覽器不能執行它。
- English: “The recording gave me a device name and a score. I need the device now.”  
  繁中：錄影給了我裝置名稱和分數。現在我需要裝置本身。
- English: “The current build will still kill me at forty.”  
  繁中：現在的版本還是會在四十讓我死掉。
- English: “I am looking for hardware, not its former owner.”  
  繁中：我在找硬體，不是它以前的主人。
- English: “Nobody I know keeps recalled phones for emergencies.”  
  繁中：我認識的人沒有人會為了緊急狀況保存回收手機。
- English: “Nothing new yet.”  
  繁中：目前沒有新東西。
- English: “I have to receive something before I can inspect it.”  
  繁中：我得先收到東西，才能檢查它。
- English: “Yes, software disappears.”  
  繁中：是啊，軟體會消失。
- English: “I am trying to buy the evidence.”  
  繁中：我正在試著買下證據。
- English: “Someone kept one. People keep everything.”  
  繁中：有人留了一台。人們什麼都會留。
- English: “This is not shopping. It only has prices.”  
  繁中：這不是購物。它只是有價格而已。
- English: “A dead device can still carry live evidence.”  
  繁中：死掉的裝置仍然可以攜帶活著的證據。
- English: “One bad listing is more than zero certified matches.”  
  繁中：一筆糟糕的商品，還是比零筆認證結果多。
- English: “Searching for an empty shopping cart. Efficient.”  
  繁中：搜尋一個空購物車。有效率。
- English: “I already have the package name.”  
  繁中：我已經有套件名稱了。
- English: “I need the device that can understand it.”  
  繁中：我需要能理解它的裝置。
- English: “The operating system narrows the era, not the seller.”  
  繁中：作業系統縮小的是年代，不是賣家。
- English: “A few million bad batteries and no useful model name.”  
  繁中：幾百萬顆壞電池，卻沒有有用的型號名稱。
- English: “A score is not a product listing.”  
  繁中：分數不是商品清單。
- English: “That is not something I know yet.”  
  繁中：那不是我目前知道的東西。
- English: “Wrong object.”  
  繁中：物品錯了。
- English: “I need the hardware named in the archive record.”  
  繁中：我需要檔案紀錄裡提到的硬體。
- English: “Sending silence to a suspicious seller. Strong opening.”  
  繁中：把沉默寄給可疑賣家。開場很有力。
- English: “Forty is the wall.”  
  繁中：四十是那道牆。
- English: “The seller asked for the runner's score.”  
  繁中：賣家要的是玩家的分數。
- English: “That is where the recording stopped for me.”  
  繁中：對我來說，錄影是在那裡停下的。
- English: “It is not where ARC_184 stopped.”  
  繁中：但 ARC_184 不是在那裡停下的。
- English: “That is the price.”  
  繁中：那是價格。
- English: “They asked for a score.”  
  繁中：他們要的是分數。
- English: “That number belongs to the filename.”  
  繁中：那個數字屬於檔名。
- English: “Wrong piece of evidence.”  
  繁中：證據拼錯了。
- English: “That string has not appeared anywhere.”  
  繁中：那串字還沒有出現在任何地方。
- English: “A score, not a guess.”  
  繁中：要的是分數，不是猜測。

---

## Chapter 4 — 讀取交付包裹

來源：`src/lib/chapterFourDialogue.ts`。

### 主線

**entry**

- English: “A delivery archive. Tea, lightbulbs, a notebook.”  
  繁中：一個交付檔案庫。茶、燈泡、筆記本。
- English: “The device I paid for is filed somewhere in a stranger's shopping history.”  
  繁中：我付錢買的裝置，被歸檔在陌生人的購物紀錄某處。

**homeReturned**

- English: “The order is here somewhere.”  
  繁中：訂單就在這裡某處。
- English: “Apparently receiving it was the easy part.”  
  繁中：看來收到它才是簡單的部分。

**deliveriesOpened**

- English: “Seven signed deliveries.”  
  繁中：七筆已簽收的交付紀錄。
- English: “Only one of them cost exactly one dollar and eighty-four cents.”  
  繁中：只有一筆的價格剛好是一美元八十四美分。

**packageSelected**

- English: “Lumen Arc Recovery Lot.”  
  繁中：Lumen Arc 回收品批次。
- English: “All right. Show me what one dollar and eighty-four cents actually bought.”  
  繁中：好。讓我看看一美元八十四美分到底買到了什麼。

**packageOpened**

- English: “Wait. No—no, that's not a phone.”  
  繁中：等等。不——不，那不是手機。
- English: “Those are screenshots. He sent me screenshots.”  
  繁中：那是截圖。他寄給我的是截圖。

**packageDespair**

- English: “There's nothing underneath.”  
  繁中：下面什麼都沒有。
- English: “I paid for somebody else's leftovers.”  
  繁中：我花錢買了別人剩下的東西。

**packageResolve**

- English: “Fine. Fine.”  
  繁中：好。好。
- English: “If this is all we have, then this is what we use.”  
  繁中：如果我們只有這些，那就用這些。
- English: “Let's see what these screenshots still know.”  
  繁中：看看這些截圖還記得什麼。

**titleFound**

- English: “Skyline 256. So Flappy was never the real name.”  
  繁中：Skyline 256。所以 Flappy 從來不是真正的名字。

**paramsFound**

- English: “Arc. Gate. End. Three labels, in that order.”  
  繁中：Arc。Gate。End。三個標籤，就是這個順序。

**archiveFound**

- English: “SilverKite_Games. An old backup account, not a product label.”  
  繁中：SilverKite_Games。一個舊備份帳號，不是商品標籤。

**caseAssembled**

- English: “Different screenshots. Same structure.”  
  繁中：不同的截圖。同樣的結構。
- English: “This wasn't random.”  
  繁中：這不是隨機的。

**completed**

- English: “SKG: Skyline 256.”  
  繁中：SKG：Skyline 256。
- English: “Now I have something I can actually search.”  
  繁中：現在我終於有真正可以搜尋的東西了。

**packetReentered**

- English: “The packet is still here. So is the mess.”  
  繁中：這個包裹還在。混亂也還在。

**completedRevisit**

- English: “I've already taken what matters from this folder.”  
  繁中：這個資料夾裡重要的東西，我已經拿走了。

### 錯誤包裹、假線索與重複操作

- English: “Cedar mint tea. Not the delivery I ruined my week for.”  
  繁中：雪松薄荷茶。不是那個讓我浪費一週的交付品。
- English: “Lightbulbs. Someone's home still runs on normal purchases.”  
  繁中：燈泡。有人家裡還是靠正常購物在運轉。
- English: “A grid notebook. Useful somewhere else, probably.”  
  繁中：方格筆記本。大概在別的地方有用。
- English: “A charging cable for a device that actually arrived.”  
  繁中：一條給真正送達裝置用的充電線。
- English: “Coffee filters. The archive is more organized than the case.”  
  繁中：咖啡濾紙。檔案庫比案件更有條理。
- English: “Archival tape. Preservation supplies, without the thing being preserved.”  
  繁中：檔案膠帶。有保存用品，卻沒有被保存的東西。
- English: “Still ordinary. Still not mine.”  
  繁中：還是普通。還是不是我的。
- English: “Same parcel. Same lack of evidence.”  
  繁中：同一個包裹。同樣缺乏證據。
- English: “Battery health, eighty-four percent. Thrilling.”  
  繁中：電池健康度，84%。真令人激動。
- English: “Storage breakdown. Their photos, their games, none of it mine.”  
  繁中：儲存空間分析。他們的照片、他們的遊戲，沒有一樣是我的。
- English: “Just a photo of the box. Charger, frayed cable, no receipt.”  
  繁中：只是一張盒子的照片。充電器、磨損的線，沒有收據。
- English: “A home Wi-Fi called HOME-2F. Congratulations to them.”  
  繁中：一個叫 HOME-2F 的家用 Wi-Fi。恭喜他們。
- English: “A high score in a completely different game. Different obsession.”  
  繁中：另一款完全不同遊戲的高分。不同的執著。
- English: “A lock screen. The clock stopped mattering years ago.”  
  繁中：一個鎖定畫面。那個時鐘幾年前就不重要了。
- English: “Model, system, and a serial they blurred a moment too late.”  
  繁中：型號、系統，以及一組晚了一瞬才打碼的序號。
- English: “Nothing changed. Just another piece of someone else's day.”  
  繁中：什麼都沒變。只是別人一天的另一個片段。
- English: “I already read this surface. It is still residue.”  
  繁中：我已經讀過這個表面了。它仍然只是殘留物。
- English: “Already marked. Skyline 256.”  
  繁中：已經標記。Skyline 256。
- English: “Already marked. Arc, gate, end.”  
  繁中：已經標記。Arc、Gate、End。
- English: “Already marked. SilverKite_Games.”  
  繁中：已經標記。SilverKite_Games。
- English: “Most of this is residue. The details that repeat are the ones worth keeping.”  
  繁中：大部分都是殘留物。反覆出現的細節才值得留下。
- English: “The useful pieces do not look important. They only look familiar.”  
  繁中：有用的部分看起來並不重要。它們只是看起來很熟悉。
- English: “A search box is useless until I know the word to type.”  
  繁中：在我知道該輸入什麼字以前，搜尋框沒有用。
- English: “The recording finished talking. The delivery has not.”  
  繁中：錄影已經說完了。交付品還沒有。
- English: “The purchase already happened. I need to inspect what arrived.”  
  繁中：購買已經完成。我需要檢查送來的東西。
- English: “It still dies at forty. That's why I am reading these deliveries.”  
  繁中：它還是在四十死掉。這就是我在讀這些交付紀錄的原因。
- English: “No name to look up yet. Just an order with the wrong kind of contents.”  
  繁中：還沒有要查的名字。只有一筆內容物錯誤的訂單。
- English: “The seller sent a delivery, not an explanation.”  
  繁中：賣家送來的是交付品，不是解釋。
- English: “I am holding the evidence, not the preservation notice.”  
  繁中：我手上拿的是證據，不是保存公告。
- English: “Seven deliveries. One bad purchase. Start there.”  
  繁中：七筆交付。一筆糟糕的購買。從那裡開始。
- English: “A stranger kept the surface of a device they did not keep.”  
  繁中：一個陌生人留下了沒有留下的裝置表面。
- English: “The useful detail will look ordinary until it repeats.”  
  繁中：有用的細節在重複之前，看起來都會很普通。

---

## Chapter 5 — 找到 Noah Kade

來源：`src/lib/chapterFiveDialogue.ts`。

### 主線

- English: “SKG is a name now, not just three letters.”  
  繁中：SKG 現在是一個名字，不只是三個字母。
- English: “Time to find out what it turned into.”  
  繁中：該查查它後來變成了什麼。
- English: “I have a name. Now I need its history.”  
  繁中：我有名字了。現在我需要它的歷史。
- English: “A searchable name deserves a search engine.”  
  繁中：一個可以搜尋的名字，值得用搜尋引擎查。
- English: “SearchFinder. The web, arranged by whoever paid the most for it.”  
  繁中：SearchFinder。由付最多錢的人排列好的網路。
- English: “One word: SKG. Let us see how far the ads let me get.”  
  繁中：一個詞：SKG。看看廣告會讓我走多遠。
- English: “Eight results, and the engine is trying very hard to make those letters mean anything else.”  
  繁中：八筆結果，而搜尋引擎非常努力地想讓那些字母代表別的東西。
- English: “Formerly a games studio. Two thousand nine to two thousand fourteen.”  
  繁中：曾經是一間遊戲工作室。2009 年到 2014 年。
- English: “Something happened to it the year it stopped.”  
  繁中：它停止的那一年，一定發生了什麼。
- English: “A whole company, and not one human name anywhere on it.”  
  繁中：一整間公司，卻找不到任何一個人的名字。
- English: “They kept the assets. The people are harder to find.”  
  繁中：他們留下了資產。人比較難找。
- English: “No staff, but the support bot is immortal. Of course it is.”  
  繁中：沒有員工，但客服機器人是不朽的。當然是這樣。
- English: “This page is all present tense. The studio lived in an earlier one.”  
  繁中：這個頁面全都在用現在式。那間工作室活在更早的時態裡。
- English: “The reel goes back further than 2026.”  
  繁中：影片回溯得比 2026 年更早。
- English: “There. Before the automation buried it.”  
  繁中：就是這裡。在自動化把它埋掉以前。
- English: “Silver Kite Games. A person actually made this.”  
  繁中：Silver Kite Games。這真的曾經是人做出來的。
- English: “Noah Kade. Studio design and code.”  
  繁中：Noah Kade。工作室設計與程式。
- English: “One name, finally.”  
  繁中：終於有一個名字了。
- English: “Noah Kade again. He maintained the completion build.”  
  繁中：又是 Noah Kade。他維護了完成版本。
- English: “Two references. Not a stray byline.”  
  繁中：兩處引用。不是偶然出現的署名。
- English: “Co-founder and lead designer. Noah Kade.”  
  繁中：共同創辦人兼首席設計師。Noah Kade。
- English: “Co-founder and lead designer. Every surviving credit points to Noah Kade.”  
  繁中：共同創辦人兼首席設計師。每一筆留下的署名都指向 Noah Kade。
- English: “Noah Kade. That is where I go next.”  
  繁中：Noah Kade。下一步就是找他。
- English: “I already have the name that survived this page.”  
  繁中：這個頁面留下的名字，我已經有了。

### 假搜尋結果、公司頁面與檔案庫

- English: “A fridge with a subscription plan. Not the SKG I am looking for, thankfully.”  
  繁中：一台附訂閱方案的冰箱。謝天謝地，不是我要找的 SKG。
- English: “Enterprise auth middleware. Three letters, zero relevance, last updated never.”  
  繁中：企業驗證中介軟體。三個字母，零相關性，最後更新時間是永遠不曾更新。
- English: “It has the word Skyline in it and still manages to mean absolutely nothing.”  
  繁中：它裡面有 Skyline 這個詞，卻還是成功地完全沒有意義。
- English: “Carbon-neutral since last Tuesday. I believe every word of that.”  
  繁中：從上週二開始碳中和。我完全相信每一個字。
- English: “Four definitions and three are typos. The fourth is not helping.”  
  繁中：四個定義，其中三個是打字錯誤。第四個也沒幫上忙。
- English: “Two gates and one delay. Wrong kind of flight.”  
  繁中：兩個閘門，一次延誤。錯誤種類的飛行。
- English: “One file, permission denied. At least this dead end is honest.”  
  繁中：一個檔案，權限被拒絕。至少這條死路很誠實。
- English: “Plenty of results. None of them are the name I brought here.”  
  繁中：結果很多。沒有一個是我帶來這裡的名字。
- English: “The search engine is working. My search is not.”  
  繁中：搜尋引擎有在工作。我的搜尋沒有。
- English: “I can wander later. SKG first.”  
  繁中：我晚點再亂逛。先找 SKG。
- English: “That is an advertisement wearing a doorway costume.”  
  繁中：那是一則穿著門口服裝的廣告。
- English: “Another route to nowhere, sponsored this time.”  
  繁中：另一條通往虛無的路，這次是贊助的。
- English: “The useful result is still in the middle of all this noise.”  
  繁中：有用的結果還是在這些噪音中間。
- English: “Newer snapshots. Same automated nothing, just fresher.”  
  繁中：更新的快照。同樣的自動化空洞，只是更新鮮。
- English: “Still the company shell. I need the part before it.”  
  繁中：還是公司的外殼。我需要的是它以前的部分。
- English: “Nothing saved here. The studio left no page in this year.”  
  繁中：這裡沒有保存任何東西。工作室在這一年沒有留下頁面。
- English: “An empty year. Keep looking for the one somebody preserved.”  
  繁中：空白的一年。繼續找有人保存下來的那一年。
- English: “The reel bottoms out on an empty year. Too early to have left a trace.”  
  繁中：影片在空白的一年跌到底。太早了，還沒留下痕跡。
- English: “Ownership is a legacy concept, says the company that owns fourteen thousand things it did not make.”  
  繁中：擁有權是過時的概念——一間擁有一萬四千件自己沒做過的東西的公司這麼說。
- English: “No creator on record. They kept the game and misplaced the person.”  
  繁中：紀錄上沒有創作者。他們留下了遊戲，弄丟了那個人。
- English: “Upgrade your expectations. I will treasure that one.”  
  繁中：升級你的期待。我會好好珍藏這句。
- English: “Escalated to a human specialist who is never scheduled. Naturally.”  
  繁中：已升級給一位從未排班的人類專員。當然。
- English: “One point two million apps. Zero people required to remember who made them.”  
  繁中：一百二十萬個 App。不需要任何人記得它們是誰做的。
- English: “Generated portraits and no personnel records. A company-shaped absence.”  
  繁中：生成的人像，沒有員工紀錄。一個公司形狀的空缺。
- English: “Reinvented. That is a generous word for whatever this replaced.”  
  繁中：重新發明。對它取代的東西而言，這個詞太慷慨了。
- English: “The same handheld Mom kept. This studio put the game on it.”  
  繁中：就是媽媽留下的那台掌機。這間工作室把遊戲放了上去。
- English: “Two hundred fifty-six gates, then you are done. He built the ending on purpose.”  
  繁中：256 道閘門，然後就結束。他是故意做出這個結局的。
- English: “He left something in the final build. He will not say what. Not yet.”  
  繁中：他在最終版本裡留下了某個東西。他不會說是什麼。現在還不會。
- English: “A recall killed the hardware. A partner turned what remained into a catalog.”  
  繁中：回收事件殺死了硬體。一個夥伴把留下的東西變成目錄。
- English: “One entry survived as a warning: do not submit it. Submit what?”  
  繁中：有一筆內容以警告形式留下：不要提交它。提交什麼？
- English: “The archive kept the sentence and lost the thing it pointed to.”  
  繁中：檔案庫留下了句子，卻弄丟了它所指向的東西。
- English: “Another missing image. Preservation has holes in it.”  
  繁中：又一張遺失的圖片。保存本身也有漏洞。
- English: “The link is dead. The trace around it is not.”  
  繁中：連結死了。它周圍的痕跡還沒死。
- English: “Already marked. Studio design and code.”  
  繁中：已經標記。工作室設計與程式。
- English: “Already marked. Completion build maintainer.”  
  繁中：已經標記。完成版本維護者。
- English: “Already marked. Co-founder and lead designer.”  
  繁中：已經標記。共同創辦人兼首席設計師。
- English: “The score is evidence. The name behind it is in the Browser.”  
  繁中：分數是證據。分數背後的名字在 Browser 裡。
- English: “The recording gave me SKG. It cannot tell me what SKG became.”  
  繁中：錄影給了我 SKG。它不能告訴我 SKG 後來變成了什麼。
- English: “The purchase is finished. I am tracing the company now.”  
  繁中：購買已經完成。現在我要追查這間公司。
- English: “No person to look up yet. First I need the company history.”  
  繁中：還沒有要查的人。首先我需要公司的歷史。
- English: “The seller answered the last question. This one belongs to the web.”  
  繁中：賣家回答了上一個問題。這個問題屬於網路。
- English: “The screenshots gave me the name. Now I have to follow it.”  
  繁中：截圖給了我名字。現在我得順著它追下去。
- English: “The device can identify itself. The company will take more work.”  
  繁中：裝置可以辨認自己。公司需要更多工夫。
- English: “Search SKG, then separate the company from the noise around it.”  
  繁中：搜尋 SKG，再把公司和周圍的噪音分開。
- English: “The current company page is too clean. Old pages usually are not.”  
  繁中：現在的公司頁面太乾淨了。舊頁面通常不是這樣。
- English: “A preserved page can keep a person after a company forgets them.”  
  繁中：公司忘記一個人之後，一個保存下來的頁面仍能留下那個人。

---

## Chapter 6 — 找到父親的公開身分

來源：`src/lib/chapterSixDialogue.ts`。

### 主線

- English: “I have a name now. Noah Kade.”  
  繁中：我現在有一個名字了。Noah Kade。
- English: “Even the erased get a profile somewhere. Let us see who he was in public.”  
  繁中：就算被抹掉的人，也會在某處留下個人頁。看看他公開呈現的是誰。
- English: “One person survived the company page. FaceSpace may have kept the rest of him.”  
  繁中：公司頁面留下了一個人。FaceSpace 也許保存了他的其他部分。
- English: “FaceSpace. Everyone performing a life at me at once.”  
  繁中：FaceSpace。每個人同時對著我表演人生。
- English: “One specific person is buried in all this noise.”  
  繁中：某個特定的人被埋在這些噪音裡。
- English: “One name. Noah Kade. Let us find out if the platform kept him.”  
  繁中：一個名字。Noah Kade。看看這個平台有沒有留下他。
- English: “Founder and game designer. Silver Kite Games.”  
  繁中：創辦人與遊戲設計師。Silver Kite Games。
- English: “The corporate site scrubbed his name. This page still has his face.”  
  繁中：企業網站擦掉了他的名字。這個頁面還留著他的臉。
- English: “His own page, and the top of it is ads for the thing that ate his company.”  
  繁中：他的頁面，最上面卻是吞掉他公司的東西的廣告。
- English: “A founder voice, generated from whatever fragments remain. They are puppeting a man nobody can account for.”  
  繁中：一個用殘留下來的碎片生成的創辦人聲音。他們正在操縱一個沒有人能交代下落的人。
- English: “The sponsored garbage can wait. This is where he started.”  
  繁中：贊助垃圾可以等。這裡才是他開始的地方。
- English: “And the machine puts itself back on top. Predictable.”  
  繁中：機器又把自己放回最上面。真好預測。
- English: “Two desks and a borrowed build machine.”  
  繁中：兩張桌子和一台借來的建置機器。
- English: “He spent four years saying the same thing: a journey should know when it has arrived.”  
  繁中：他花了四年說同一件事：旅程應該知道自己何時抵達。
- English: “Finishing one last update so the complete route survives.”  
  繁中：完成最後一次更新，讓完整路線活下來。
- English: “He knew it was ending, and spent the time making sure something stayed.”  
  繁中：他知道那快結束了，於是把時間花在確保有些東西能留下。
- English: “Mara Kade.”  
  繁中：Mara Kade。
- English: “That is my mother's name. In a stranger's comment thread.”  
  繁中：那是我母親的名字。出現在陌生人的留言串裡。
- English: “I saved one fully loaded device for our child. He will find it when he is older.”  
  繁中：我替我們的孩子保存了一台完整裝載的裝置。等他長大後，他會找到它。
- English: “That sounds like the device on my desk. I need to know who that child was.”  
  繁中：聽起來就是我桌上的那台裝置。我需要知道那個孩子是誰。
- English: “This phone still has another page tied to the family backup. I should check whose account it calls mine.”  
  繁中：這支手機還有另一個和家庭備份相連的頁面。我應該看看它把哪個帳號叫作我的。
- English: “Arcane Kade. My name, pulled from the same 2014 migration.”  
  繁中：Arcane Kade。我的名字，同樣從 2014 年的遷移資料裡被拉了出來。
- English: “The family records are under the linked accounts.”  
  繁中：家庭紀錄在連結帳號底下。
- English: “I saved one fully loaded device for our child.”  
  繁中：我替我們的孩子保存了一台完整裝載的裝置。
- English: “That device is on my desk. I am the child.”  
  繁中：那台裝置就在我的桌上。我就是那個孩子。
- English: “I remember Dad. I never knew Noah was the name he used here.”  
  繁中：我記得爸爸。我從不知道 Noah 是他在這裡使用的名字。
- English: “I know whose device this was, and who it was waiting for.”  
  繁中：我知道這台裝置原本屬於誰，也知道它在等誰。

### 社群噪音、廣告、貼文與搜尋

- English: “A bird promoted to Regional Operations Manager. Focus.”  
  繁中：一隻鳥被升任區域營運經理。專心。
- English: “The whole feed is performing a life. I need the one page that stopped.”  
  繁中：整個動態牆都在表演人生。我需要的是那個停止更新的頁面。
- English: “Someone remembers when mobile games were allowed to end. Noah built one that did.”  
  繁中：有人記得手機遊戲曾經被允許結束。Noah 做過一款真的會結束的遊戲。
- English: “People I may know. I am looking for someone nobody was supposed to remember.”  
  繁中：可能認識的人。我在找一個本來不該有人記得的人。
- English: “Notifications, memories, groups. Plenty of motion. No direction.”  
  繁中：通知、回憶、群組。動靜很多。方向沒有。
- English: “Trending topics: the daily ceremony of mistaking volume for memory.”  
  繁中：熱門話題：每天把聲量誤認成記憶的儀式。
- English: “Another living feed. I need the page that stopped updating.”  
  繁中：另一個活著的動態牆。我需要那個停止更新的頁面。
- English: “AutoFriend Pro. Never remember a birthday either. Bleak, and not my problem right now.”  
  繁中：AutoFriend Pro。也永遠不要記得生日。很慘，但現在不是我的問題。
- English: “Turn one memory into four hundred daily posts. On the page of a man who chose an ending.”  
  繁中：把一段記憶變成四百則每日貼文。在一個選擇結束的男人頁面上。
- English: “Creators are optional. Content is forever. That is the whole crime in one slogan.”  
  繁中：創作者可有可無。內容永遠存在。一句口號就說完了整樁罪行。
- English: “Acquire the brand, replace the audience, call the noise a future. Efficient.”  
  繁中：收購品牌、替換觀眾，再把噪音叫作未來。有效率。
- English: “Never let an archive go quiet. The archive is quiet because he is gone.”  
  繁中：永遠不要讓檔案庫安靜。檔案庫安靜，是因為他不在了。
- English: “Monetize dormant communities. Even abandonment needs quarterly growth.”  
  繁中：把沉睡的社群變現。連被遺棄都需要季度成長。
- English: “SKG AutoPersona. They kept his voice and deleted him.”  
  繁中：SKG AutoPersona。他們留下他的聲音，刪掉了他。
- English: “Old teammates, cheering him on. Warm. Not what I am here for.”  
  繁中：老隊友們替他加油。很溫暖。但不是我來這裡找的。
- English: “Elias Vale, agreeing with every post. The same Elias who later automated all of it.”  
  繁中：Elias Vale，每篇貼文都表示同意。就是那個後來把一切自動化的 Elias。
- English: “A dozen comments about wind physics. None of them is the one.”  
  繁中：十幾則關於風力物理的留言。沒有一則是我要找的。
- English: “Colleagues, playtesters, a Lumen representative. Everyone except the person I need.”  
  繁中：同事、測試玩家、Lumen 的代表。除了我需要的那個人，大家都在。
- English: “A score can keep counting, but a journey should still know when it has arrived. He meant that.”  
  繁中：分數可以持續計數，但旅程仍然應該知道何時抵達。他是認真的。
- English: “Lumen Arc sensor support. The device and his game were built around each other.”  
  繁中：Lumen Arc 感測器支援。裝置和他的遊戲是彼此圍繞著打造的。
- English: “A title screen, a final gate, and credits. A whole game, not an endless meter.”  
  繁中：標題畫面、最後一道閘門和製作人員名單。一個完整的遊戲，不是一個無止盡的計量器。
- English: “Someone reached the credits without help. That was the part he cared about.”  
  繁中：有人不靠幫助抵達了製作人員名單。那才是他在乎的部分。
- English: “He would not call generated inventory preservation. Neither will I.”  
  繁中：他不會把生成的庫存叫作保存。我也不會。
- English: “Final build uploaded. It still ends. He kept that promise.”  
  繁中：最終版本已上傳。它仍然會結束。他遵守了那個承諾。
- English: “The box wants a person. I only have one worth typing.”  
  繁中：盒子要的是一個人。我只有一個值得輸入的名字。
- English: “She is in my messages, not a search bar. Noah first.”  
  繁中：她在我的訊息裡，不在搜尋框裡。先找 Noah。
- English: “Elias Vale. The partner. No reason to look him up yet.”  
  繁中：Elias Vale。那位夥伴。現在還沒有理由查他。
- English: “The studio is a ghost. I need the person who ran it.”  
  繁中：工作室是個幽靈。我需要的是經營它的人。
- English: “Wrong person. There is only one profile I came here for.”  
  繁中：找錯人了。我來這裡只為了一個個人頁。
- English: “His page is buried under ads for his own erasure. The dates still know what came first.”  
  繁中：他的頁面被抹除他自己的廣告埋住了。但日期仍知道什麼先發生。
- English: “The answer may be in who answered him, not only in what he posted.”  
  繁中：答案也許在回覆他的人身上，不只在他發布的內容裡。
- English: “Everyone in the comments knew him. One of them may have known him at home.”  
  繁中：留言裡的每個人都認識他。其中一個也許在家裡認識他。

---

## Chapter 7 — 以母親的記憶組出密碼

來源：`src/lib/chapterSevenDialogue.ts`。

### 主線

- English: “This phone still carries an old Lumen Arc family backup.”  
  繁中：這支手機還保存著一份舊的 Lumen Arc 家庭備份。
- English: “One part of it is still sealed.”  
  繁中：其中一個部分仍然被封住。
- English: “Three numbers I know by heart, and no idea which memory belongs to which label.”  
  繁中：三個我熟記於心的數字，卻不知道哪段記憶屬於哪個標籤。
- English: “Three numbers I know by heart, and three places I never knew.”  
  繁中：三個我熟記於心的數字，還有三個我從未知道的地方。
- English: “Her profile, not his. The key is in what she loved.”  
  繁中：是她的個人頁，不是他的。關鍵在她所愛的事物裡。
- English: “Mom called them little places. I should hear what she meant before I treat them like a code.”  
  繁中：媽媽稱它們為小地方。在把它們當成密碼以前，我應該先聽懂她的意思。
- English: ““Places,” she calls them. Not passwords.”  
  繁中：她稱它們為「地方」。不是密碼。
- English: “She used them so she would never forget the numbers.”  
  繁中：她用它們來確保自己永遠不會忘記那些數字。
- English: “Arc, gate, end. Her three places, in their order.”  
  繁中：Arc、Gate、End。她的三個地方，按照它們的順序。
- English: “The old Silver Kite account is still waiting in the corner.”  
  繁中：舊的 Silver Kite 帳號還在角落等著。
- English: “Her profile is still up. Twelve years of an ordinary life, left running.”  
  繁中：她的個人頁還在。十二年的普通人生，仍被留在運轉中。
- English: “MARA_KADE. A preserved node is a strange place to knock.”  
  繁中：MARA_KADE。一個保存下來的節點，是個奇怪的敲門處。
- English: “Those are the right memories under the wrong labels.”  
  繁中：記憶是對的，標籤卻錯了。
- English: “The archive wants meaning, not just three familiar numbers.”  
  繁中：檔案庫要的是意義，不只是三個熟悉的數字。
- English: “A view, a gate, an ending. Now the memories have an order.”  
  繁中：一個景色、一道閘門、一個結局。現在這些記憶有順序了。
- English: “It still wants the key typed by hand.”  
  繁中：它還是要求手動輸入密碼。
- English: “Her lookout, their gate, her ending.”  
  繁中：她的瞭望台、他們的閘門、她的結局。
- English: “No obituary. No goodbye. His record simply stops.”  
  繁中：沒有訃告。沒有道別。他的紀錄就這樣停止了。
- English: “Twelve years, and the door still knows them.”  
  繁中：十二年過去，那扇門仍然認得他們。
- English: “The old node already knows the path.”  
  繁中：舊節點已經知道這條路了。

### Mara 的三個地點、日常貼文與社群噪音

- English: “The harbor lookout. ARC 184, in Dad's old notebook.”  
  繁中：港口瞭望台。爸爸的舊筆記本上寫著 ARC 184。
- English: “The score I kept chasing was already written beside her favorite view.”  
  繁中：我一直追逐的分數，早已寫在她最喜歡的景色旁邊。
- English: “Gate 40. Their anniversary spot, in a station the trains gave up on.”  
  繁中：Gate 40。他們的紀念地，在一座火車早已放棄的車站裡。
- English: “The wall in the game is where my parents kept meeting.”  
  繁中：遊戲裡的那道牆，就是我父母一次又一次見面的地方。
- English: “Page 256. “Everyone finally chooses to go home.””  
  繁中：第 256 頁。「大家最後都選擇回家。」
- English: “That is the ending he built. She had already named it.”  
  繁中：那就是他打造的結局。她早已替它命名。
- English: “A blue scarf, found exactly where she had already looked. Her memory was slipping even then.”  
  繁中：一條藍色圍巾，就在她已經找過的地方被找到。那時她的記憶就已經開始滑落。
- English: “She wrote the missing thing down after finding it. A small insurance policy against tomorrow.”  
  繁中：她找到遺失的東西後，把它寫了下來。是對抗明天的一張小小保單。
- English: ““Tea cannot count as dinner.” She is arguing with my father, in 2014.”  
  繁中：「茶不能算晚餐。」她正在 2014 年和我父親爭論。
- English: “One domestic disagreement, preserved more faithfully than the company that hosted it.”  
  繁中：一場家庭爭論，比承載它的公司保存得更忠實。
- English: “Hundreds of paper kites for a school fair. Silver Kite, even at the kitchen table.”  
  繁中：為學校園遊會做的幾百隻紙風箏。就連在餐桌旁，也還是 Silver Kite。
- English: “Her fingers resigned. The kites apparently rejected the resignation.”  
  繁中：她的手指辭職了。看來風箏拒絕接受辭呈。
- English: “She was proud of the last build before I knew it was ours.”  
  繁中：在我知道那是我們的遊戲以前，她就已經以最終版本為傲。
- English: “A game should be allowed to finish. She understood his argument before I did.”  
  繁中：遊戲應該被允許結束。在我理解以前，她就懂他的論點了。
- English: “A repaired radio and no reason to check work mail. That counted as a good day.”  
  繁中：修好的收音機，不需要查看工作信件。那就算是美好的一天。
- English: “Quiet morning. Working radio. No company emergency. Practically a holiday.”  
  繁中：安靜的早晨。能工作的收音機。沒有公司緊急事故。幾乎像假日。
- English: “He remembered the flowers, she remembered the charger. One competent adult between them.”  
  繁中：他記得花，她記得充電器。他們之間至少有一個能幹的大人。
- English: “Romance, according to my parents: flowers, spare power, and shared quality control.”  
  繁中：依我父母的說法，浪漫就是：花、備用電力，以及共同品管。
- English: “Rain, cold tea, and a working radio. An ordinary day survived the archive.”  
  繁中：雨、冷茶，還有一台能工作的收音機。一個普通的日子在檔案庫裡活了下來。
- English: “Nothing to solve here. Just one more day they were both home.”  
  繁中：這裡沒有要解的謎。只是他們都在家裡的又一天。
- English: “Everyone else is still posting. I am trying to read the life that stopped.”  
  繁中：其他人還在持續發文。我正在試著讀懂那個停止的生活。
- English: “A loud feed around nine quiet posts.”  
  繁中：九則安靜貼文周圍，一面喧鬧的動態牆。
- English: “Notifications, groups, people I may know. None of them knew her like these posts did.”  
  繁中：通知、群組、可能認識的人。沒有一個像這些貼文一樣認識她。
- English: “The platform has many ideas about where I should look. It has not earned that confidence.”  
  繁中：平台對我該去哪裡有很多想法。但它還沒取得這種自信的資格。
- English: “Recently viewed: her, him, and a retro-tech page. The algorithm kept better track than I did.”  
  繁中：最近瀏覽：她、他，還有一個復古科技頁面。演算法比我更會記錄。
- English: “Trending nonsense. My mother's twelve years are quieter than any of it.”  
  繁中：熱門胡鬧。我母親的十二年比這些都安靜。
- English: ““Never remember a birthday either.” She would have hated this ad.”  
  繁中：「也永遠不要記得生日。」她一定會討厭這則廣告。
- English: “Automated affection. Convenient, hollow, and blocking the useful column.”  
  繁中：自動化的情感。方便、空洞，還擋住了有用的欄位。
- English: “His page is public and empty of this. The numbers are on hers.”  
  繁中：他的頁面是公開的，卻沒有這些。數字在她的頁面上。
- English: “I know what he built. I am here to learn what she remembered.”  
  繁中：我知道他打造了什麼。我來這裡是要知道她記得什麼。
- English: “A search box cannot tell me which ordinary day mattered to her.”  
  繁中：搜尋框不能告訴我哪個普通日子對她很重要。
- English: “Wrong trail. Her profile is already in the recently viewed list.”  
  繁中：走錯線索了。她的個人頁已經在最近瀏覽清單裡。

### 登入回應與錯誤 App

- English: “Sending an empty key to a twelve-year-old lock. Optimistic.”  
  繁中：把空密碼送給一把十二年的鎖。真樂觀。
- English: “I know the numbers. I do not know which is which yet.”  
  繁中：我知道那些數字。我還不知道它們各自代表什麼。
- English: “Her places first. Then the door.”  
  繁中：先找她的地方。再開那扇門。
- English: “I found the places. I should ask Mom how the old login named them.”  
  繁中：我找到那些地方了。我應該問媽媽，舊登入是怎麼命名它們的。
- English: “Right memories, wrong arrangement. Arc, gate, end—her order, not mine.”  
  繁中：記憶正確，排列錯誤。Arc、Gate、End——是她的順序，不是我的。
- English: “That is not one of her places. Guessing makes the archive less personal, not more open.”  
  繁中：那不是她的地方。猜測只會讓檔案庫更不私人，而不是更開放。
- English: “He left this for someone who walked it, not someone who guessed.”  
  繁中：他把這留給真正走過這條路的人，不是留給猜中的人。
- English: “The web gave me the studio. This key is more personal than a search.”  
  繁中：網路給了我工作室。這把鑰匙比搜尋更私人。
- English: “The recording started this. It does not know where my mother liked to stand.”  
  繁中：錄影開啟了一切。它不知道我母親喜歡站在哪裡。
- English: “The device is here. What I need now is what my parents put inside it.”  
  繁中：裝置在這裡。現在我需要的是我父母放進去的東西。
- English: “The screenshots named him. Her profile is where the numbers actually live.”  
  繁中：截圖說出了他的名字。那些數字真正存在於她的個人頁。
- English: “184, 40, 256. I have been flying through my parents' life this whole time.”  
  繁中：184、40、256。我一直都在飛過我父母的人生。
- English: “Preservation, again. Her profile is the only thing that kept these places safe.”  
  繁中：又是保存。她的個人頁是唯一保護這些地方的東西。
- English: “Her profile, not his. The key is in what she loved.”  
  繁中：是她的個人頁，不是他的。關鍵在她所愛的事物裡。
- English: “Three places. Label each one only after I know what it meant to her.”  
  繁中：三個地方。等我知道它們對她的意義，再替每個貼上標籤。
- English: “A view, a gate, an ending. Ordinary enough to survive as memories.”  
  繁中：一個景色、一道閘門、一個結局。普通到足以作為記憶活下來。

---

## Chapter 8 — 修復 Noah 的對話

來源：`src/lib/chapterEightDialogue.ts`。

### 進入、檔案庫與完成

- English: “MARA_KADE. Not a profile this time. Her actual account.”  
  繁中：MARA_KADE。這次不是個人頁。是她真正的帳號。
- English: “Noah is at the bottom, under everything she kept living after him.”  
  繁中：Noah 在最底下，藏在她在他之後繼續活過的一切之下。
- English: “Years of appointments, neighbors, ordinary arguments, and things she refused to throw away.”  
  繁中：多年的預約、鄰居、普通爭吵，以及她拒絕丟掉的東西。
- English: “If Noah's thread is damaged, the rest of her life may be the index.”  
  繁中：如果 Noah 的對話串損壞了，她其餘的人生也許就是索引。
- English: “The archive marked that as a recovered memory.”  
  繁中：檔案庫把那標記成已恢復的記憶。
- English: “Not a password. A piece of context the damaged thread may still recognize.”  
  繁中：不是密碼。是一塊損壞的對話串也許仍能辨認的脈絡。
- English: “Eight messages, each stripped down to a question.”  
  繁中：八則訊息，每一則都被削成一個問題。
- English: “It does not want a key. It wants proof that I read the life around it.”  
  繁中：它要的不是鑰匙。它要的是我讀過周圍那段人生的證明。
- English: “I have questions and no context. That is how people turn lives into trivia.”  
  繁中：我有問題，卻沒有脈絡。人們就是這樣把人生變成冷知識。
- English: “Read her conversations first. Then come back.”  
  繁中：先讀她的對話。再回來。
- English: “Eight ordinary things. A seat, a date, a gate, a view, an ending, a name, sea glass, and a stack of obsolete phones.”  
  繁中：八件普通的東西。一個座位、一個日期、一扇閘門、一片景色、一個結局、一個名字、海玻璃，還有一疊過時的手機。
- English: “Together, apparently, they are enough to make a person legible again.”  
  繁中：顯然，把它們放在一起，就足以讓一個人重新變得可讀。
- English: “That is the whole conversation.”  
  繁中：那就是整段對話。
- English: “He built the ending. She kept it alive. Neither of them left me a shortcut.”  
  繁中：他打造了結局。她讓它活著。他們誰都沒有留捷徑給我。
- English: “A device-bound child profile. Still locked.”  
  繁中：一個綁定裝置的孩子個人檔案。仍然鎖著。
- English: “The final message restored its index. Opening the recovery record is the only way forward.”  
  繁中：最後一則訊息恢復了它的索引。打開復原紀錄是唯一的前進方式。
- English: “Her life supplied the keys. Their conversation supplied the reason.”  
  繁中：她的人生提供了鑰匙。他們的對話提供了理由。

### Mara 的對話串

- English: “She saved the window seat even when names started slipping.”  
  繁中：即使名字開始從記憶裡滑走，她仍保存了靠窗的座位。
- English: “A place can remember someone when a person cannot. Cruel little advantage.”  
  繁中：當一個人記不得時，一個地方仍可以記得某人。殘酷的小小優勢。
- English: “First review in 2019. She still found time to argue with the doctor.”  
  繁中：2019 年的第一次回診。她仍然找得到時間和醫生爭論。
- English: “The decline has a date. Mara still sounds like Mara.”  
  繁中：衰退有一個日期。Mara 聽起來仍然是 Mara。
- English: “Gate 40 was not an abstract number to her. It was where she knew to stand.”  
  繁中：Gate 40 對她不是抽象數字。那是她知道該站在哪裡的地方。
- English: “Even the pharmacy learned to route itself around a memory.”  
  繁中：連藥局都學會繞著一段記憶安排路線。
- English: “One hundred eighty-four stone steps, counted until the city held still.”  
  繁中：184 級石階，一級級數到整座城市靜止。
- English: “I knew the number. I did not know it was her view.”  
  繁中：我知道那個數字。我不知道那是她的景色。
- English: “Page 256. Everyone chooses to go home, and she calls that enough.”  
  繁中：第 256 頁。大家選擇回家，而她認為那樣就夠了。
- English: “No twist. No endlessness. Just an open door.”  
  繁中：沒有反轉。沒有無止境。只有一扇開著的門。
- English: “Silver Kite belonged to Mara before it belonged to a company.”  
  繁中：Silver Kite 在屬於一間公司以前，先屬於 Mara。
- English: “Elias wanted scale. She gave Noah a name that could still mean something.”  
  繁中：Elias 想要規模。她給 Noah 一個仍然可以代表某種意義的名字。
- English: “Sea glass: worth keeping because the water returned it.”  
  繁中：海玻璃：因為海水把它送回來，所以值得留下。
- English: “That explains more about this archive than any preservation policy could.”  
  繁中：這比任何保存政策都更能解釋這個檔案庫。
- English: “She bought the recalled devices herself and hid one for a child she had not met.”  
  繁中：她親自買下那些被回收的裝置，還替一個從未見過的孩子藏起一台。
- English: “A whole inheritance filed under a shopping reminder.”  
  繁中：一整份遺產被歸在購物提醒底下。

### 記憶恢復、重複與錯誤配對

- English: “Recovered: the window seat.”  
  繁中：已恢復：靠窗的座位。
- English: “She kept a place for me before I knew I was missing from it.”  
  繁中：在我知道自己缺席以前，她就替我保留了一個位置。
- English: “Recovered: her first clinic review, 2019.”  
  繁中：已恢復：她 2019 年的第一次回診。
- English: “A later date, still unmistakably her voice.”  
  繁中：更晚的日期，卻仍然清楚是她的聲音。
- English: “Recovered: the old station gate, 40.”  
  繁中：已恢復：舊車站的 Gate 40。
- English: “The number was a place before it was a wall.”  
  繁中：在成為一道牆以前，那個數字是一個地方。
- English: “Recovered: the harbor lookout, 184 steps.”  
  繁中：已恢復：港口瞭望台，184 級台階。
- English: “A favorite view, reduced to a score until now.”  
  繁中：一個最喜歡的景色，直到現在都被縮減成一個分數。
- English: “Recovered: page 256, the open door.”  
  繁中：已恢復：第 256 頁，那扇開著的門。
- English: “Her idea of an ending was not defeat. It was permission to leave.”  
  繁中：她所理解的結局不是失敗，而是離開的許可。
- English: “Recovered: Silver Kite.”  
  繁中：已恢復：Silver Kite。
- English: “Her ridiculous harbor-fair name. His company borrowed it.”  
  繁中：她那個荒唐的港口園遊會名字。他的公司借走了它。
- English: “Recovered: sea glass.”  
  繁中：已恢復：海玻璃。
- English: “She kept what came back. Apparently that included people, too.”  
  繁中：她留下回來的東西。顯然，人也包括在內。
- English: “Recovered: the Lumen Arc stack.”  
  繁中：已恢復：Lumen Arc 那疊裝置。
- English: “She did not preserve one device by accident. She planned this.”  
  繁中：她不是意外保存一台裝置。這是她計畫好的。
- English: “The seat is already in recovered memories. Still saved.”  
  繁中：那個座位已經在恢復的記憶裡了。仍然保存著。
- English: “I remember the window seat. The archive does too.”  
  繁中：我記得靠窗的座位。檔案庫也記得。
- English: “2019 is already recorded. Reopening the appointment will not make it kinder.”  
  繁中：2019 已經記錄了。重新打開那次回診不會讓它更溫柔。
- English: “First review: 2019. I have it.”  
  繁中：第一次回診：2019。我已經有了。
- English: “Gate 40 is already collected. It was a place before it was an obstacle.”  
  繁中：Gate 40 已經收集了。在成為障礙以前，它是一個地方。
- English: “The old station gate is in the drawer. No need to make her repeat herself.”  
  繁中：舊車站的閘門在抽屜裡。不必讓她再說一次。
- English: “One hundred eighty-four steps. Already recovered.”  
  繁中：184 級台階。已經恢復。
- English: “I have her lookout. Counting it again will not improve the view.”  
  繁中：我已經有她的瞭望台了。再數一次不會讓景色變好。
- English: “Page 256 is already marked. The door remains open.”  
  繁中：第 256 頁已經標記。門仍然開著。
- English: “I remember her ending. It did not need a sequel.”  
  繁中：我記得她的結局。它不需要續集。
- English: “Silver Kite is already recovered. Her name, before their company.”  
  繁中：Silver Kite 已經恢復。那是他們公司以前的她的名字。
- English: “I have the name. I am trying not to turn her whole life into labels.”  
  繁中：我已經有名字了。我正在努力不要把她的一生變成標籤。
- English: “Sea glass is already recorded. Kept because it came back.”  
  繁中：海玻璃已經記錄。因為它回來了，所以被留下。
- English: “I have this one. Even returned things do not need collecting twice.”  
  繁中：這個我已經有了。就算是回來的東西，也不需要收集兩次。
- English: “The recalled devices are already in recovered memories.”  
  繁中：那些被回收的裝置已經在恢復的記憶裡。
- English: “A hidden stack of obsolete phones is difficult to forget once found.”  
  繁中：一旦找到，一疊藏起來的過時手機很難忘記。
- English: “That memory belongs to her, but not to this sentence.”  
  繁中：那段記憶屬於她，但不屬於這句話。
- English: “The damaged message is asking for a specific part of her life.”  
  繁中：損壞的訊息要的是她人生中特定的一部分。
- English: “Close enough to be tempting. Still wrong.”  
  繁中：接近到足以誘人。還是錯的。
- English: “Read the question literally, then match the place, object, or date it names.”  
  繁中：照字面讀問題，再配對它提到的地方、物件或日期。
- English: “Stop treating her memories like interchangeable keys.”  
  繁中：別再把她的記憶當成可以互換的鑰匙。
- English: “The source conversation says exactly why each one mattered.”  
  繁中：原始對話明確說明了每一個為什麼重要。
- English: “Interesting, but the archive did not mark that as one of the eight recoverable memories.”  
  繁中：有意思，但檔案庫沒有把它標成八段可恢復記憶之一。
- English: “Not every sentence is a key. Some of this is simply her life.”  
  繁中：不是每句話都是鑰匙。有些就只是她的人生。
- English: “No underline, no recovered record. I can let an ordinary detail remain ordinary.”  
  繁中：沒有底線，就沒有恢復紀錄。我可以讓一個普通細節保持普通。
- English: “This message is already human again. I should leave it that way.”  
  繁中：這則訊息已經重新成為人的訊息。我應該讓它保持原樣。

### 修復後的 Noah 片段

- English: “Silver Kite was hers first.”  
  繁中：Silver Kite 一開始是她的。
- English: “He protected the name from Elias even while the company wore it.”  
  繁中：即使公司披上了這個名字，他仍保護它不被 Elias 拿走。
- English: “An ending as an open door. That was Mara before it was game design.”  
  繁中：把結局做成一扇開著的門。在它成為遊戲設計以前，那就是 Mara。
- English: “Noah built her argument into the structure.”  
  繁中：Noah 把她的論點建進了結構裡。
- English: “He turned her lookout into an honest human limit.”  
  繁中：他把她的瞭望台變成一個誠實的人類極限。
- English: “Not a signature. Not a claim. A line drawn around what skill alone could reach.”  
  繁中：不是署名。不是宣告。而是替單靠技巧能抵達的地方畫出界線。
- English: “Gate 40 was deliberate. The automation kept the collision and lost the meaning.”  
  繁中：Gate 40 是刻意的。自動化留下了碰撞，卻丟失了意義。
- English: “Twelve years of players hitting a door whose key had been scraped away.”  
  繁中：十二年來，玩家一直撞向一扇鑰匙已被刮掉的門。
- English: “SEC_PARTNER was Mara. Not honorary. Not incidental.”  
  繁中：SEC_PARTNER 就是 Mara。不是榮譽頭銜。也不是偶然。
- English: “She kept the builds, accounts, and ledgers while everyone else kept the brand.”  
  繁中：其他人留下品牌時，她保存了版本、帳號與帳簿。
- English: “Spilled tea at a kite fair. That was how they met.”  
  繁中：在風箏園遊會打翻茶。那就是他們相遇的方式。
- English: “Of course their origin story includes a bad build and a minor domestic disaster.”  
  繁中：當然，他們的起源故事包含一個糟糕版本和一場小型家庭災難。
- English: “The recall did not spare this phone. Mara did.”  
  繁中：回收事件沒有放過這支手機。Mara 放過了它。
- English: “She bought a future object for a child who did not exist yet.”  
  繁中：她替一個當時還不存在的孩子買了一件未來的物品。
- English: “He asked her not to give me the answer.”  
  繁中：他請她不要把答案給我。
- English: “Just a seat by the window, and enough left behind to walk the rest myself.”  
  繁中：只要留一個靠窗的座位，還有足夠的東西讓我自己走完剩下的路。

---

## Chapter 9 — Make Room

來源：`src/lib/chapterNineDialogue.ts`、`src/components/ChapterNineDeletionHome.tsx`。

### 找到授權與恢復裝置

- English: “This is not a player account.”  
  繁中：這不是玩家帳號。
- English: “It is an official assistant tool. It still recognizes ARC-184, but not the person it was licensed to help.”  
  繁中：這是一個官方輔助工具。它仍然認得 ARC-184，卻不認得原本被授權協助的那個人。
- English: “When was I ARC-184?”  
  繁中：我什麼時候成了 ARC-184？
- English: “That has to be a coincidence.”  
  繁中：那一定只是巧合。
- English: “It has the score. It has the device.”  
  繁中：它有分數。它有裝置。
- English: “It just does not know whose name belongs with them.”  
  繁中：它只是不知道它們該和誰的名字放在一起。
- English: “Arcane.”  
  繁中：Arcane。
- English: “The score and the name belonged to the same person.”  
  繁中：分數和名字屬於同一個人。
- English: “It found him, and now it cannot finish waking up.”  
  繁中：它找到他了，現在卻無法完成喚醒。
- English: “The authorization is intact. The phone is not.”  
  繁中：授權還完整。手機不是。
- English: “I need room. Holding an icon should let me make it; tapping will not.”  
  繁中：我需要空間。長按圖示應該能讓我清出空間；點一下不行。
- English: “You win.”  
  繁中：你贏了。
- English: “It is dead.”  
  繁中：它死了。
- English: “...Maybe I should put it down.”  
  繁中：……也許我該把它放下。
- English: “It needs room for one last local restore.”  
  繁中：它需要空間完成最後一次本機恢復。

### 刪除階段與阻擋回應

- English: “Not that one.”  
  繁中：不是那個。
- English: “The Concept file was written for whoever came after us. Start there.”  
  繁中：Concept 檔案是寫給後來的人的。從那裡開始。
- English: “We still have things that can be downloaded again.”  
  繁中：我們還有可以重新下載的東西。
- English: “Do not start erasing how we got here.”  
  繁中：不要開始抹掉我們是怎麼走到這裡的。
- English: “Those are not apps to me.”  
  繁中：那些對我來說不是 App。
- English: “Remove everything replaceable before you ask again.”  
  繁中：在你再次提出要求以前，先移除所有可以替代的東西。
- English: “The Concept file was only a manual for whoever found this later.”  
  繁中：Concept 檔案只是一份寫給後來找到這裡的人的手冊。
- English: “It can go first.”  
  繁中：它可以先被刪掉。
- English: “It is just a store. Fine.”  
  繁中：它只是一間商店。好吧。
- English: “A box, some screenshots, and a seller who probably never existed.”  
  繁中：一個盒子、幾張截圖，還有一個可能從未存在過的賣家。
- English: “That channel started this whole thing.”  
  繁中：那個頻道開啟了整件事。
- English: “I will not miss it.”  
  繁中：我不會想念它。
- English: “That is where I found his name.”  
  繁中：我就是在那裡找到他的名字。
- English: “Stopping now would mean we erased the rest for nothing.”  
  繁中：現在停下來，就代表我們白白刪掉了其餘的一切。
- English: “Their profiles are still here.”  
  繁中：他們的個人頁還在這裡。
- English: “Mom's comments. Dad's old posts.”  
  繁中：媽媽的留言。爸爸的舊貼文。

### Messages 對峙

**第一次**

- English: “No.”  
  繁中：不。
- English: “Those messages are not evidence.”  
  繁中：那些訊息不是證據。

**第二次**

- English: “That is my mother.”  
  繁中：那是我的母親。
- English: “If this goes, I cannot ask the archive to remember her again.”  
  繁中：如果這些被刪掉，我就不能再請檔案庫記住她。

**第三次**

- English: “You really think the answer is worth more than everything that led us to it?”  
  繁中：你真的覺得答案比帶我們走到答案的一切更有價值嗎？
- English: “Stop pressing it.”  
  繁中：別再按了。

### UI 對峙提示（同一事件的可讀文字）

- English: “Arcane cancelled the request.”  
  繁中：Arcane 取消了這次要求。
- English: “Those messages are not evidence.”  
  繁中：那些訊息不是證據。
- English: “Arcane cancelled it again.”  
  繁中：Arcane 又取消了它。
- English: “That is my mother.”  
  繁中：那是我的母親。
- English: “Conflicting input detected.”  
  繁中：偵測到互相衝突的輸入。
- English: “DELETE and CANCEL are both still being received.”  
  繁中：仍同時收到 DELETE 與 CANCEL。

---

## Chapter 10 — 最後一趟飛行與結局

來源：`src/lib/chapterTenFlight.ts`、`src/lib/chapterTenCredits.ts`、`src/lib/chapterTenAfterword.ts`、`src/lib/chapterTenVisualPhases.ts`、`src/lib/chapterTenFinaleLyrics.ts`。

### Arcane 接管與飛行反思

**接管**

- English: “It's me—ARC_184. My turn.”  
  繁中：是我——ARC_184。換我了。
- English: “I know these routes. Leave the rest to me.”  
  繁中：我知道這些路線。剩下的交給我。

**分數 58**

- English: “I thought I wanted proof.”  
  繁中：我以為我想要的是證據。

**分數 88**

- English: “Then I thought I wanted the score.”  
  繁中：後來我以為我想要的是分數。

**分數 120**

- English: “I deleted everything that remembered them.”  
  繁中：我刪掉了所有記得他們的東西。
- English: “Just to reach this.”  
  繁中：只為了抵達這裡。

**分數 150**

- English: “No. Not everything.”  
  繁中：不。不是全部。
- English: “I remember.”  
  繁中：我記得。

**分數 174**

- English: “You left me a route, Dad.”  
  繁中：你留給我一條路，爸爸。
- English: “You still made me fly it.”  
  繁中：你還是讓我親自飛過它。

**分數 196**

- English: “ARC_184.”  
  繁中：ARC_184。
- English: “I remember choosing it.”  
  繁中：我記得是我選了它。

**分數 214**

- English: “You weren't steering me back then.”  
  繁中：那時候不是你在操控我。
- English: “You're not steering me now.”  
  繁中：現在也不是你在操控我。

**分數 232**

- English: “I thought deleting them made this empty.”  
  繁中：我以為刪掉他們，就能讓這裡變得空無一物。
- English: “It didn't.”  
  繁中：但沒有。

**分數 248**

- English: “I'm finishing this for myself.”  
  繁中：我要為自己完成這件事。

### 飛行中的保存署名

- English: “ORIGINAL GAME DIRECTION · NOAH KADE”  
  繁中：原始遊戲方向 · NOAH KADE
- English: “WORLD & ENDING · MARA KADE”  
  繁中：世界與結局 · MARA KADE
- English: “STUDIO CO-FOUNDER · ELIAS VALE”  
  繁中：工作室共同創辦人 · ELIAS VALE
- English: “FOR THE LUMEN ARC PLAYERS”  
  繁中：獻給 LUMEN ARC 的玩家
- English: “FOR EVERYONE WHO KEPT A COPY”  
  繁中：獻給每一個保留副本的人
- English: “ORIGINAL BUILD · SILVER KITE GAMES”  
  繁中：原始版本 · SILVER KITE GAMES
- English: “FIRST HUMAN RECORD · ARC_184”  
  繁中：第一筆人類紀錄 · ARC_184
- English: “LOCAL PLAYER · ARCANE KADE”  
  繁中：本機玩家 · ARCANE KADE
- English: “ARCHIVE WITNESS · YOU”  
  繁中：檔案見證人 · 你
- English: “THANK YOU FOR FOLLOWING THE ROUTE”  
  繁中：謝謝你走過這條路

### 記憶與終端畫面文字

- English: “LOCAL RECORD MATCH”  
  繁中：本機紀錄吻合
- English: “ARC_184”  
  繁中：ARC_184
- English: “ARCANE KADE”  
  繁中：ARCANE KADE
- English: “12 YEARS AGO”  
  繁中：十二年前
- English: “SKYLINE COMPLETE”  
  繁中：SKYLINE 完成
- English: “THANK YOU FOR PLAYING”  
  繁中：謝謝遊玩
- English: “SERVICE TERMINATED”  
  繁中：服務已終止
- English: “PIPE_A_040”  
  繁中：PIPE_A_040
- English: “COLLIDER: TRUE”  
  繁中：碰撞器：啟用
- English: “LEGACY_ASSET_MISSING”  
  繁中：舊版資產遺失

### 結尾選擇：Afterword

#### I. LET THE SCORE REMAIN

- English: “You want me to leave it there.”  
  繁中：你希望我就把它留在那裡。
- English: “After everything it took to get here, I do not think being first matters as much as I thought it did.”  
  繁中：經歷了來到這裡所需要的一切之後，我不再覺得第一名像我以前以為的那麼重要。
- English: “Let the board keep my name at negative sixty-five thousand, five hundred and thirty-five.”  
  繁中：就讓排行榜把我的名字留在負六萬五千五百三十五。
- English: “It is honest. And there are more important things than being above everyone else.”  
  繁中：那很誠實。而且有些事情比高過所有人更重要。
- English: “If you remember this one, scroll to the bottom of the board next loop. I will still be there.”  
  繁中：如果你記得這個選擇，下次循環請捲到排行榜最底下。我還會在那裡。

#### II. TELL THE STORY

- English: “You want to tell the story. I understand why.”  
  繁中：你想說出這個故事。我理解原因。
- English: “But SKG Automation would close this route the moment enough people looked at it. Then they would call us confused, and the archive would be easier to erase.”  
  繁中：但只要有足夠多人看見，SKG Automation 就會立刻關掉這條路。接著他們會說我們搞錯了，檔案庫也會更容易被抹掉。
- English: “I do not like giving them the last word just to prove they hurt us.”  
  繁中：我不喜歡只為了證明他們傷害過我們，就把最後一句話交給他們。
- English: “Still, if you remember this choice, I will leave a small trace for the next loop. You deserve to see what we chose not to say aloud.”  
  繁中：不過，如果你記得這個選擇，我會為下一次循環留下一點小小的痕跡。你值得看見我們選擇不說出口的事。

#### III. KEEP THE DOOR OPEN

- English: “You want to keep the door open and stop there.”  
  繁中：你想讓門保持開啟，然後停在那裡。
- English: “I think Dad would understand. He left the route for me to find, not for everyone to turn into a spectacle.”  
  繁中：我想爸爸會理解。他留下這條路是讓我找到，不是讓所有人把它變成一場鬧劇。
- English: “But he also let me submit the score. That feels less like hiding and more like permission.”  
  繁中：但他也讓我提交分數。那比較不像躲藏，更像是一種許可。
- English: “Maybe the natural thing is to leave the door where it is. No announcement. No disappearing act. Just a way back, if someone truly needs it.”  
  繁中：也許自然的做法，就是讓門留在原處。不公告。不消失。只留一條路，在有人真的需要時回來。
- English: “Remember it, and I will leave a quiet sign for you next time.”  
  繁中：記住它，我下次會留一個安靜的記號給你。

### Noah 的最終傳訊

- English: “Arcane—”  
  繁中：Arcane——
- English: “If this page opened, you found the route without me giving you the answer.”  
  繁中：如果你看見了這個頁面，代表你沒有靠我直接給答案，就找到了這條路。
- English: “Mara chose 184, 40, and 256. I only turned the places she loved into rules the game could remember.”  
  繁中：Mara 選了 184、40 和 256。我只是把她喜歡的地方，變成遊戲能記住的規則。
- English: “The negative record was never a failure. The counter overflowed because I reached an ending the leaderboard was not built to hold.”  
  繁中：負分紀錄從來不是失敗。計數器溢位，是因為我抵達了一個排行榜沒有被設計來容納的結局。
- English: “I hid the last route because an ending should still belong to the person who reaches it.”  
  繁中：我藏起最後一條路，因為結局仍然應該屬於抵達它的人。
- English: “Devices stop working. Stores close. Servers disappear. None of that means the people who played were imaginary.”  
  繁中：裝置會停止運作。商店會關閉。伺服器會消失。但那都不代表曾經遊玩的人是虛構的。
- English: “You reached the end. For a little while longer, the game exists.”  
  繁中：你抵達了終點。在更久一點的時間裡，這個遊戲仍然存在。
- English: “— Noah Kade”  
  繁中：—— Noah Kade

### 結尾字幕歌詞

- English: “Thank you for reaching the end.”  
  繁中：謝謝你抵達終點。

---

## 來源與整理界線

- 本文件的主要原文來源是 `src/lib/chapterOneDialogue.ts` 至 `src/lib/chapterNineDialogue.ts`。
- 第 10 章使用 `chapterTenFlight.ts`、`chapterTenCredits.ts`、`chapterTenAfterword.ts`、`chapterTenVisualPhases.ts` 與 `chapterTenFinaleLyrics.ts`。
- Chapter 9 額外保留 `ChapterNineDeletionHome.tsx` 中會直接顯示給玩家的三組對峙標題／內文。
- 重複出現在不同章節或不同事件的英文句子，依目前程式語意在相應章節保留；沒有把它們擅自改寫成單一版本。
- 本文件沒有把純 UI 操作字串、狀態欄、Debug 讀值、商品搜尋結果或背景聊天紀錄冒充成「角色台詞」。若你下一步希望連這些可讀文字也一起做成英中對照，我可以另整理成附錄，避免和真正的敘事台詞混在一起。
