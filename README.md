# w-geo
A tool for geotech analysis.

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) 
[![npm version](http://img.shields.io/npm/v/w-geo.svg?style=flat)](https://npmjs.org/package/w-geo) 
[![license](https://img.shields.io/npm/l/w-geo.svg?style=flat)](https://npmjs.org/package/w-geo) 
[![npm download](https://img.shields.io/npm/dt/w-geo.svg)](https://npmjs.org/package/w-geo) 
[![npm download](https://img.shields.io/npm/dm/w-geo.svg)](https://npmjs.org/package/w-geo) 
[![jsdelivr download](https://img.shields.io/jsdelivr/npm/hm/w-geo.svg)](https://www.jsdelivr.com/package/npm/w-geo)

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/w-geo/w-geo.html).

## Installation

### Using npm(ES6 module):
```alias
npm i w-geo
```

### In a browser(UMD module):

Add script for w-geo.
```alias
<script src="https://cdn.jsdelivr.net/npm/w-geo@1.2.11/dist/w-geo.umd.js"></script>
```

## Breaking changes

### 相依 wsemi 升至 ^1.9.36(`judge`、`dig` 判定改變)

- **深度比較之容差**：本套件以 wsemi `judge` 比較深度(起訖深度之連續、相等、先後)。`judge` 容差由固定 `1e-9` 改為 12 位有效數字(相對精度)：|x| 約 10～1000 與舊版同級，|x| ≥ 1000 較寬，|x| < 1 較嚴，且小於 `1e-9` 之小數不再歸零(如 `1e-11` 與 `0` 現可區分)。本套件全套測試執行中之 879,052 次 `judge` 呼叫，新舊版結果全部相同；一般深度(0.001～數百公尺)不受影響。
- **極端數值輸入**(`±Infinity`、超出雙精度範圍之字串如 `'1e400'`、十六進位字串如 `'0x10'`)：`calcDepthStartEndByConnect`、`calcDepthStartEndByGroup`、`groupByDepthStartEnd`、`sepDepthStartEndByDepth` 比較前一律先轉為有限數(超出範圍者取正負最大有限數)，不因 wsemi `judge` 只收有效數字而 throw。與舊版之差異：①`calcDepthStartEndByGroup` 之樣本深度為 `±Infinity` 或超出雙精度範圍時，該樣本現歸入邊界群組之 `rows`(舊版因 `Infinity` 大於群組終點而被略去)；②上列四個函數遇含前後空白之數字字串(如 `' 10 '`)現可處理(舊版於比較處 throw `DecimalError`)。
- **深度大至溢位**：`calcDepthStartEndByGroup` 之兩個相鄰樣本深度皆約 `1e308` 以上、相加溢位為 `Infinity` 時，現 throw `x2 is not a number`(舊版回傳起訖深度含 `Infinity` 之無意義結果)。
- **含量相加溢位**：`calcClassifyUscs` 之 `ctClay` 與 `ctSilt`(或 `ctSand` 與 `ctGravel`)皆約 `9e307` 以上、相加溢位為 `Infinity` 時，現 throw `x1 is not a number`(舊版回 `err` 為 `rFineContent[Infinity] > 100`)；單項為 `Infinity` 者不受影響，實務資料不會到此量級。
