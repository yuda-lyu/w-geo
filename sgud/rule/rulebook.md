# 規則帳本

本檔為套件設計與開發階段之規則帳本(藍圖),為要求程式碼須長成什麼樣,或由規格產出之測試(項目/說明/流程)有哪些,包含軸、單一擁有者、已知限制、破壞性變更紀錄,以及對應是哪些測試檔案或指令等,由agent自行編列、擴充與維護.當前已做到哪些記於`sgud/state/state.md`.過長時依類型拆為`rulebook_<類型>.md`.

## 索引

| 條目 | 內容 | 位置 |
| --- | --- | --- |
| R-JUDGE-FINITE-01 | 送入 wsemi `judge` 之運算元須為有限數:取自資料之值先 `cdbl`(2026-10-31,wsemi 1.9.35～1.9.36 `judge` 改以 `isenum` 判定且容差改 12 位有效數字) | 本檔 |
| R-LIQ-CLONE-01 | 液化分析內部函數之複製與共用計算:公開入口複製一次、內部不重複複製、較快之複製須與 `cloneDeep` 同結果、與 PGA 無關之前段於多 PGA 間只算一次;輸出須與 1.2.49 逐字相同(2026-11-28,Gitea #232) | 本檔 |

## R-JUDGE-FINITE-01 送入 `judge` 之運算元須為有限數

**背景**:wsemi 1.9.35～1.9.36(`rulebook_breaking.md` 第 45、46 項)起,`judge(x1, op, x2)` 以 `isenum` 判定運算元:`Infinity`、`-Infinity`、`'0x10'`、`'1e400'`、包裝物件 throw `x1 is not a number`(舊版 `isnum` 放行並照算);容差由固定 `eps = 1e-9` 改為 12 位有效數字(`preciseNum`).本套件之輸入檢查多以 `isnum` 把關(`isnum(Infinity)`、`isnum('0x10')`、`isnum('1e400')` 皆為 true),放行之值若原樣送入 `judge` 即 throw.

### 規則

1. 本套件 `src/` 內每一處 `judge(...)` 之運算元,取自輸入資料者**先經 `cdbl`**(`cdbl` 對 `isnum` 為 true 者回有限數:`±Infinity`、`'1e400'` 取正負最大有限數,`'0x10'` 取 16;非 `isnum` 者回 0),再送入;與同函數內其餘比較之取值方式一致.
2. 程式內運算所得(非直接取自資料)之運算元,不另包 `cdbl`,但須確知不會溢位為 `Infinity`(見已知限制).
3. 保留原值之輸出(如 `sepDepthStartEndByDepth` 分割時寫入之 `di`)仍用原值,比較用另存一個有限數變數(`dic`).
4. 不得為了遷就容差語意改變而改寫測試期望或加繞道;該類差異列待裁示(本輪全套 879,052 次 `judge` 呼叫新舊結果全同,無此類).

### 盤點指令與站點全集(21 行,2026-10-31)

盤點:`Grep "\bjudge\(" src`(須 21 行).判準:已套(運算元已 `cdbl` 或為程式所得之有限數)/本輪補套/刻意不套.

| 站點 | 運算元 | 判準 |
| --- | --- | --- |
| `calcDepthStartEndByConnect.mjs:217,241` | `de0`、`ds1` | 已套(先 `cdbl`) |
| `calcDepthStartEndByConnect.mjs:254` | 末樣本 `depthEnd` | **本輪補套**(`de = cdbl(de)`) |
| `calcDepthStartEndByGroup.mjs:407` | `dc0`、`dc1` | 已套 |
| `calcDepthStartEndByGroup.mjs:485,489` | `rdc`(樣本 `keyDepth`) | **本輪補套**(`rdc = cdbl(rdc)`);`ds`、`de` 為 `calcDepthStartEndByDepth` 之計算所得,見已知限制 1 |
| `calcDepthStartEndByDepth.mjs:203` | `dc0`、`dc1` | 已套 |
| `calcDepthStartEndByDepth.mjs:279` | 末樣本 `depthEnd` | 刻意不套:為同函數 `de = cdbl(dc1)` 所得之有限數 |
| `checkDepthStartEnd.mjs:176,195,201` | `ds1`、`de1`、`de0` | 已套 |
| `checkDepth.mjs:144` | `dc0`、`dc1` | 已套 |
| `groupByDepthStartEnd.mjs:362,378` | `ds1`、`de1`、`de0` | 已套 |
| `groupByDepthStartEnd.mjs:407,411` | `rdc`(樣本 `keyDepth`) | **本輪補套**(`rdc = cdbl(rdc)`);`ds`、`de` 已 `cdbl` |
| `sepDepthStartEndByDepth.mjs:233` | `di`(分割深度) | **本輪補套**(`dic = cdbl(di)`);`ds`、`de` 已 `cdbl` |
| `calcLayersByMerge.mjs:145` | `de0`、`ds1` | 已套 |
| `mergeByDepthStartEnd.mjs:640,774` | `de0`、`ds1` | 已套 |
| `calcClassifyUscs.mjs:244` | `ckJudge` 之 `value1`、`value2` | **待裁示**(見已知限制 2):以 lodash `isNumber`(含 `Infinity`)把關,兩極大有限數相加溢位為 `Infinity` 時現 throw(舊版回 `err`) |

### 已知限制

1. `calcDepthStartEndByGroup` 之 `ds`、`de`(`calcDepthStartEndByDepth` 以 `(dc0 + dc1) / 2` 算出):兩相鄰樣本深度皆約 `1e308` 以上時相加溢位為 `Infinity`,`judge` 現 throw `x2 is not a number`(舊版回傳起訖深度含 `Infinity` 之無意義結果).深度達此量級無實務意義,**刻意不修**,已記 README〈Breaking changes〉.
2. `calcClassifyUscs.mjs` `ckJudge`:同上之 throw,待主控與使用者裁示作法(見 `sgud/state/state.md` 待裁示).

### 測試對應

| 站點 | 測試檔(新增案) |
| --- | --- |
| `calcDepthStartEndByConnect.mjs:254` | `test/calcDepthStartEndByConnect.test.mjs` 之 `f7`(4 案:`'0x10'`、`-Infinity`、`Infinity`、`'1e400'`) |
| `calcDepthStartEndByGroup.mjs:485,489` | `test/calcDepthStartEndByGroup.test.mjs` 之 `f5`(4 案:`'0x10'` 精確值;`'1e400'`、`Infinity`、`-Infinity` 各樣本恰歸屬一群組) |
| `groupByDepthStartEnd.mjs:407,411` | `test/groupByDepthStartEnd.test.mjs` 之 `f6`(4 案) |
| `sepDepthStartEndByDepth.mjs:233` | `test/sepDepthStartEndByDepth.test.mjs` 之 `f7`(4 案) |

執行:`npm test`(本套件 `package.json` 之 test script);只跑此四檔:`npx mocha --no-parallel test/calcDepthStartEndByConnect.test.mjs test/calcDepthStartEndByGroup.test.mjs test/groupByDepthStartEnd.test.mjs test/sepDepthStartEndByDepth.test.mjs --timeout 180000`(以 `quiet-run --lock` 包).

## R-LIQ-CLONE-01 液化分析內部函數之複製與共用計算

**背景**:使用端以 `calcLiquefactionSptForCriticalPga` 求臨界 PGA,每個 PGA(預設 100 個)皆完整重跑 `calcLiquefactionSpt`,其內各層函數入口各自 `cloneDeep`,排序欄位又以 wsemi `strleft`/`strright` 逐鍵判斷(每次呼叫皆做參數檢測),單孔約 0.8 秒(Gitea #232).使用端之成果以 `JSON.stringify` 寫出,輸出有任何一位不同即須全部重算,故**加速不得改變任何輸出**.

### 規則

1. **公開函數之入口複製一次且保留**(呼叫端之輸入不被修改):`calcLiquefactionSpt`、`calcLiquefaction.calc`(`liquefactionCore` 非 `usePrepared` 時)、`calcVerticalStress`、`calcLiquefactionExtractErr`.不得為加速而移除.
2. **內部串接之函數不重複複製**:只有輸入為「本流程剛複製出、無他處引用」之列時,才可原地修改(`liqPL`、`liqSett`、`liqH1`、`liqH1PL` 之輸入為 `liqFS` 逐列新複製者).仍被他處引用者必須複製:`liqParams` 之結果於多個 PGA 共用(`liqFS` 先複製才寫入)、`calcVerticalStress` 之 `core` 兩次讀同一 `ltdt`、`calcLiquefactionSptByPrepared` 拋錯時之 `cap.preCalc`(首個 PGA 拋錯時即其回傳之 `ltdt`).
3. **較快之複製須與 `cloneDeep` 同結果**:`cloneRowFlat` 只對「原型為 `Object.prototype`、無自有 symbol 鍵、無 `__proto__` 鍵、各值皆原始型別(含 `null`、`undefined`)」之列逐鍵指派,其餘一律交 `cloneDeep`(巢狀值、類別實例、陣列等).只回傳末列者以 `calcLiquefactionExtractErrLastone` 只複製末列(與整體複製後取末列同結果).
4. **與 PGA 無關之前段只算一次**:`calcLiquefactionSptForCriticalPga` 之首個 PGA 照原流程計算(`calcLiquefactionSptCore`),以 `cap` 擷取 `preCalc`(液化分析前之各列)與 `prepared`(`liqParams` 之結果);其後之 PGA 以 `calcLiquefactionSptByPrepared` 只改寫各列 `PGA` 再接續 `liqFS` 以後各步.前段(複製、清除應力、`AddPropsBasic`、`AddPropsAdv`、深度檢查、排序、`liqParams` 之地下水位、深度與孔隙參數、垂直應力、`Mw`、振動形式)皆不讀 PGA,唯 `getPGA` 讀各列之 `PGA` 而寫回,即改寫之值.**前段任何一步改為讀 PGA(新增欄位、改公式)時,本共用即不成立**,須把該步移到 `liqFS` 之後或改回逐 PGA 計算.前段拋錯者(`cap.prepared` 不存在)其後各 PGA 皆照原流程(含 console 輸出次數).
5. **熱路徑上與 wsemi 函數等價之字串判斷可改原生寫法**,註解寫明等價依據:`isStrStartWith(k, t)` ≡ `strleft(k, size(t)) === t`、`isStrEndWith(k, t)` ≡ `strright(k, size(t)) === t`(`t` 為非空 ASCII 字串).排序欄位每列只以 `each` 取一次鍵值(`kvs`)供各次遍歷共用.
6. **浮點運算之次序不得改變**;不改 PGA 之掃描方式(不二分、不提前結束,`ltdtRes` 保留完整筆數).
7. 改動本條所列之任何站點前後,**以對拍工具逐字比對新舊版**(見下〈驗證〉),0 不同才可交付.

### 盤點指令與站點全集(2026-11-28)

盤點:`Grep "cloneDeep\(|cloneRowFlat\(" src/calcLiquefaction.mjs src/calcLiquefactionSpt.mjs src/calcLiquefactionExtractErr.mjs src/calcLiquefactionSptForCriticalPga.mjs src/calcVerticalStress.mjs`,扣除 `// console.log` 註解行須 11 處.判準:保留(公開入口或有他處引用)/快速路徑/只複製末列/刻意不改.

| 站點 | 用途 | 判準 |
| --- | --- | --- |
| `calcLiquefactionSpt.mjs` `calcLiquefactionSptCore` 入口 `ltdt = cloneDeep(ltdt)` | 公開入口 | 保留(規則 1) |
| `calcLiquefactionSpt.mjs` `calcLiquefactionSptByPrepared` 之 `cloneDeep(cap.preCalc)` | 拋錯時回傳液化分析前之各列 | 保留(規則 2,`preCalc` 可能即首個 PGA 之回傳) |
| `calcLiquefaction.mjs` `liquefactionCore` 入口 `rows = cloneDeep(rows)` | 公開入口;亦保護 `calcLiquefactionSpt` 拋錯時之 `preCalc` | 保留(規則 1、2) |
| `calcLiquefaction.mjs` `liqFS` 之 `cloneRowFlat(row)` | 逐列複製,保護多 PGA 共用之 `prepared` | 快速路徑(規則 3) |
| `calcLiquefaction.mjs` `cloneRowFlat` 內 2 處 `cloneDeep(row)` | 不合快速路徑者之退回 | 保留 |
| `calcLiquefaction.mjs` `liqPL`、`liqSett`、`liqH1`、`liqH1PL` | 原各自 `cloneDeep(rows)` | 已移除(規則 2) |
| `calcLiquefactionExtractErr.mjs` 公開函數之 `cloneDeep(ltdt)` | 公開入口 | 保留(規則 1) |
| `calcLiquefactionExtractErr.mjs` `calcLiquefactionExtractErrLastone` 之 `cloneDeep(get(ltdt, ub))` | 只複製回傳之末列 | 只複製末列(規則 3) |
| `calcVerticalStress.mjs` `calcVerticalStress` 入口 | 公開入口 | 保留 |
| `calcVerticalStress.mjs` `core` 入口 | 兩次 `core` 讀同一 `ltdt` | 刻意不改(多 PGA 時只在首個 PGA 執行,已非熱點) |
| `calcLiquefactionSptForCriticalPga.mjs` `res = cloneDeep(...)` | 每次呼叫一次,`searchLimit` 會改寫 | 刻意不改(非熱點);同檔末段之 `calcLiquefactionExtractErr(ltdtRes, …)` 亦每次呼叫一次,刻意不改 |

### 驗證

- 凍結值測試:`test/unit-liquefactionFrozen.test.mjs`(期望值 `test/unit-liquefactionFrozen.json`,以 1.2.49 之 `src` 對 `test/tools/liqGen.mjs` 之合成輸入計算後凍結,比對「呼叫後之輸入＋輸出」之型別化序列化、拋錯與 console 輸出).執行:`npx mocha --no-parallel test/unit-liquefactionFrozen.test.mjs --timeout 180000`(以 `quiet-run --lock` 包).改 `liqGen.mjs` 之產生邏輯即須以 1.2.49 之 `src` 重產(`node test/tools/liqFrozenMake.mjs <1.2.49之根>`),不可以改後之程式碼重產.
- 新舊對拍:`git archive <基準commit> src | tar -x -C ./tmp/ref`,再 `node test/tools/liqDuel.mjs ./tmp/ref . critical,spt,calcSpt,calcCpt,extractErr,vstress 500`,末行須為 `DUEL PASS`.
- 使用端之實際呼叫參數夾具(Gitea #232,含使用端之鑽孔試驗數據)由主控保管,不入本庫.
