//液化分析對拍與凍結期望值共用之序列化與單次執行(Gitea #232)
import util from 'util'


//ser, 型別化序列化: 依鍵次序輸出, 區分-0、NaN、Infinity、undefined、陣列空位與原型, 並記物件同一性(首見記@id, 再見記#id), 故可比對「輸出是否與輸入共用物件」與別名結構
function ser(root) {
    let ids = new Map()
    let walk = (v) => {
        if (v === undefined) {
            return 'u'
        }
        if (v === null) {
            return 'n'
        }
        let t = typeof v
        if (t === 'number') {
            return Object.is(v, -0) ? 'N-0' : 'N' + String(v)
        }
        if (t === 'string') {
            return 'S' + JSON.stringify(v)
        }
        if (t === 'boolean') {
            return v ? 'T' : 'F'
        }
        if (t === 'bigint' || t === 'symbol') {
            return t + String(v)
        }
        if (t === 'function') {
            return 'fn'
        }
        if (ids.has(v)) {
            return '#' + ids.get(v)
        }
        let id = ids.size
        ids.set(v, id)
        let proto = Object.getPrototypeOf(v)
        let pn = proto === null ? 'null' : proto === Object.prototype ? 'O' : proto === Array.prototype ? 'A' : ((proto.constructor && proto.constructor.name) || '?')
        let sy = Object.getOwnPropertySymbols(v).length
        if (Array.isArray(v)) {
            let parts = []
            for (let i = 0; i < v.length; i++) {
                parts.push(i in v ? walk(v[i]) : 'hole')
            }
            let extra = Object.keys(v).filter((k) => !/^\d+$/.test(k))
            return `@${id}${pn}[${parts.join(',')}]${extra.map((k) => '+' + JSON.stringify(k) + ':' + walk(v[k])).join('')}${sy ? 'sym' + sy : ''}`
        }
        let ks = Object.keys(v)
        return `@${id}${pn}{${ks.map((k) => JSON.stringify(k) + ':' + walk(v[k])).join(',')}}${sy ? 'sym' + sy : ''}`
    }
    return walk(root)
}


//fmtLog, console輸出之比對形式: Error只取名稱與訊息(堆疊含檔案路徑, 不比)
function fmtLog(x) {
    if (x instanceof Error) {
        return `Err(${x.name}:${x.message})`
    }
    return util.inspect(x, { depth: 8, breakLength: Infinity })
}


//runOne, 執行一次並回傳 { state: ser({ args, out }), err, logs, modified, ms }; 執行期間攔截console之輸出(結束即還原)
function runOne(fn, call, args) {
    let before = ser(args)
    let logs = []
    let keep = { log: console.log, warn: console.warn, error: console.error, info: console.info }
    for (let k of Object.keys(keep)) {
        console[k] = (...a) => {
            logs.push(k + ':' + a.map(fmtLog).join(' '))
        }
    }
    let out
    let err = null
    let t = performance.now()
    try {
        out = call(fn, args)
    }
    catch (e) {
        err = `${e && e.name}:${e && e.message}`
    }
    finally {
        for (let k of Object.keys(keep)) {
            console[k] = keep[k]
        }
    }
    let ms = performance.now() - t
    let state = ser({ args, out })
    let after = ser(args)
    return { state, err, logs: logs.join('\n'), modified: before !== after, ms }
}


//firstDiff, 兩字串第一個不同之位置與前後片段
function firstDiff(a, b) {
    let p = 0
    while (p < a.length && a[p] === b[p]) {
        p++
    }
    return `@${p}: a[${a.slice(Math.max(0, p - 80), p + 80)}] b[${b.slice(Math.max(0, p - 80), p + 80)}]`
}


export { ser, fmtLog, runOne, firstDiff }
