import fs from 'fs'
import assert from 'assert'
import calcPropInterfaceFrictionAngle from '../src/calcPropInterfaceFrictionAngle.mjs'


describe(`calcPropInterfaceFrictionAngle`, function() {

    let j
    j = fs.readFileSync('./test/calcPropInterfaceFrictionAngle-dataIn1.json', 'utf8')
    let dataIn1 = JSON.parse(j)
    j = fs.readFileSync('./test/calcPropInterfaceFrictionAngle-dataIn2.json', 'utf8')
    let dataIn2 = JSON.parse(j)
    j = fs.readFileSync('./test/calcPropInterfaceFrictionAngle-dataIn3.json', 'utf8')
    let dataIn3 = JSON.parse(j)
    j = fs.readFileSync('./test/calcPropInterfaceFrictionAngle-dataIn4.json', 'utf8')
    let dataIn4 = JSON.parse(j)
    j = fs.readFileSync('./test/calcPropInterfaceFrictionAngle-dataOut1.json', 'utf8')
    let dataOut1 = JSON.parse(j)
    j = fs.readFileSync('./test/calcPropInterfaceFrictionAngle-dataOut2.json', 'utf8')
    let dataOut2 = JSON.parse(j)
    j = fs.readFileSync('./test/calcPropInterfaceFrictionAngle-dataOut3.json', 'utf8')
    let dataOut3 = JSON.parse(j)
    j = fs.readFileSync('./test/calcPropInterfaceFrictionAngle-dataOut4.json', 'utf8')
    let dataOut4 = JSON.parse(j)

    it(`should return dataOut1 when calcPropInterfaceFrictionAngle(dataIn1.rowsIn, dataIn1.xMeanTarget, dataIn1.opt)`, async function() {
        let r = await calcPropInterfaceFrictionAngle(dataIn1.rowsIn, dataIn1.xMeanTarget, dataIn1.opt)
        let rr = dataOut1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return dataOut2 when calcPropInterfaceFrictionAngle(dataIn2.rowsIn, dataIn2.xMeanTarget, dataIn2.opt)`, async function() {
        let r = await calcPropInterfaceFrictionAngle(dataIn2.rowsIn, dataIn2.xMeanTarget, dataIn2.opt)
        let rr = dataOut2
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return dataOut3 when calcPropInterfaceFrictionAngle(dataIn3.rowsIn, dataIn3.xMeanTarget, dataIn3.opt)`, async function() {
        let r = await calcPropInterfaceFrictionAngle(dataIn3.rowsIn, dataIn3.xMeanTarget, dataIn3.opt)
        let rr = dataOut3
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return dataOut4 when calcPropInterfaceFrictionAngle(dataIn4.rowsIn, dataIn4.xMeanTarget, dataIn4.opt)`, async function() {
        let r = await calcPropInterfaceFrictionAngle(dataIn4.rowsIn, dataIn4.xMeanTarget, dataIn4.opt)
        let rr = dataOut4
        assert.strict.deepStrictEqual(r, rr)
    })

})
