import fs from 'fs'
import assert from 'assert'
import calcLiquefactionSptForCriticalPga from '../src/calcLiquefactionSptForCriticalPga.mjs'
import calcLiquefactionSpt from '../src/calcLiquefactionSpt.mjs'
import calcLiquefaction from '../src/calcLiquefaction.mjs'
import calcLiquefactionExtractErr from '../src/calcLiquefactionExtractErr.mjs'
import calcVerticalStress from '../src/calcVerticalStress.mjs'
import { runOne, firstDiff } from './tools/liqSer.mjs'
import * as G from './tools/liqGen.mjs'


//規格(Gitea #232, 加速calcLiquefactionSptForCriticalPga之內部複製與共用計算):
//  S1 同一輸入, 各公開函數之輸出與1.2.49逐字相同(鍵次序、浮點值、訊息字串), 拋錯之名稱與訊息、console輸出亦同
//  S2 公開函數不修改呼叫端之輸入; 唯calcLiquefactionSptForCriticalPga於1.2.49即會就地補齊各層之FC、rd、rsat、N60、soilClassification且回傳之ltdt即呼叫端之層物件, 此行為不變(與1.2.49之呼叫後狀態逐字相同)
//期望值: test/unit-liquefactionFrozen.json, 以1.2.49之src對test/tools/liqGen.mjs之合成輸入(固定種子)計算後凍結(test/tools/liqFrozenMake.mjs), 非以改後之程式碼產製
//比對: 序列化「呼叫後之輸入 + 輸出」(test/tools/liqSer.mjs之ser), 含物件同一性, 故輸出與輸入是否共用物件亦在比對內
//注意: 浮點冪運算(**)之末位依JS引擎而定, 凍結值所用之Node版本記於JSON之node欄; 換引擎後若僅末位不同, 以1.2.49之src於新引擎重產(勿以改後之程式碼重產)


let defs = {
    critical: { f: calcLiquefactionSptForCriticalPga, gen: G.genCriticalPga, call: (f, a) => f(...a) },
    spt: { f: calcLiquefactionSpt, gen: G.genSpt, call: (f, a) => f(...a) },
    calcSpt: { f: calcLiquefaction, gen: G.genCalcSpt, call: (f, a) => f.calc(...a) },
    calcCpt: { f: calcLiquefaction, gen: G.genCalcCpt, call: (f, a) => f.calc(...a) },
    extractErr: { f: calcLiquefactionExtractErr, gen: G.genExtractErr, call: (f, a) => f(...a) },
    vstress: { f: calcVerticalStress, gen: G.genVerticalStress, call: (f, a) => f(...a) },
}


describe(`液化分析之結果與1.2.49凍結值逐字相同`, function() {

    let fz = JSON.parse(fs.readFileSync('./test/unit-liquefactionFrozen.json', 'utf8'))

    it(`凍結值涵蓋各函數(每函數至少1案)`, function() {
        for (let k of Object.keys(defs)) {
            assert.ok(fz.cases.some((c) => c.fn === k), `凍結值缺函數 ${k}`)
        }
    })

    for (let c of fz.cases) {
        let d = defs[c.fn]
        it(`${c.fn} seed=${c.seed} [${c.covers.join(' ')}]`, function() {
            let g = d.gen(c.seed)
            let r = runOne(d.f, d.call, g.args)

            //S1: 輸出(與呼叫後之輸入)逐字相同
            assert.ok(r.state === c.state, `輸出或呼叫後之輸入與1.2.49不同 ${r.state === c.state ? '' : firstDiff(c.state, r.state)}`)

            //S1: 拋錯之名稱與訊息相同
            assert.ok(r.err === c.err, `拋錯與1.2.49不同: 1.2.49[${c.err}] 現[${r.err}]`)

            //S1: console輸出相同
            assert.ok(r.logs === c.logs, `console輸出與1.2.49不同 ${r.logs === c.logs ? '' : firstDiff(c.logs, r.logs)}`)

            //S2: 輸入是否被修改與1.2.49相同, 且除calcLiquefactionSptForCriticalPga外皆不修改輸入
            assert.ok(r.modified === c.modified, `輸入是否被修改與1.2.49不同: 1.2.49[${c.modified}] 現[${r.modified}]`)
            if (c.fn !== 'critical') {
                assert.ok(r.modified === false, `${c.fn} 修改了呼叫端之輸入`)
            }
        })
    }

})
