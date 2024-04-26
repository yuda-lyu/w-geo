import assert from 'assert'
import calcCptUnitWeight from '../src/calcCptUnitWeight.mjs'
import rowsIn from './calcCptUnitWeight-rowsIn.json' assert { type: "json" }
import rowsOut1 from './calcCptUnitWeight-rowsOut1.json' assert { type: "json" }
import rowsOut2 from './calcCptUnitWeight-rowsOut2.json' assert { type: "json" }
import rowsOut3 from './calcCptUnitWeight-rowsOut3.json' assert { type: "json" }
import rowsOut4 from './calcCptUnitWeight-rowsOut4.json' assert { type: "json" }
import rowsOut5 from './calcCptUnitWeight-rowsOut5.json' assert { type: "json" }


describe(`calcCptUnitWeight`, function() {

    //optDef
    let optDef = {
        rsatIni: 19.5,
        coe_a: 0.75,
        unitSvSvp: 'MPa',
    }

    let opt1 = {
        method: 'Robertson(1986)',
        ...optDef,
    }
    it(`should return rowsOut1 when calcCptUnitWeight(rowsIn, ${JSON.stringify(opt1)})`, function() {
        let r = calcCptUnitWeight(rowsIn, opt1)
        let rr = rowsOut1
        assert.strict.deepStrictEqual(r, rr)
    })

    let opt2 = {
        method: 'Lunne(1997)',
        ...optDef,
    }
    it(`should return rowsOut2 when calcCptUnitWeight(rowsIn, ${JSON.stringify(opt2)})`, function() {
        let r = calcCptUnitWeight(rowsIn, opt2)
        let rr = rowsOut2
        assert.strict.deepStrictEqual(r, rr)
    })

    let opt3 = {
        method: 'Lunne(1997) for Robertsion stress exponent',
        ...optDef,
    }
    it(`should return rowsOut3 when calcCptUnitWeight(rowsIn, ${JSON.stringify(opt3)})`, function() {
        let r = calcCptUnitWeight(rowsIn, opt3)
        let rr = rowsOut3
        assert.strict.deepStrictEqual(r, rr)
    })

    let opt4 = {
        method: 'Robertson and Cabal(2010)',
        ...optDef,
    }
    it(`should return rowsOut4 when calcCptUnitWeight(rowsIn, ${JSON.stringify(opt4)})`, function() {
        let r = calcCptUnitWeight(rowsIn, opt4)
        let rr = rowsOut4
        assert.strict.deepStrictEqual(r, rr)
    })

    let opt5 = {
        method: 'Mayne(2014)',
        ...optDef,
    }
    it(`should return rowsOut5 when calcCptUnitWeight(rowsIn, ${JSON.stringify(opt5)})`, function() {
        let r = calcCptUnitWeight(rowsIn, opt5)
        let rr = rowsOut5
        assert.strict.deepStrictEqual(r, rr)
    })

})
