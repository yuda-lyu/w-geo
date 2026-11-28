//產製unit-liquefactionFrozen.test.mjs之凍結期望值(Gitea #232)
//只可以基準版(1.2.49)之src產製, 不可以改後之程式碼產製: 期望值之意義為「與1.2.49逐字相同」
//用法(於本套件根目錄): node test/tools/liqFrozenMake.mjs <1.2.49之根(含src)> [輸出檔=./test/unit-liquefactionFrozen.json] [每函數掃描種子數=300]
//  1.2.49之根取法: git archive <1.2.49之commit> src | tar -x -C <本套件內之暫存夾>
//選案: 每函數依序掃描種子, 凡帶來新特徵或新結果類別者即選入(critical至多24案, 其餘至多14案; 單案序列化長度逾30萬字元者略過)
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import { runOne } from './liqSer.mjs'
import * as G from './liqGen.mjs'


let defs = {
    critical: { rel: 'src/calcLiquefactionSptForCriticalPga.mjs', gen: G.genCriticalPga, call: (f, a) => f(...a) },
    spt: { rel: 'src/calcLiquefactionSpt.mjs', gen: G.genSpt, call: (f, a) => f(...a) },
    calcSpt: { rel: 'src/calcLiquefaction.mjs', gen: G.genCalcSpt, call: (f, a) => f.calc(...a) },
    calcCpt: { rel: 'src/calcLiquefaction.mjs', gen: G.genCalcCpt, call: (f, a) => f.calc(...a) },
    extractErr: { rel: 'src/calcLiquefactionExtractErr.mjs', gen: G.genExtractErr, call: (f, a) => f(...a) },
    vstress: { rel: 'src/calcVerticalStress.mjs', gen: G.genVerticalStress, call: (f, a) => f(...a) },
}


async function main() {
    let [rootRef, fpOut, nScan] = process.argv.slice(2)
    if (!rootRef) {
        console.log('用法: node test/tools/liqFrozenMake.mjs <1.2.49之根> [輸出檔] [每函數掃描種子數]')
        process.exit(2)
    }
    fpOut = fpOut || './test/unit-liquefactionFrozen.json'
    nScan = Number(nScan || 300)
    let cases = []
    for (let name of Object.keys(defs)) {
        let d = defs[name]
        let f = (await import(pathToFileURL(path.resolve(rootRef, d.rel)).href)).default
        let covered = new Set()
        let n = 0
        let nMax = name === 'critical' ? 24 : 14
        for (let seed = 1; seed <= nScan && n < nMax; seed++) {
            let g = d.gen(seed)
            let r = runOne(f, d.call, g.args)
            if (r.state.length > 300000) {
                continue
            }
            let ks = Object.keys(g.feat).map((k) => 'f:' + k)
            let oc = {
                throw: !!r.err,
                errMethod: r.state.indexOf('func is not a function') >= 0,
                errDepth: r.state.indexOf('不等於第') >= 0 || r.state.indexOf('大於結束深度') >= 0,
                errMw: r.state.indexOf('Mw[') >= 0,
                errUnit: r.state.indexOf('need kPa or MPa') >= 0,
                liq: r.state.indexOf('已液化') >= 0 || r.state.indexOf('具液化潛勢') >= 0,
                stl: r.state.indexOf('具沉陷危害') >= 0,
                logs: r.logs !== '',
                modified: r.modified,
                ok: !r.err,
            }
            for (let k of Object.keys(oc)) {
                if (oc[k]) {
                    ks.push('o:' + k)
                }
            }
            let add = ks.filter((k) => !covered.has(k))
            if (add.length === 0) {
                continue
            }
            for (let k of add) {
                covered.add(k)
            }
            cases.push({ fn: name, seed, covers: ks, state: r.state, err: r.err, logs: r.logs, modified: r.modified })
            n++
        }
        console.log(`${name}: ${n} 案, 涵蓋 ${[...covered].join(' ')}`)
    }
    let out = {
        note: '以w-geo 1.2.49之src(git archive)對test/tools/liqGen.mjs之合成輸入計算所得; 由test/tools/liqFrozenMake.mjs產製, 不可以改後之程式碼重產',
        node: process.version,
        cases,
    }
    fs.writeFileSync(fpOut, JSON.stringify(out, null, 1), 'utf8')
    console.log(`寫出 ${path.resolve(fpOut)} 共 ${cases.length} 案, ${fs.statSync(fpOut).size} bytes`)
}
main()
