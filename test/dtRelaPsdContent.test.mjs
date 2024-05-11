import assert from 'assert'
import dtRelaPsdContent from '../src/dtRelaPsdContent.mjs'


describe(`dtRelaPsdContent`, function() {

    let ctGravel = 15 //%
    let ctSand = 30 //%
    let ctSilt = 45 //%
    let ctClay = 10 //%

    let r1 = {
        ctGravel,
        ctSand,
        ctSilt,
        ctClay,
    }
    let rr1 = {
        ctGravel: 15,
        ctSand: 30,
        ctSilt: 45,
        ctClay: 10,
        ctCoarse: 45,
        ctFine: 55
    }
    it(`should return ${JSON.stringify(rr1)} when dtRelaPsdContent(${JSON.stringify(r1)})`, function() {
        let r = dtRelaPsdContent(r1)
        let rr = rr1
        assert.strict.deepStrictEqual(r, rr)
    })

})
