//液化分析之固定種子合成輸入產生器(Gitea #232; 對拍工具liqDuel.mjs與測試unit-liquefactionFrozen.test.mjs共用)
//同一(函數, seed)每次產出之結構與值皆相同(含同一物件重複出現之別名); 全為合成資料, 不含任何實際鑽孔數據
//注意: unit-liquefactionFrozen.test.mjs之凍結期望值以本檔之產出為輸入, 改動本檔任何產生邏輯即須以1.2.49之src重產期望值(liqFrozenMake.mjs), 不可以改後之程式碼產製

//mulberry32
export function rngOf(seed) {
    let a = (seed >>> 0) || 1
    let next = () => {
        a = (a + 0x6D2B79F5) >>> 0
        let t = a
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
    let r = {
        f: next,
        int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
        pick: (arr) => arr[Math.floor(next() * arr.length)],
        p: (prob) => next() < prob,
        num: (lo, hi, d = 3) => Number((lo + next() * (hi - lo)).toFixed(d)),
    }
    return r
}

let USCS = ['SM', 'SP', 'ML', 'CL', 'SC', 'GP', 'GW', 'SW', 'MH', 'CH', 'OL', 'SP-SM', 'SM-ML', 'CL-ML', '']
let SPT_METHODS = ['sptSeed', 'sptHBF2012', 'sptHBF2017', 'sptNCEER', 'sptNJRA1996', 'sptNJRA2017', 'sptTY']
let CPT_METHODS = ['cptHBF2012', 'cptHBF2017', 'cptHBF2021', 'cptNCEER1997', 'cptRobertson2009', 'cptJuang2002', 'cptKuAndJuang2012', 'cptOlsen1997', 'cptShibata1988']

//asStr, 部分數值以數字字串給(實務資料常見)
function asMaybeStr(r, v) {
    if (r.p(0.25)) {
        return String(v)
    }
    return v
}

//genDepths, 回傳各層起訖深度; feat記錄特徵
function genDepths(r, n, feat) {
    let ds = 0
    if (r.p(0.12)) {
        ds = r.num(0.2, 2.5, 2) //首層不從0開始
        feat.startBelow0 = true
    }
    let arr = []
    for (let i = 0; i < n; i++) {
        let th = r.num(0.3, 3.2, 2)
        let de = Number((ds + th).toFixed(4))
        if (r.p(0.03)) {
            //零厚度或近零厚度層(相對1e-13, 深度檢查之12位有效數字判為連續)
            de = r.p(0.5) ? ds : ds + ds * 1e-13
            feat.zeroThick = true
        }
        arr.push([ds, de])
        ds = de
    }
    //間隙(起訖不連續, 觸發checkDepthStartEnd錯誤)
    if (n >= 2 && r.p(0.05)) {
        let i = r.int(1, n - 1)
        arr[i][0] = Number((arr[i][0] + 0.37).toFixed(4))
        feat.gap = true
    }
    return arr
}

//genSptRow
function genSptRow(r, i, ds, de, feat) {
    let v = {}
    if (r.p(0.6)) {
        v.sampleId = `S-${i + 1}`
    }
    v.depthStart = asMaybeStr(r, ds)
    v.depthEnd = asMaybeStr(r, de)
    //N
    let N = r.pick([0, 1, 2, r.int(3, 30), r.int(3, 30), r.int(3, 30), r.int(31, 60), r.int(61, 100)])
    let kN = r.pick(['SPTN', 'SPTN', 'N60'])
    if (r.p(0.04)) {
        v[kN] = r.pick(['', 'abc', null])
        feat.badN = true
    }
    else {
        v[kN] = asMaybeStr(r, N)
    }
    //FC
    let FC = r.pick([0, 0, r.num(1, 15, 1), r.num(15, 35, 1), r.num(35, 90, 1), 100])
    if (FC === 0) {
        feat.fc0 = true
    }
    if (FC >= 90) {
        feat.fcHigh = true
    }
    let modeFC = r.int(0, 3)
    if (modeFC === 0) {
        v.FC = asMaybeStr(r, FC)
    }
    else if (modeFC === 1) {
        v.ctFine = asMaybeStr(r, FC)
    }
    else if (modeFC === 2) {
        let a = Number((FC * r.num(0.2, 0.8, 2)).toFixed(2))
        v.ctSilt = a
        v.ctClay = Number((FC - a).toFixed(2))
    }
    else {
        feat.noFC = true //無細料含量
    }
    //單位重
    let rd = r.num(14, 19, 2)
    let rsat = Number((rd + r.num(1, 3.5, 2)).toFixed(2))
    let modeR = r.int(0, 5)
    if (modeR <= 2) {
        v.rd = asMaybeStr(r, rd)
        v.rsat = asMaybeStr(r, rsat)
    }
    else if (modeR === 3) {
        v.Gt_dry = rd
        v.Gt_sat = rsat
    }
    else if (modeR === 4) {
        v.GS = r.num(2.6, 2.75, 2)
        v.e = r.num(0.5, 1.1, 2)
        feat.porous = true
    }
    else {
        v.rsat = rsat //缺乾單位重
        feat.missRd = true
    }
    if (r.p(0.03)) {
        delete v.rsat
        delete v.Gt_sat
        feat.missRsat = true
    }
    //分類
    let c = r.pick(USCS)
    if (r.p(0.5)) {
        v.soilClassification = c
    }
    else {
        v.USCS = c
    }
    if (r.p(0.4)) {
        v.PI = r.pick([0, r.num(1, 30, 1), 'NP'])
    }
    if (r.p(0.3)) {
        v.D50 = r.num(0.01, 2, 3)
        v.D10 = r.num(0.001, 0.2, 3)
    }
    if (r.p(0.15)) {
        v.w = r.num(10, 40, 1)
        v.LL = r.num(20, 60, 1)
    }
    //其他欄位
    if (r.p(0.05)) {
        v.meta = { src: `m${i}`, tags: [i, i + 1] } //巢狀值
        feat.nested = true
    }
    if (r.p(0.03)) {
        v.PGA = r.num(0.1, 0.6, 2) //輸入已含PGA鍵
        feat.prePGA = true
    }
    if (r.p(0.03)) {
        v.sv = r.num(10, 200, 2)
        v.svp = r.num(10, 200, 2)
        feat.preSv = true
    }
    if (r.p(0.03)) {
        v.err = `既有訊息${i}`
        feat.preErr = true
    }
    if (r.p(0.03)) {
        v['sptExtra-x'] = 1 //以spt開頭而非方法之鍵
        feat.sptKey = true
    }
    if (r.p(0.03)) {
        v['sptNJRA2017-errNote'] = `備註${i}` //以方法名開頭且'-err'不在末尾之鍵
        feat.methodKey = true
    }
    if (r.p(0.02)) {
        v.depth = r.num(0, 30, 2)
    }
    return v
}

//forceAlias, 於第i層之後插入同一近零厚度層物件兩次(相對1e-13, 深度檢查判為連續), 使別名列到達液化分析且其累計量(PL、H1、沉陷)之增量非0
function forceAlias(r, rows, feat) {
    if (feat.unsorted || rows.length < 1) {
        return rows
    }
    let i = r.int(0, rows.length - 1)
    let b = rows[i]
    let d = Number(b.depthEnd)
    if (!(d > 0)) {
        return rows
    }
    let z = {}
    for (let k of Object.keys(b)) {
        let v = b[k]
        if (v === null || typeof v !== 'object') {
            z[k] = v
        }
    }
    z.sampleId = `Z-${i + 1}`
    z.depthStart = d
    z.depthEnd = d + d * 1e-13
    rows.splice(i + 1, 0, z, z)
    feat.alias = true
    feat.aliasNear = true
    return rows
}


//genLayersSpt
export function genLayersSpt(r, feat) {
    let n = r.p(0.12) ? 1 : r.int(2, 22)
    if (n === 1) {
        feat.single = true
    }
    let dps = genDepths(r, n, feat)
    let rows = []
    for (let i = 0; i < n; i++) {
        rows.push(genSptRow(r, i, dps[i][0], dps[i][1], feat))
    }
    if (r.p(0.05)) {
        rows[0].vibrationType = r.pick([1, 2, '2'])
        feat.vib = true
    }
    //零厚度層之別名(同一物件重複出現)
    if (feat.zeroThick && r.p(0.5)) {
        let k = rows.findIndex((v) => Math.abs(Number(v.depthEnd) - Number(v.depthStart)) < 1e-9)
        if (k >= 0) {
            rows.splice(k + 1, 0, rows[k])
            feat.alias = true
        }
    }
    //亂序
    if (r.p(0.08)) {
        rows = [rows[rows.length - 1], ...rows.slice(0, rows.length - 1)]
        feat.unsorted = true
    }
    let last = rows[rows.length - 1]
    let deLast = Number(last.depthEnd)
    return { rows, deLast }
}

function genWater(r, deLast, feat) {
    let m = r.int(0, 5)
    if (m === 0) {
        feat.wSurface = true
        return 0
    }
    if (m === 1) {
        feat.wDeep = true
        return Number((deLast + r.num(0.5, 5, 2)).toFixed(2))
    }
    if (m === 2) {
        return asMaybeStr(r, r.num(0, Math.max(deLast, 0.1), 2))
    }
    if (m === 3) {
        return r.num(0, Math.max(deLast, 0.1), 2)
    }
    if (m === 4) {
        return r.pick([-1, '', 'x', undefined])
    }
    return r.num(0.5, 6, 2)
}

function genMethodsSpt(r, feat) {
    let ms = []
    let k = r.pick([1, 1, 1, 2, 3])
    if (r.p(0.4)) {
        ms.push('sptNJRA2017')
    }
    while (ms.length < k) {
        let m = r.pick(SPT_METHODS)
        if (ms.indexOf(m) < 0) {
            ms.push(m)
        }
    }
    if (r.p(0.04)) {
        ms.push('sptBad') //無效方法, 液化分析於liqFS拋錯
        feat.badMethod = true
    }
    return ms
}

//genCriticalPga, calcLiquefactionSptForCriticalPga之輸入
export function genCriticalPga(seed) {
    let r = rngOf(seed * 7919 + 13)
    let feat = {}
    let { rows, deLast } = genLayersSpt(r, feat)
    let methods = genMethodsSpt(r, feat)
    let opt = {}
    let wl = genWater(r, deLast, feat)
    if (wl !== undefined) {
        opt.waterLevelUsual = wl
    }
    if (r.p(0.8)) {
        opt.waterLevelDesign = wl
    }
    else {
        let w2 = genWater(r, deLast, feat)
        if (w2 !== undefined) {
            opt.waterLevelDesign = w2
        }
    }
    opt.unitSvSvp = r.pick(['kPa', 'kPa', 'kPa', 'MPa', undefined, 'xx'])
    if (opt.unitSvSvp === 'MPa') {
        feat.mpa = true
    }
    if (opt.unitSvSvp === 'xx') {
        feat.badUnit = true
    }
    let mw = r.pick([6.8, 6.8, 7.5, '7.1', undefined, 0, -1])
    if (mw === 0 || mw === -1) {
        feat.mwBad = true
    }
    if (mw !== undefined) {
        opt.Mw = mw
    }
    //PGA筆數控制於3~100
    let pm = r.pick([[2, 0.02], [2, 0.02], [2, 0.05], [1, 0.05], [0.6, 0.1], [2, 0.07], [0.5, 0.25], [2, 0.3], [undefined, undefined], ['2', '0.1'], [0, 0.1], [2, 0], [-1, 0.1], [1.5, -0.1]])
    if (pm[0] !== undefined) {
        opt.pgaMax = pm[0]
    }
    if (pm[1] !== undefined) {
        opt.pgaSlice = pm[1]
    }
    let bol = () => r.pick([true, true, false, 'x', undefined])
    for (let k of ['useFS', 'usePL', 'useStl', 'useH1PL']) {
        let b = bol()
        if (b !== undefined) {
            opt[k] = b
        }
    }
    let sl = r.pick([[0.3], [0.1, 0.2, 0.3], [0.05], [], 'x', undefined, [0.2, 0.3]])
    if (sl !== undefined) {
        opt.stlLims = sl
    }
    let kp = r.pick([[], ['sampleId'], ['sampleId', 'depthStart', 'depthEnd'], 'x', undefined, ['notExist']])
    if (kp !== undefined) {
        opt.keysPick = kp
    }
    let rl = r.pick([false, false, false, true, 'x', undefined])
    if (rl === true) {
        feat.retEach = true
        //逐PGA回傳ltdt時縮小PGA筆數以控制對拍時間
        opt.pgaMax = 0.6
        opt.pgaSlice = 0.1
    }
    if (rl !== undefined) {
        opt.returnLtdtForEachPga = rl
    }
    //情境, 使各錯誤路徑及其與逐PGA回傳ltdt之組合皆有足量案例(約半數維持上列之一般情形)
    let sc = r.pick(['none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'retEach', 'badMethod', 'badMethodRet', 'mwBad', 'mwBadRet', 'gap', 'gapRet', 'badUnitRet', 'alias', 'aliasRet'])
    feat['sc_' + sc] = true
    if (sc.indexOf('alias') === 0) {
        forceAlias(r, rows, feat)
    }
    if (sc.indexOf('Ret') >= 0 || sc === 'retEach') {
        opt.returnLtdtForEachPga = true
        opt.pgaMax = 0.6
        opt.pgaSlice = 0.1
        feat.retEach = true
    }
    if (sc.indexOf('badMethod') === 0 && methods.indexOf('sptBad') < 0) {
        methods.push('sptBad')
        feat.badMethod = true
    }
    if (sc.indexOf('mwBad') === 0) {
        opt.Mw = r.pick([0, -1])
        feat.mwBad = true
    }
    if (sc.indexOf('gap') === 0) {
        let v = rows[rows.length - 1]
        v.depthStart = rows.length >= 2 ? Number(v.depthStart) + 0.37 : 'x'
        feat.gap = true
    }
    if (sc === 'badUnitRet') {
        opt.unitSvSvp = 'xx'
        feat.badUnit = true
    }
    //PGA筆數之級距(只記特徵, 不取用亂數)
    let nm = Number(opt.pgaMax)
    let ns = Number(opt.pgaSlice)
    nm = Number.isFinite(nm) && opt.pgaMax !== '' ? nm : 2
    ns = Number.isFinite(ns) && opt.pgaSlice !== '' ? ns : 0.02
    let nPga = Math.floor(nm / ns)
    feat[nPga >= 100 ? 'nPga100' : nPga >= 30 ? 'nPga30' : nPga >= 1 ? 'nPga1' : 'nPga0'] = true
    feat['nMethod' + methods.length] = true
    return { args: [rows, methods, opt], feat }
}

//genCriticalPgaNormal, 只取前段可成功之calcLiquefactionSptForCriticalPga輸入(無Mw<=0、無效單位、深度間隙、無效方法, 且至少2個PGA), 使各PGA共用前段之路徑皆被走到; 未逐PGA回傳ltdt者半數改為實務之100個PGA(pgaMax 2、pgaSlice 0.02)
//依序試genCriticalPga之種子(seed * 4096 + j), 取第一個合格者; 只供對拍, 凍結值不用
export function genCriticalPgaNormal(seed) {
    for (let j = 0; j < 4096; j++) {
        let g = genCriticalPga(seed * 4096 + j)
        let f = g.feat
        if (f.mwBad || f.badUnit || f.gap || f.badMethod || f.nPga0) {
            continue
        }
        let opt = g.args[2]
        if (!f.retEach && seed % 2 === 0) {
            opt.pgaMax = 2
            opt.pgaSlice = 0.02
            f.nPga100 = true
        }
        return g
    }
    throw new Error(`genCriticalPgaNormal: seed ${seed} 找不到合格輸入`)
}


//genSpt, calcLiquefactionSpt之輸入
export function genSpt(seed) {
    let r = rngOf(seed * 104729 + 7)
    let feat = {}
    let { rows, deLast } = genLayersSpt(r, feat)
    if (r.p(0.15)) {
        forceAlias(r, rows, feat)
    }
    let methods = genMethodsSpt(r, feat)
    let opt = {}
    let pga = r.pick([0.2, 0.32, r.num(0.02, 1.5, 2), '0.4', undefined, -0.1, 0])
    if (pga === undefined) {
        feat.noPga = true
    }
    else {
        opt.PGA = pga
    }
    let mw = r.pick([6.8, 7.3, '7', undefined, 0])
    if (mw !== undefined) {
        opt.Mw = mw
    }
    let wl = genWater(r, deLast, feat)
    if (wl !== undefined) {
        opt.waterLevelUsual = wl
    }
    let w2 = r.p(0.7) ? wl : genWater(r, deLast, feat)
    if (w2 !== undefined) {
        opt.waterLevelDesign = w2
    }
    let u = r.pick(['kPa', 'MPa', undefined, 'kPa'])
    if (u !== undefined) {
        opt.unitSvSvp = u
    }
    return { args: [rows, methods, opt], feat }
}

//genCalcSpt, calcLiquefaction.calc('SPT', rows, opt)之輸入(直接呼叫, 可含既有應力)
export function genCalcSpt(seed) {
    let r = rngOf(seed * 15485863 + 3)
    let feat = {}
    let { rows, deLast } = genLayersSpt(r, feat)
    if (r.p(0.15)) {
        forceAlias(r, rows, feat)
    }
    let methods = r.p(0.2) ? undefined : genMethodsSpt(r, feat)
    let opt = {}
    let u = r.pick(['kPa', 'MPa', 'kPa', undefined])
    if (u !== undefined) {
        opt.unitSvSvp = u
    }
    if (methods !== undefined) {
        opt.methods = methods
    }
    let pga = r.num(0.05, 1.2, 2)
    let mw = r.pick([6.8, 7.3])
    if (r.p(0.5)) {
        opt.PGA = pga
        opt.Mw = mw
    }
    else {
        for (let v of rows) {
            v.PGA = pga
            v.Mw = mw
        }
    }
    let wl = genWater(r, deLast, feat)
    if (wl !== undefined) {
        opt.waterLevelUsual = wl
        opt.waterLevelDesign = wl
    }
    //既有應力(hasVerticalStress分支)
    if (r.p(0.35)) {
        feat.hasStress = true
        for (let v of rows) {
            //依中點深度給合理之應力(kPa), 以通過checkVerticalStress
            let s = 18 * (Number(v.depthStart) + Number(v.depthEnd)) / 2
            let k = u === 'MPa' ? 1000 : 1
            v.sv = Number((s / k).toFixed(7))
            if (r.p(0.5)) {
                v.svp = Number((s * 0.6 / k).toFixed(7))
            }
            else {
                v.svpUsual = Number((s * 0.6 / k).toFixed(7))
                v.svpDesign = Number((s * 0.55 / k).toFixed(7))
            }
        }
    }
    return { args: ['SPT', rows, opt], feat }
}

//genCalcCpt, calcLiquefaction.calc('CPT', rows, opt)之輸入
export function genCalcCpt(seed) {
    let r = rngOf(seed * 32452843 + 11)
    let feat = {}
    let n = r.p(0.1) ? 1 : r.int(2, 30)
    let ds = r.p(0.3) ? r.num(0.2, 1, 3) : 0
    let rows = []
    let s = 0
    let unit = r.pick(['kPa', 'kPa', 'MPa'])
    let withStress = r.p(0.6)
    for (let i = 0; i < n; i++) {
        let th = r.pick([0.05, 0.05, 0.1, r.num(0.02, 0.5, 3)])
        let de = Number((ds + th).toFixed(4))
        let v = {}
        v.depthStart = asMaybeStr(r, ds)
        v.depthEnd = asMaybeStr(r, de)
        v.qc = asMaybeStr(r, r.pick([r.num(0.1, 3, 4), r.num(3, 25, 3), 0]))
        v.fs = r.pick([r.num(0.0005, 0.2, 6), 0, -0.001])
        v.u2 = r.pick([r.num(-0.01, 0.3, 6), 0])
        if (withStress) {
            //依中點深度給合理之應力(kPa), 以通過checkVerticalStress
            s = 18 * (ds + de) / 2
            let k = unit === 'MPa' ? 1000 : 1
            v.sv = Number((s / k).toFixed(7))
            v.svp = Number((s * 0.6 / k).toFixed(7))
        }
        else {
            v.rd = r.num(15, 18, 2)
            v.rsat = Number((v.rd + 2).toFixed(2))
        }
        if (r.p(0.5)) {
            v.coe_a = r.pick([0.85, 0.8, 0.75])
        }
        if (r.p(0.05)) {
            v.meta = [i]
            feat.nested = true
        }
        if (r.p(0.2)) {
            v.D50 = r.num(0.05, 1, 3)
        }
        rows.push(v)
        ds = de
    }
    let opt = {
        waterLevelUsual: r.pick([0, 0.7, r.num(0, 3, 2)]),
        PGA: r.num(0.05, 0.8, 3),
        Mw: r.pick([6.8, 7.3, 7.5]),
        unitSvSvp: unit,
    }
    opt.waterLevelDesign = r.p(0.7) ? opt.waterLevelUsual : r.num(0, 3, 2)
    if (r.p(0.6)) {
        let ms = []
        let k = r.int(1, 3)
        while (ms.length < k) {
            let m = r.pick(CPT_METHODS)
            if (ms.indexOf(m) < 0) {
                ms.push(m)
            }
        }
        opt.methods = ms
    }
    if (unit === 'MPa') {
        feat.mpa = true
    }
    //特徵(只記特徵, 不取用亂數)
    feat[withStress ? 'hasStress' : 'noStress'] = true
    feat[opt.methods ? 'methods' + opt.methods.length : 'methodsAll'] = true
    if (n === 1) {
        feat.single = true
    }
    return { args: ['CPT', rows, opt], feat }
}

//genExtractErr, calcLiquefactionExtractErr之輸入
export function genExtractErr(seed) {
    let r = rngOf(seed * 49979687 + 5)
    let feat = {}
    let n = r.pick([0, 1, r.int(2, 8), r.int(2, 30)])
    let kErrs = ['sptNJRA2017-err', 'sptHBF2017-err', 'cptHBF2012-err']
    let rows = []
    let ds = 0
    for (let i = 0; i < n; i++) {
        let de = Number((ds + r.num(0.1, 2, 3)).toFixed(4))
        let v = { depthStart: r.p(0.1) ? 'x' : ds, depthEnd: de }
        if (r.p(0.3)) {
            v.x = r.num(0, 9, 2)
        }
        for (let k of kErrs) {
            if (i === 0 || r.p(0.8)) {
                v[k] = r.pick(['', '', `錯誤${r.int(1, 4)}`, `錯誤${r.int(1, 4)}; 錯誤${r.int(1, 4)}`, 3, 'x'.repeat(r.int(200, 600))])
            }
        }
        if (r.p(0.5)) {
            v.err = r.pick(['', `通用${r.int(1, 3)}`])
        }
        if (r.p(0.05)) {
            v.meta = { a: i }
            feat.nested = true
        }
        rows.push(v)
        ds = de
    }
    if (n >= 2 && r.p(0.1)) {
        rows.push(rows[0]) //別名
        feat.alias = true
    }
    let opt = {}
    let mt = r.pick(['last', 'first', undefined, 'x'])
    if (mt !== undefined) {
        opt.mergeTo = mt
    }
    let rl = r.pick([true, false, undefined, 'x'])
    if (rl !== undefined) {
        opt.returnLastone = rl
    }
    //特徵(只記特徵, 不取用亂數)
    feat['mergeTo_' + String(mt)] = true
    feat['returnLastone_' + String(rl)] = true
    feat[n === 0 ? 'n0' : n === 1 ? 'n1' : 'nMany'] = true
    return { args: [rows, opt], feat }
}

//genVerticalStress, calcVerticalStress之輸入
export function genVerticalStress(seed) {
    let r = rngOf(seed * 86028121 + 17)
    let feat = {}
    let { rows, deLast } = genLayersSpt(r, feat)
    let opt = {
        unitSvSvp: r.pick(['kPa', 'MPa', 'kPa']),
    }
    let wl = genWater(r, deLast, feat)
    if (wl !== undefined) {
        opt.waterLevelUsual = wl
    }
    let w2 = genWater(r, deLast, feat)
    if (w2 !== undefined) {
        opt.waterLevelDesign = w2
    }
    return { args: [rows, opt], feat }
}
