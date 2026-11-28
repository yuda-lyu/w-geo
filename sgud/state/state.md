# 狀態

本檔記載當前已開發功能之最新狀態:各功能做到哪裡、對應之規則帳本條目與測試檔、已知缺口與待辦、最近一次驗證或發布之版本.只記現況,不寫過程(過程見 `sgud/exp/experience.md`).規則帳本為藍圖(`sgud/rule/rulebook.md`),兩者比對即知尚未做到者.

套件:`w-geo`(大地工程分析工具套件;`package.json` version 未動,現為 1.2.49,2026-11-28 修正輪(Gitea #232)之改動待主控複審並發布).相依 `wsemi` ^1.9.83、`w-optimization` ^1.0.82、`w-statistic` ^1.0.85、`w-highcharts` ^1.0.65,devDependencies `w-package-tools` ^1.1.32.

## 功能現況

本套件功能為既有之大地工程函數庫(`src/` 匯出於 `src/WGeo.mjs`),本輪未新增功能;下表為依領域分組之現況,**「完成」指既有實作且對應測試全綠,未逐項審視功能完整度**.測試皆為 `test/<函數名>.test.mjs`(無 `unit-`／`api-` 前綴之舊命名,未改).

| 領域 | 函數(`src/`) | 狀態 | 規則帳本 | 測試 |
| --- | --- | --- | --- | --- |
| 深度檢查 | `checkDepth`、`checkDepthStartEnd` | 完成 | R-JUDGE-FINITE-01(站點已套) | `checkDepth`、`checkDepthStartEnd` |
| 起訖深度與深度互算 | `calcDepthStartEndByDepth`、`calcDepthStartEndByConnect`、`calcDepthStartEndByGroup`、`calcDepthByDepthStartEnd`、`calcDepthStartEndFromCenter`、`calcDepthMaxMin` | 完成(2026-10-31:`ByConnect`、`ByGroup` 之原始值直送 `judge` 處補 `cdbl`) | R-JUDGE-FINITE-01 | `calcDepthStartEndByDepth`、`calcDepthStartEndByConnect`(含 `f7`)、`calcDepthStartEndByGroup`(含 `f5`)、`calcDepthByDepthStartEnd`、`calcDepthMaxMin`;`calcDepthStartEndFromCenter` 無獨立測試檔 |
| 依深度分組／分割／合併／裁切 | `groupByDepthStartEnd`、`sepDepthStartEndByDepth`、`mergeByDepthStartEnd`、`cutByDepthStartEnd`、`complementDepthData`、`calcLayersByMerge`、`calcLayersByCompress`、`smoothDepthByKey` | 完成(2026-10-31:`groupByDepthStartEnd`、`sepDepthStartEndByDepth` 補 `cdbl`) | R-JUDGE-FINITE-01 | `groupByDepthStartEnd`(含 `f6`)、`sepDepthStartEndByDepth`(含 `f7`)、`mergeByDepthStartEnd`、`cutByDepthStartEnd`、`complementDepthData`、`calcLayersByCompress`;`calcLayersByMerge`、`smoothDepthByKey` 無獨立測試檔 |
| 土壤分類 USCS 與粒徑 | `calcClassifyUscs`、`intrpPsdBySize`、`calcIntrpPsdContentIso`／`Uscs`、`dtIntrpPsd*`、`calcRelaPsdContent`／`dtRelaPsdContent` | 完成;`calcClassifyUscs` 有一處待裁示(見下) | R-JUDGE-FINITE-01(`calcClassifyUscs.mjs:244` 待裁示) | `calcClassifyUscs`、`intrpPsdBySize`、`calcIntrpPsdContentIso`、`calcIntrpPsdContentUscs`、`dtIntrpPsdBySize`、`dtIntrpPsdContentIso`、`dtIntrpPsdContentUscs`、`relaPsdContent`、`calcRelaPsdContent`、`dtRelaPsdContent` |
| 孔隙、塑性、相對密度、OCR 估算 | `calcRelaPorous`／`relaPorous`、`calcRelaPlasticity`／`relaPlasticity`、`calcEstmRelativeDensity`／`estmRelativeDensity`、`calcEstmOcr`／`estmOcr`、`dtRelaPorous`、`dtRelaPlasticity`、`dtEstm*`、`trimParams` | 完成 | — | 同名測試檔 |
| 垂直應力 | `calcVerticalStress`、`calcEstmVerticalStress`、`checkVerticalStress`、`buildSvsAndSvps` | 完成 | — | `calcVerticalStress`、`calcEstmVerticalStress`;`checkVerticalStress`、`buildSvsAndSvps` 無獨立測試檔 |
| CPT 分析 | `calcCpt`、`calcCptClassify`、`calcCptLayers`、`calcCptUnitWeight`、`calcCptVelocityShear`、`getCptDepthHcOpt` | 完成(`dig` 站點結果不變,見下) | — | `calcCpt`、`calcCptLayers`、`calcCptUnitWeight`、`calcCptVelocityShear`;`calcCptClassify`、`getCptDepthHcOpt` 無獨立測試檔 |
| 液化分析 | `calcLiquefaction`、`calcLiquefactionSpt`、`calcLiquefactionSptForCriticalPga`、`calcLiquefactionSpt*`、`calcLiquefactionAddErr`／`ClearStress`／`ExtractErr` | 完成(2026-11-28:內部複製與共用計算之加速,輸出與 1.2.49 逐字相同;使用端夾具合計耗時約為改前之 1/3.7,見下〈最近一次驗證〉) | R-LIQ-CLONE-01 | `calcLiquefaction-cpt`、`calcLiquefaction-spt`、`calcLiquefactionSpt`、`calcLiquefactionSptForCriticalPga`、`unit-liquefactionFrozen`(1.2.49 凍結值 61 案);對拍工具 `test/tools/liqDuel.mjs` |
| 其他 | `buildInterpFun`、`calcPropInterfaceFrictionAngle` | 完成 | — | `buildInterpFun`、`calcPropInterfaceFrictionAngle` |

## 待裁示

- **`calcClassifyUscs.mjs:244`(`ckJudge`)**:以 lodash `isNumber`(`Infinity` 亦為 true)把關後直送 `judge`.`ctClay + ctSilt`(或 `ctSand + ctGravel`)兩項皆約 `1e308` 以上、相加溢位為 `Infinity` 時,舊版回 `{ USCS: '', err: ['rFineContent[Infinity] > 100'], msg }`,現 throw `x1 is not a number`(`ctClay`、`ctSilt` 單項為 `Infinity`/`'1e400'` 時經 `cdbl` 為有限數,結果不變).**建議作法**:`ckJudge` 之把關改為有限數判定(如 `isenum`)並把不合者當 `is not a number` 記入 `err`(維持「函數不因數值內容 throw」之契約);**不建議**對運算元套 `cdbl`(`isNumber(NaN)` 為 true,套 `cdbl` 會把 `NaN` 靜默當 0).若維持 throw,須補 README〈Breaking changes〉一行.

## 已知缺口與待辦

- `calcDepthStartEndByGroup` 兩相鄰樣本深度皆約 `1e308` 以上時內部 `(dc0 + dc1) / 2` 溢位為 `Infinity` 使 `judge` throw:刻意不修(無實務意義),已記 README〈Breaking changes〉(R-JUDGE-FINITE-01 已知限制 1).
- 舊命名之測試檔(無 `unit-`／`api-` 前綴)與部分函數無獨立測試檔(見上表):未動,屬既有狀況.
- 未發布:`dist/`、`docs/` 為發布時自動產製,本輪未重編.
- 液化分析改後之耗時以各方法之實際計算為主(`sptNJRA`、`sptSettlement`,其內 wsemi `interp1` 約占 1/4),屬 wsemi 之部分已記 `sgud/feedback/feedback.md`,未改.
- `calcLiquefactionSptForCriticalPga` 會就地補齊呼叫端層物件之 `FC`、`rd`、`rsat`、`N60`、`soilClassification`,且回傳之 `ltdt` 即呼叫端之物件:1.2.49 即如此,刻意不改(語意不變);其餘液化相關公開函數不修改輸入.

## 最近一次驗證

2026-11-28(主控任務 20261128134128 之 geo699,Gitea #232 液化分析加速):全套 `npm test`(`quiet-run --lock`)5452 通過/0 失敗/0 略過(既有 5390＋新增 `unit-liquefactionFrozen` 62).使用端之實際呼叫參數夾具(26 孔,主控保管)PASS 26/26,合計耗時 1.2.49 中位 23.5 秒 → 改後中位 6.7 秒(交替各 3 次,約 3.5 倍).新舊對拍(`test/tools/liqDuel.mjs`,1.2.49 以 `git archive` 取得)7 組產生器各 500 組＋`calcSpt`、`spt` 另 500 組,0 不同;變異 19 個中 18 個被新測試抓到,1 個(`cloneRowFlat` 共用巢狀值)為等價變異(再對拍 1500 組 0 不同).eslint 變更檔 0 新增(`calcLiquefaction.mjs` 之 `t` 未用為既有);JSDoc 實跑 0 ERROR.前一次驗證(2026-10-31,wsemi 1.9.35～1.9.36 下游修正)見 `sgud/exp/experience.md` §1～§3.
