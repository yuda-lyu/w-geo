import fs from 'fs'
import assert from 'assert'
import calcCptUnitWeight from '../src/calcCptUnitWeight.mjs'


describe(`calcCptUnitWeight`, function() {

    let j
    j = fs.readFileSync('./test/calcCptUnitWeight-rowsIn.json', 'utf8')
    let rowsIn = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptUnitWeight-rowsOut1.json', 'utf8')
    let rowsOut1 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptUnitWeight-rowsOut2.json', 'utf8')
    let rowsOut2 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptUnitWeight-rowsOut3.json', 'utf8')
    let rowsOut3 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptUnitWeight-rowsOut4.json', 'utf8')
    let rowsOut4 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptUnitWeight-rowsOut5.json', 'utf8')
    let rowsOut5 = JSON.parse(j)

    //optDef
    let optDef = {
        rsatIni: 19.5,
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
        method: 'Lunne(1997) for Robertson stress exponent',
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
