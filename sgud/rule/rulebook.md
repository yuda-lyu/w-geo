# 規則帳本

本檔為套件設計與開發階段之規則帳本(藍圖),為要求程式碼須長成什麼樣,或由規格產出之測試(項目/說明/流程)有哪些,包含軸、單一擁有者、已知限制、破壞性變更紀錄,以及對應是哪些測試檔案或指令等,由agent自行編列、擴充與維護.當前已做到哪些記於`sgud/state/state.md`.過長時依類型拆為`rulebook_<類型>.md`.

## 索引

| 條目 | 內容 | 位置 |
| --- | --- | --- |
| R-JUDGE-FINITE-01 | 送入 wsemi `judge` 之運算元須為有限數:取自資料之值先 `cdbl`(2026-10-31,wsemi 1.9.35～1.9.36 `judge` 改以 `isenum` 判定且容差改 12 位有效數字) | 本檔 |

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
