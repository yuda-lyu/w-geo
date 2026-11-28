//液化分析新舊對拍工具(Gitea #232): 以同一種子各自重建合成輸入, 分別交舊版與新版之公開函數計算, 比對
//  ①「呼叫後之輸入 + 輸出」之型別化序列化(鍵次序、-0/NaN/Infinity/undefined、原型、物件同一性與別名)
//  ②拋錯之名稱與訊息 ③console輸出(Error取名稱與訊息) ④輸入是否被修改
//用法(於本套件根目錄): node test/tools/liqDuel.mjs <舊版根> <新版根> <函數清單,逗號分隔> <每函數組數> [起始種子=1]
//  舊版根取法: git archive <基準commit> src | tar -x -C <暫存夾>(暫存夾須在本套件內, 以解析node_modules); 新版根通常為 .
//  函數: critical(calcLiquefactionSptForCriticalPga)、criticalNormal(同上, 只取前段可成功者, 半數為100個PGA)、spt(calcLiquefactionSpt)、calcSpt與calcCpt(calcLiquefaction.calc之SPT與CPT)、extractErr(calcLiquefactionExtractErr)、vstress(calcVerticalStress)
//最後一行: DUEL PASS 或 DUEL FAIL(離開碼 0 / 1)
import path from 'path'
import { pathToFileURL } from 'url'
import { runOne, firstDiff } from './liqSer.mjs'
import * as G from './liqGen.mjs'


let defs = {
    critical: { rel: 'src/calcLiquefactionSptForCriticalPga.mjs', gen: G.genCriticalPga, call: (f, a) => f(...a) },
    criticalNormal: { rel: 'src/calcLiquefactionSptForCriticalPga.mjs', gen: G.genCriticalPgaNormal, call: (f, a) => f(...a) },
    spt: { rel: 'src/calcLiquefactionSpt.mjs', gen: G.genSpt, call: (f, a) => f(...a) },
    calcSpt: { rel: 'src/calcLiquefaction.mjs', gen: G.genCalcSpt, call: (f, a) => f.calc(...a) },
    calcCpt: { rel: 'src/calcLiquefaction.mjs', gen: G.genCalcCpt, call: (f, a) => f.calc(...a) },
    extractErr: { rel: 'src/calcLiquefactionExtractErr.mjs', gen: G.genExtractErr, call: (f, a) => f(...a) },
    vstress: { rel: 'src/calcVerticalStress.mjs', gen: G.genVerticalStress, call: (f, a) => f(...a) },
}


async function main() {
    let [rootOld, rootNew, fnList, nPer, seed0] = process.argv.slice(2)
    if (!rootOld || !rootNew || !fnList) {
        console.log('用法: node test/tools/liqDuel.mjs <舊版根> <新版根> <函數清單> <每函數組數> [起始種子]')
        process.exit(2)
    }
    nPer = Number(nPer || 10)
    seed0 = Number(seed0 || 1)
    let imp = async (root, rel) => {
        return (await import(pathToFileURL(path.resolve(root, rel)).href)).default
    }
    let allOk = true
    for (let name of fnList.split(',')) {
        let d = defs[name]
        if (!d) {
            console.log(`unknown fn ${name}`)
            process.exit(2)
        }
        let fOld = await imp(rootOld, d.rel)
        let fNew = await imp(rootNew, d.rel)
        let s = { n: 0, same: 0, diff: 0, threw: 0, modOld: 0, modNew: 0, logLines: 0, msOld: 0, msNew: 0, feat: {}, outcome: {}, firstDiffs: [] }
        for (let i = 0; i < nPer; i++) {
            let seed = seed0 + i
            let g1 = d.gen(seed)
            let g2 = d.gen(seed)
            let ro = runOne(fOld, d.call, g1.args)
            let rn = runOne(fNew, d.call, g2.args)
            s.n++
            s.msOld += ro.ms
            s.msNew += rn.ms
            let ok = ro.state === rn.state && ro.err === rn.err && ro.logs === rn.logs && ro.modified === rn.modified
            if (ok) {
                s.same++
            }
            else {
                s.diff++
                if (s.firstDiffs.length < 3) {
                    let why = ro.state !== rn.state ? 'state ' + firstDiff(ro.state, rn.state) : ro.err !== rn.err ? `err old[${ro.err}] new[${rn.err}]` : ro.logs !== rn.logs ? 'logs ' + firstDiff(ro.logs, rn.logs) : 'modified'
                    s.firstDiffs.push({ seed, why })
                }
            }
            if (ro.err) {
                s.threw++
            }
            if (ro.modified) {
                s.modOld++
            }
            if (rn.modified) {
                s.modNew++
            }
            if (ro.logs) {
                s.logLines += ro.logs.split('\n').length
            }
            for (let k of Object.keys(g1.feat)) {
                s.feat[k] = (s.feat[k] || 0) + 1
            }
            //結果類別(以舊版結果判讀, 供確認對拍涵蓋之分支)
            let oc = {
                throw: !!ro.err,
                errMethod: ro.state.indexOf('func is not a function') >= 0,
                errDepth: ro.state.indexOf('不等於第') >= 0 || ro.state.indexOf('大於結束深度') >= 0,
                errMw: ro.state.indexOf('Mw[') >= 0,
                errUnit: ro.state.indexOf('need kPa or MPa') >= 0,
                liq: ro.state.indexOf('已液化') >= 0 || ro.state.indexOf('具液化潛勢') >= 0,
                stl: ro.state.indexOf('具沉陷危害') >= 0,
                logs: ro.logs !== '',
            }
            for (let k of Object.keys(oc)) {
                if (oc[k]) {
                    s.outcome[k] = (s.outcome[k] || 0) + 1
                }
            }
        }
        if (s.diff > 0) {
            allOk = false
        }
        console.log(`${name}: n=${s.n} same=${s.same} diff=${s.diff} threw=${s.threw} inputModified old/new=${s.modOld}/${s.modNew} logLines=${s.logLines} ms old/new=${Math.round(s.msOld)}/${Math.round(s.msNew)}`)
        console.log(`  feat ${JSON.stringify(s.feat)}`)
        console.log(`  outcome ${JSON.stringify(s.outcome)}`)
        for (let fd of s.firstDiffs) {
            console.log(`  DIFF seed=${fd.seed} ${fd.why}`)
        }
    }
    console.log(allOk ? 'DUEL PASS' : 'DUEL FAIL')
    process.exit(allOk ? 0 : 1)
}
main()
