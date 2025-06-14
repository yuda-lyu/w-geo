import fs from 'fs'
import assert from 'assert'
import calcCptUnitWeight from '../src/calcCptUnitWeight.mjs'
import calcCptVelocityShear from '../src/calcCptVelocityShear.mjs'


describe(`calcCptVelocityShear`, function() {

    let j
    j = fs.readFileSync('./test/calcCptVelocityShear-rowsIn.json', 'utf8')
    let _rowsIn = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptVelocityShear-rowsOut1.json', 'utf8')
    let rowsOut1 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptVelocityShear-rowsOut2.json', 'utf8')
    let rowsOut2 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptVelocityShear-rowsOut3.json', 'utf8')
    let rowsOut3 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptVelocityShear-rowsOut4.json', 'utf8')
    let rowsOut4 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptVelocityShear-rowsOut5.json', 'utf8')
    let rowsOut5 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptVelocityShear-rowsOut6.json', 'utf8')
    let rowsOut6 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptVelocityShear-rowsOut7.json', 'utf8')
    let rowsOut7 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptVelocityShear-rowsOut8.json', 'utf8')
    let rowsOut8 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptVelocityShear-rowsOut9.json', 'utf8')
    let rowsOut9 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptVelocityShear-rowsOut10.json', 'utf8')
    let rowsOut10 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptVelocityShear-rowsOut11.json', 'utf8')
    let rowsOut11 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptVelocityShear-rowsOut12.json', 'utf8')
    let rowsOut12 = JSON.parse(j)

    //optDef
    let optDef = {
        rsatIni: 19.5,
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
