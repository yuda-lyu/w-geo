# 累積經驗

本檔為執行工作時特有之累積經驗,留給後續之嘗試、執行與判斷,由agent自行編列、擴充與維護.過長時抽出舊者為`experience_<年月日>.md`,並於本檔註明何時抽出.

## 1. 送入 wsemi `judge` 之值須先 `cdbl`(2026-10-31,wsemi 1.9.35～1.9.36)

- `judge` 現以 `isenum` 判定運算元(`Infinity`、`'0x10'`、`'1e400'` throw),但本套件之輸入檢查多為 `isnum`(三者皆 true).`cdbl` 以 `toFinite` 轉:`±Infinity`、`'1e400'` → ±最大有限數,`'0x10'` → 16,非 `isnum` → 0;故「`isnum` 把關 → `cdbl` → `judge`」為安全寫法,規則見 `sgud/rule/rulebook.md` R-JUDGE-FINITE-01.
- lodash `isNumber` 對 `Infinity`、`NaN` 皆回 true,不能代替有限數判定(`calcClassifyUscs` 之 `ckJudge` 即踩此:兩極大有限數相加溢位為 `Infinity` 時現 throw).要在其上補保護,**不可**對運算元套 `cdbl`(`NaN` 會被靜默當 0).
- `cdbl` 夾到最大有限數後,與「邊界也是最大有限數」者比較會變相等:`calcDepthStartEndByGroup` 之樣本深度 `Infinity` 現落入邊界群組(舊版因 `Infinity` > 群組終點而被略去).這是 `cdbl` 的固有結果,不是 bug.
- 含前後空白之數字字串(`' 10 '`):舊 `judge` 直送 `Decimal` 會 throw `DecimalError`,新 `judge` 會 trim;故四個原始值直送站點補 `cdbl` 後,此類輸入由 throw 變可處理.

## 2. 驗證「相依升版對下游實際結果有無影響」之作法(2026-10-31)

單看全套綠不夠(測試未必碰到差異).改為**新舊並行記錄**,實測有效:

1. 舊版取得:`npm pack wsemi@<舊版> --pack-destination ./tmp/geo`,`tar -xzf ... -C ./tmp/geo/old`(舊版內 `lodash-es`、`decimal.js` 因 `./tmp` 在 repo 內,會向上解析到 repo 的 `node_modules`,不必另裝).
2. 以 Node ESM 的 `module.register` 註冊 resolve hook(`./tmp/geo/loader.mjs`,由 `--import ./tmp/geo/reg.mjs` 載入),依環境變數把 `src/` 內 `wsemi/src/judge.mjs`、`wsemi/src/dig.mjs` 改道到 shim;shim 同時呼叫新舊版,結果(含 throw)不同者追加到 `GEO_LOG`(JSONL),回傳新版,行程結束寫呼叫數與分歧數.另有 `GEO_MODE=old` 把所有 `wsemi/src/*` 改道舊版,供「舊版 + 現行 src」對照.
3. **`NODE_OPTIONS="--import ./tmp/geo/reg.mjs"` 可傳到 `mocha --parallel` 之子行程**;環境變數可穿過 `quiet-run`.全套約 13 秒,各子行程各寫一行摘要.
4. 跑前先做陽性對照(`control.mjs`):確認 shim 真能抓到已知分歧(`judge(1e-11,'>',0)`、`judge(Infinity,'>',1)`),再信任「0 分歧」.
5. 修前紅:`git archive HEAD src | tar -x -C ./tmp/geo/head`,新測試複本放 `./tmp/geo/head/test/`,以 `npx mocha --no-parallel "tmp/geo/head/test/*.test.mjs"` 跑(不得 `git stash`/`restore`).

## 3. 實測結果摘要(wsemi 1.9.25 → 1.9.36)

- `judge`:全套 879,052 次呼叫,新舊 0 分歧(深度多在 0.001～數百公尺,12 位有效數字與舊 `1e-9` 在此量級無差).
- `dig`:`calcCptUnitWeight.mjs:213` 之 `dig(-Infinity, 2)`(只有 `Robertson and Cabal(2010)` 一法會觸及,實測全套 101 次;依公式含 `Math.log10(v.Rf)`、`Math.log10(v.qt / Pa)` 推得為 `Rf` 或 `qt` 為 0 之樣本,未逐筆核對)舊回 `'NaN'`、新回 `''`;其後 `cdbl` 皆得 0,`calcCptUnitWeight` 五方法輸出新舊逐一相同.
- 其他 `dig` 站點(`calcCptLayers`、`_soilGroup`、`getCptDepthHcOpt`、`calcLiquefactionExtractErr`)運算元皆為有限數或已 `cdbl`,0 分歧.`round` 為 lodash 非 wsemi,不受影響.

## 4. 雜項

- `npm i <套件>@latest` 會順手把 `package-lock.json` 頂層 `version` 同步成 `package.json` 現值(原落後 1.2.8 → 1.2.9),並使 `package.json` 末尾多一個換行;皆非版本變更.
- 全套測試並行約 13 秒,5390 案;`calcCptUnitWeight` 等會印大量 console.log(完整輸出約 13 萬行),一律經 `quiet-run`.

## 5. 液化分析加速而輸出逐字不變(2026-11-28,Gitea #232)

- **先量再改**:`node --cpu-prof` 剖析使用端之實際呼叫(每孔 100 個 PGA)得:排序欄位(`liquefactionCore` 末段)逐鍵呼叫 wsemi `strleft`/`strright` 約 30%(每次呼叫皆經 `optVal`/`iseint` 之參數檢測),`cloneDeep` 合計約 34%,`liqParams`(含垂直應力)約 10%.改後剩以 `sptNJRA`、`sptSettlement` 之實際計算為主(其內 wsemi `interp1` 之 `toArrayXY` 約 12%,屬 wsemi,未動).彙整 `.cpuprofile` 之 self/inclusive 時間只需數十行腳本(依 `nodes`、`samples`、`timeDeltas`,inclusive 沿父鏈去重).
- **移除內部 `cloneDeep` 之判準**:輸入為本流程剛複製出且無他處引用者,原地修改與複製後修改結果相同(`cloneDeep` 之輸出再 `cloneDeep` 結構不變,含別名).但**別名**須另看:陣列內同一物件重複出現時,`cloneDeep(rows)` 保留別名、逐列 `cloneDeep(row)` 則拆開;零厚度或近零厚度(相對 1e-13)之層可通過深度連續檢查(12 位有效數字),故別名可到達 `liqFS`,移除逐列複製會改變結果.
- **前段共用之形式**:首個 PGA 照原流程算、以回呼擷取中間結果,其後 PGA 只改寫 `PGA`;前段拋錯時其後 PGA 照原流程,console 輸出次數亦同.比起另寫一份「前段函數」,此法不必複製前段之程式碼,錯誤路徑自然與原流程一致.
- **`calcLiquefactionSptForCriticalPga` 於 1.2.49 即就地修改呼叫端之層物件**(`calcLiquefactionSptAddPropsBasic` 以 `map` 原地寫入 `FC`、`rd`、`rsat`、`N60`、`soilClassification`),回傳之 `ltdt` 即呼叫端之物件;本輪保持不變,測試以「呼叫後狀態與 1.2.49 逐字相同」斷言,其餘公開函數則斷言不修改輸入.
- **對拍之序列化須含物件同一性**:`JSON.stringify` 看不到「輸出與輸入共用物件」與別名;`test/tools/liqSer.mjs` 之 `ser` 首見記 `@id`、再見記 `#id`,並區分 `-0`、`NaN`、`undefined`、原型;console 輸出(Error 取名稱與訊息)與拋錯亦比.
- **錯誤路徑之變異須有可觀察之輸入**:「拋錯時回傳之 `ltdt` 未改寫 PGA」「拋錯時未複製 `preCalc`」兩變異只在「`returnLtdtForEachPga: true` 且液化分析拋錯」時可觀察;純隨機之產生器 60 組內碰不到而存活,改以「情境」先選(各錯誤路徑及其與逐 PGA 回傳之組合)後才被抓到.凍結值之選案亦須以情境為特徵.
- **主控之 `quiet-run` 經 cmd 執行,空字串參數(`""`)會消失**:變異腳本以 `all` 等明確值代替,並對「0 個變異被執行」報失敗(首輪即因此空跑而誤報全抓到).
