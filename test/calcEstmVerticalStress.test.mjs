import assert from 'assert'
import calcEstmVerticalStress from '../src/calcEstmVerticalStress.mjs'


describe(`calcEstmVerticalStress`, function() {

    let ltdtIn1 = [
        {
            depth: 1,
            rd: 17.5,
            rsat: 18.5,
        },
        {
            depth: 3,
            rd: 18.0,
            rsat: 19.0,
        },
    ]
    let ltdtOut1 = [
        { depth: 1, rd: 17.5, rsat: 18.5, sv: 17.34375, svp: 8.146875 },
        { depth: 3, rd: 18, rsat: 19, sv: 56.046875, svp: 26.616875 }
    ]
    it(`should return ${JSON.stringify(ltdtOut1)} when calcEstmVerticalStress(${JSON.stringify(ltdtIn1)})`, function() {
        let r = calcEstmVerticalStress(ltdtIn1)
        let rr = ltdtOut1
        assert.strict.deepStrictEqual(r, rr)
    })

    let ltdtIn2 = [
        {
            depth: 1,
            rd: 17.5,
            rsat: 18.5,
        },
        {
            depth: 2,
        },
        {
            depth: 3,
            rd: 18.0,
            rsat: 19.0,
        },
    ]
    let ltdtOut2 = [
        { depth: 1, rd: 17.5, rsat: 18.5, sv: 17.34375, svp: 8.146875 },
        { depth: 2, rd: 17.75, rsat: 18.75, sv: 37.234375, svp: 17.614375 },
        { depth: 3, rd: 18, rsat: 19, sv: 56.046875, svp: 26.616875 }
    ]
    it(`should return ${JSON.stringify(ltdtOut2)} when calcEstmVerticalStress(${JSON.stringify(ltdtIn2)})`, function() {
        let r = calcEstmVerticalStress(ltdtIn2)
        let rr = ltdtOut2
        assert.strict.deepStrictEqual(r, rr)
    })

})
