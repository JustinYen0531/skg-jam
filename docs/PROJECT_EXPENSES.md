# 專案開支清冊 / Project Expense Register

> 更新日期 / Updated: 2026-08-19
> 資料範圍 / Scope: 本文件只整理目前 Git 工作區與專案文件中可核對的開支線索，不把劇情文字、套件版本或檔案存在誤認為付款證明。
> This register covers only expense-related evidence that can be verified in the current Git workspace and project documents. Story text, dependency versions, and the presence of files are not treated as proof of payment.

## 摘要 / Summary

- 可核對的實際付款紀錄：**0 筆**。
  Verifiable actual payment records: **0 records**.
- 可核對的實際支出總額：**無法由目前資料計算**。
  Verifiable actual-spend total: **cannot be calculated from the current data**.
- 文件中出現的唯一明確金額是 **US$1.84**，但它是 Chapter 3 劇情中的 Lumen Arc 商品標價，不是現實世界的付款紀錄。
  The only explicit amount in the documentation is **US$1.84**, but it is the fictional Lumen Arc listing price in Chapter 3, not a real-world payment record.

## 開支清冊 / Expense Register

| 類別 Category | 項目 Item | 金額 Amount | 狀態 Status | 可核對證據 Evidence | 中文說明 Chinese note |
|---|---|---:|---|---|---|
| 故事內商品 / In-game item | Lumen Arc recovery lot | US$1.84（劇情金額 / story amount） | **不列入實際支出 / Excluded from actual spend** | `docs/CHAPTER_3_PROTAGONIST_DIALOGUE.md:54-62` | 這是遊戲中的賣家 listing 與謎題線索；沒有收據、付款時間或付款方式。 / This is an in-game seller listing and puzzle clue; there is no receipt, payment date, or payment method. |
| AI 服務 / AI service | Gemini API | 未提供 / Not provided | **可能產生成本，未確認 / Potential cost, unconfirmed** | `README.md:16-20`; `.env.example` | 專案要求設定 `GEMINI_API_KEY`，但工作區沒有用量、帳單、方案或付款資料。 / The project asks for a `GEMINI_API_KEY`, but the workspace contains no usage, invoice, plan, or payment data. |
| 軟體相依套件 / Software dependencies | React、Vite、Express、Motion、`@google/genai` 等 | 未提供 / Not provided | **成本未確認 / Cost unconfirmed** | `package.json:14-34` | `package.json` 只記錄套件名稱與版本範圍，不能證明是否付費或是否曾付款。 / `package.json` records package names and version ranges only; it does not prove whether they are paid or whether payment occurred. |
| 字型與外部資源 / Fonts and external resources | Google Fonts CSS import | 未提供 / Not provided | **成本與授權未核對 / Cost and license not verified** | `src/index.css:1` | 專案引用 Google Fonts，但目前沒有購買、訂閱或授權紀錄。 / The project references Google Fonts, but contains no purchase, subscription, or license record. |
| 音樂素材 / Music assets | `public/assets/music/Phase 00.mp3`–`Phase 10.mp3`、Finale SRT | 未提供 / Not provided | **來源與成本未確認 / Source and cost unconfirmed** | `public/assets/music/` | 檔案存在不等於已付款；目前沒有音樂購買收據、作者費用或授權憑證。 / File presence is not proof of payment; there is no music receipt, creator fee, or license certificate in the workspace. |
| 圖像與其他素材 / Images and other assets | `public/assets/` 內的遊戲素材 | 未提供 / Not provided | **來源與成本未確認 / Source and cost unconfirmed** | `public/assets/`; `.gitignore` | 目前可確認素材被納入專案，但無法從 Git 判定是自製、委託、購買或免費取得。 / The assets are present in the project, but Git cannot establish whether they were self-made, commissioned, purchased, or obtained for free. |
| 發佈與託管 / Publishing and hosting | itch.io、AI Studio／Cloud Run 相關說明 | 未提供 / Not provided | **未發現付款資料 / No payment data found** | `README.md:5-9`; `docs/ITCH_IO_DESCRIPTION.md:1` | 文件提到發佈平台與 AI Studio，但沒有方案、流量、託管或平台費用帳單。 / The documentation mentions publishing platforms and AI Studio, but contains no plan, traffic, hosting, or platform-fee invoice. |

## 不應計入總額的金額 / Amounts That Must Not Be Added to the Total

### US$1.84 — 劇情商品標價 / fictional listing price

`docs/CHAPTER_3_PROTAGONIST_DIALOGUE.md` 將 `A Lumen Arc recovery lot for $1.84.` 寫成玩家在遊戲中看到的賣家 listing。後續對話也明確把它放在 `ORDER INSTANT`、風險確認與玩家接受購買的劇情流程中。這只能證明遊戲設計了「購買」情節，不能證明開發者真的支付了 US$1.84。

`docs/CHAPTER_3_PROTAGONIST_DIALOGUE.md` presents `A Lumen Arc recovery lot for $1.84.` as an in-game seller listing. The surrounding dialogue places it in the fictional `ORDER INSTANT`, risk-confirmation, and acceptance flow. This proves that the game contains a purchase scene; it does not prove that the developer actually paid US$1.84.

## 目前缺少的記帳欄位 / Missing Accounting Fields

若要把本清冊變成可計算的正式支出表，每筆實際支出至少需要補上：

To turn this register into a calculable accounting sheet, each real expense needs at least:

1. 日期與時區 / Date and timezone
2. 供應商或收款人 / Vendor or payee
3. 項目與用途 / Item and purpose
4. 金額與幣別 / Amount and currency
5. 付款方式與交易識別碼 / Payment method and transaction ID
6. 是否含稅、退款或持續訂閱 / Tax, refund, or recurring-subscription status
7. 收據、發票或帳單連結 / Receipt, invoice, or billing-record link
8. 是否已由專案實際支付 / Whether the project actually paid it

## 結論 / Conclusion

以目前專案檔案能證明的範圍，**沒有任何一筆現實世界開支可以被確認並加總**。因此本文件暫不填入「總支出 = US$1.84」，也不替 Gemini、套件、音樂、圖像或託管服務推估價格。若你提供收據、付款截圖、信用卡／平台帳單或一份原始支出清單，我可以沿用本文件格式補上實際金額、幣別、分類與總計。

Based on what the project files can prove, **no real-world expense can currently be confirmed or totaled**. This document therefore does not report “total spend = US$1.84,” and does not estimate prices for Gemini, dependencies, music, images, or hosting. If you provide receipts, payment screenshots, card/platform statements, or a raw expense list, this format can be extended with actual amounts, currencies, categories, and totals.

## 核對限制 / Verification Limits

- 本次核對為 Git 工作區與靜態文件搜尋；未連線查詢支付平台、信用卡、Gemini、itch.io 或 AI Studio 帳務。
  This review used Git workspace inspection and static document search; it did not query payment platforms, cards, Gemini, itch.io, or AI Studio billing.
- 因此「未發現」代表目前工作區沒有相關證據，不代表外部世界一定沒有支出。
  “Not found” means no evidence exists in the current workspace; it does not mean no expense exists outside the workspace.
