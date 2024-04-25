import assert from 'assert'
import calcPropInterfaceFrictionAngle from '../src/calcPropInterfaceFrictionAngle.mjs'
import dataIn1 from './calcPropInterfaceFrictionAngle-dataIn1.json' assert { type: "json" }
import dataIn2 from './calcPropInterfaceFrictionAngle-dataIn2.json' assert { type: "json" }
import dataIn3 from './calcPropInterfaceFrictionAngle-dataIn3.json' assert { type: "json" }
import dataIn4 from './calcPropInterfaceFrictionAngle-dataIn4.json' assert { type: "json" }
import dataOut1 from './calcPropInterfaceFrictionAngle-dataOut1.json' assert { type: "json" }
import dataOut2 from './calcPropInterfaceFrictionAngle-dataOut2.json' assert { type: "json" }
import dataOut3 from './calcPropInterfaceFrictionAngle-dataOut3.json' assert { type: "json" }
import dataOut4 from './calcPropInterfaceFrictionAngle-dataOut4.json' assert { type: "json" }


describe(`calcPropInterfaceFrictionAngle`, function() {

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
