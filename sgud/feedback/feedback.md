# 回饋

本檔記載任務中發現之自有套件、全域技能、全域設定之調整與抽提提案(全域設定 §12.2),一條一列,只增不改;處置結果(已通報、已修、不採納)另記一列並寫明承接哪一列.回饋只是紀錄與提案,實際修改走各自之通報管道.

| 日期 | 類別 | 對象 | 內容 | 依據 |
| --- | --- | --- | --- | --- |
| 2026-11-28 | 自有套件 | wsemi `strleft`、`strright` | 每次呼叫皆經 `optVal`(`iseint`、`parseNumOpt`)檢測位置參數,用於逐鍵判斷之熱路徑時成本遠高於字串運算本身;本套件液化分析之排序欄位因此占約 30%,已改原生判斷(R-LIQ-CLONE-01 規則 5).建議 wsemi 評估對「非負安全整數」之參數先行快速判定,或於文件註明不宜置於熱路徑 | Gitea #232 剖析:1.2.49 之 `liquefaction` 排序欄位 inclusive 30.2%,`parseNumOpt`、`isPlainObj`、`iseint` 之 self 合計約 15%(`node --cpu-prof`,使用端之實際呼叫參數 26 案) |
| 2026-11-28 | 自有套件 | wsemi `interp1` | 每次呼叫重建輸入陣列(`toArrayXY`)並檢測參數;本套件液化沉陷(`sptVolumetricStrainTokimatsuAndSeed`、`sptVolumetricStrainIshiharaAndYoshimine`)以固定之表反覆內插,改後仍占總時間約 12%.建議 wsemi 提供「建一次、查多次」之內插器介面(與 `interp1` 同結果) | Gitea #232 改後剖析:`toArrayXY` inclusive 11.7%、`interp1` inclusive 24.1% |
