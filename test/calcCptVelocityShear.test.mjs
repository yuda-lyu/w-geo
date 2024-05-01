import assert from 'assert'
import calcCptUnitWeight from '../src/calcCptUnitWeight.mjs'
import calcCptVelocityShear from '../src/calcCptVelocityShear.mjs'
import _rowsIn from './calcCptVelocityShear-rowsIn.json' assert { type: "json" }
import rowsOut1 from './calcCptVelocityShear-rowsOut1.json' assert { type: "json" }
import rowsOut2 from './calcCptVelocityShear-rowsOut2.json' assert { type: "json" }
import rowsOut3 from './calcCptVelocityShear-rowsOut3.json' assert { type: "json" }
import rowsOut4 from './calcCptVelocityShear-rowsOut4.json' assert { type: "json" }
import rowsOut5 from './calcCptVelocityShear-rowsOut5.json' assert { type: "json" }
import rowsOut6 from './calcCptVelocityShear-rowsOut6.json' assert { type: "json" }
import rowsOut7 from './calcCptVelocityShear-rowsOut7.json' assert { type: "json" }
import rowsOut8 from './calcCptVelocityShear-rowsOut8.json' assert { type: "json" }
import rowsOut9 from './calcCptVelocityShear-rowsOut9.json' assert { type: "json" }
import rowsOut10 from './calcCptVelocityShear-rowsOut10.json' assert { type: "json" }
import rowsOut11 from './calcCptVelocityShear-rowsOut11.json' assert { type: "json" }
import rowsOut12 from './calcCptVelocityShear-rowsOut12.json' assert { type: "json" }


describe(`calcCptVelocityShear`, function() {

    //optDef
    let optDef = {
        rsatIni: 19.5,
        coe_a: 0.75,
        unitSvSvp: 'MPa',
    }

    //optUnitWeight
    let optUnitWeight = {
        ...optDef,
        method: 'Lunne(1997) for Robertson stress exponent',
    }

    //calcCptUnitWeight
    let rowsIn = calcCptUnitWeight(_rowsIn, optUnitWeight)
    // console.log('rowsIn[0](calcCptUnitWeight)',rowsIn[0])

    let opt1 = {
        method: 'Baldi(1989) for sand',
        ...optDef,
    }
    it(`should return rowsOut1 when calcCptVelocityShear(rowsIn, ${JSON.stringify(opt1)})`, function() {
        let r = calcCptVelocityShear(rowsIn, opt1)
        let rr = rowsOut1
        assert.strict.deepStrictEqual(r, rr)
    })

    let opt2 = {
        method: 'Hegazy and Mayne(1995) by svp for sand',
        ...optDef,
    }
    it(`should return rowsOut2 when calcCptVelocityShear(rowsIn, ${JSON.stringify(opt2)})`, function() {
        let r = calcCptVelocityShear(rowsIn, opt2)
        let rr = rowsOut2
        assert.strict.deepStrictEqual(r, rr)
    })

    let opt3 = {
        method: 'Hegazy and Mayne(1995) by fs for sand',
        ...optDef,
    }
    it(`should return rowsOut3 when calcCptVelocityShear(rowsIn, ${JSON.stringify(opt3)})`, function() {
        let r = calcCptVelocityShear(rowsIn, opt3)
        let rr = rowsOut3
        assert.strict.deepStrictEqual(r, rr)
    })

    let opt4 = {
        method: 'Robertson(2009) for sand',
        ...optDef,
    }
    it(`should return rowsOut4 when calcCptVelocityShear(rowsIn, ${JSON.stringify(opt4)})`, function() {
        let r = calcCptVelocityShear(rowsIn, opt4)
        let rr = rowsOut4
        assert.strict.deepStrictEqual(r, rr)
    })

    let opt5 = {
        method: 'Sinotech(2023) for sand',
        ...optDef,
    }
    it(`should return rowsOut5 when calcCptVelocityShear(rowsIn, ${JSON.stringify(opt5)})`, function() {
        let r = calcCptVelocityShear(rowsIn, opt5)
        let rr = rowsOut5
        assert.strict.deepStrictEqual(r, rr)
    })

    let opt6 = {
        method: 'Hegazy and Mayne(1995) by fs for clay',
        ...optDef,
    }
    it(`should return rowsOut6 when calcCptVelocityShear(rowsIn, ${JSON.stringify(opt6)})`, function() {
        let r = calcCptVelocityShear(rowsIn, opt6)
        let rr = rowsOut6
        assert.strict.deepStrictEqual(r, rr)
    })

    let opt7 = {
        method: 'Mayne & Rix(1995) for clay',
        ...optDef,
    }
    it(`should return rowsOut7 when calcCptVelocityShear(rowsIn, ${JSON.stringify(opt7)})`, function() {
        let r = calcCptVelocityShear(rowsIn, opt7)
        let rr = rowsOut7
        assert.strict.deepStrictEqual(r, rr)
    })

    let opt8 = {
        method: 'Mayne(2006) for clay',
        ...optDef,
    }
    it(`should return rowsOut8 when calcCptVelocityShear(rowsIn, ${JSON.stringify(opt8)})`, function() {
        let r = calcCptVelocityShear(rowsIn, opt8)
        let rr = rowsOut8
        assert.strict.deepStrictEqual(r, rr)
    })

    let opt9 = {
        method: 'Sinotech(2023) for clay',
        ...optDef,
    }
    it(`should return rowsOut9 when calcCptVelocityShear(rowsIn, ${JSON.stringify(opt9)})`, function() {
        let r = calcCptVelocityShear(rowsIn, opt9)
        let rr = rowsOut9
        assert.strict.deepStrictEqual(r, rr)
    })

    let opt10 = {
        method: 'Hegazy and Mayne(1995) for all',
        ...optDef,
    }
    it(`should return rowsOut10 when calcCptVelocityShear(rowsIn, ${JSON.stringify(opt10)})`, function() {
        let r = calcCptVelocityShear(rowsIn, opt10)
        let rr = rowsOut10
        assert.strict.deepStrictEqual(r, rr)
    })

    let opt11 = {
        method: 'Andrus(2007) for Holocene soil',
        ...optDef,
    }
    it(`should return rowsOut11 when calcCptVelocityShear(rowsIn, ${JSON.stringify(opt11)})`, function() {
        let r = calcCptVelocityShear(rowsIn, opt11)
        let rr = rowsOut11
        assert.strict.deepStrictEqual(r, rr)
    })

    let opt12 = {
        method: 'Andrus(2007) for Pleistocene soil',
        ...optDef,
    }
    it(`should return rowsOut12 when calcCptVelocityShear(rowsIn, ${JSON.stringify(opt12)})`, function() {
        let r = calcCptVelocityShear(rowsIn, opt12)
        let rr = rowsOut12
        assert.strict.deepStrictEqual(r, rr)
    })

})
