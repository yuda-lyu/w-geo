import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import calcPropInterfaceFrictionAngle from './src/calcPropInterfaceFrictionAngle.mjs'


//Coarse-Residual
let rowsInCoarseResidual = [
    { 'D50': '0.0584', 'phi': '26.07919917' },
    { 'D50': '0.0679', 'phi': '24.64189733' },
    { 'D50': '0.0979', 'phi': '25.37606939' },
    { 'D50': '0.0979', 'phi': '25.92014601' },
    { 'D50': '0.1112', 'phi': '24.22530179' },
    { 'D50': '0.1582', 'phi': '27.18337057' },
    { 'D50': '0.1659', 'phi': '25.09901814' },
    { 'D50': '0.1699', 'phi': '25.30875024' },
    { 'D50': '0.3233', 'phi': '22.14252523' },
    { 'D50': '0.3386', 'phi': '21.78768576' },
    { 'D50': '0.3455', 'phi': '25.24718397' },
    { 'D50': '0.4526', 'phi': '25.11977122' }
]

//Coarse-Peak
let rowsInCoarsePeak = [
    { 'D50': '0.0584', 'phi': '27.226977' },
    { 'D50': '0.0679', 'phi': '24.43409225' },
    { 'D50': '0.0979', 'phi': '26.08770355' },
    { 'D50': '0.0979', 'phi': '26.2397916' },
    { 'D50': '0.1112', 'phi': '27.10323325' },
    { 'D50': '0.1582', 'phi': '27.93884902' },
    { 'D50': '0.1659', 'phi': '26.36378115' },
    { 'D50': '0.1699', 'phi': '26.2073573' },
    { 'D50': '0.3233', 'phi': '22.04839747' },
    { 'D50': '0.3386', 'phi': '22.43565611' },
    { 'D50': '0.3455', 'phi': '25.4066346' },
    { 'D50': '0.4526', 'phi': '22.9093967' }
]

//Fine-Residual
let rowsInFineResidual = [
    { 'PI': '14', 'phi': '21.74263043' },
    { 'PI': '10', 'phi': '23.63207942' },
    { 'PI': '11', 'phi': '19.27513262' },
    { 'PI': '7', 'phi': '24.39639816' },
    { 'PI': '7', 'phi': '25.60423789' }
]

//Fine-Peak
let rowsInFinePeak = [
    { 'PI': '14', 'phi': '19.96391835' },
    { 'PI': '10', 'phi': '21.22184761' },
    { 'PI': '11', 'phi': '17.89882682' },
    { 'PI': '7', 'phi': '22.28105556' },
    { 'PI': '7', 'phi': '24.80982933' }
]


let ms = [
    {
        kind: 'CoarseResidual',
        rowsIn: rowsInCoarseResidual,
        xMeanTarget: 0.223125798,
        opt: {
            keyX: 'D50',
            keyY: 'phi',
        },
    },
    {
        kind: 'CoarsePeak',
        rowsIn: rowsInCoarsePeak,
        xMeanTarget: 0.223125798,
        opt: {
            keyX: 'D50',
            keyY: 'phi',
        },
    },
    {
        kind: 'FineResidual',
        rowsIn: rowsInFineResidual,
        xMeanTarget: 12.80825243,
        opt: {
            keyX: 'PI',
            keyY: 'phi',
        },
    },
    {
        kind: 'FinePeak',
        rowsIn: rowsInFinePeak,
        xMeanTarget: 12.80825243,
        opt: {
            keyX: 'PI',
            keyY: 'phi',
        },
    },
]

await w.pmSeries(ms, async (m, i) => {
    let k = i + 1

    let r = await calcPropInterfaceFrictionAngle(m.rowsIn, m.xMeanTarget, m.opt)
    console.log('r(BE,UE,LE)', r.BE, r.UE, r.LE)

    fs.writeFileSync(`./calcPropInterfaceFrictionAngle-dataIn${k}.json`, JSON.stringify(m, null, 2), 'utf8')
    fs.writeFileSync(`./calcPropInterfaceFrictionAngle-dataOut${k}.json`, JSON.stringify(r, null, 2), 'utf8')

})


//node g_7_a1-calcPropInterfaceFrictionAngle.mjs
