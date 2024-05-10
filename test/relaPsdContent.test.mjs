import assert from 'assert'
import relaPsdContent from '../src/relaPsdContent.mjs'


describe(`relaPsdContent`, function() {

    let ctGravel = 15 //%
    let ctSand = 30 //%
    let ctSilt = 45 //%
    let ctClay = 10 //%

    // r = relaPsdContent(ctGravel, ctSand, ctSilt, ctClay)
    // console.log(r)
    let dt = {
        ctGravel: 15,
        ctSand: 30,
        ctSilt: 45,
        ctClay: 10,
        ctCoarse: 45,
        ctFine: 55
    }

    it(`should return ${JSON.stringify(dt)} when relaPsdContent(${ctGravel}, ${ctSand}, ${ctSilt}, ${ctClay})`, function() {
        let r = relaPsdContent(ctGravel, ctSand, ctSilt, ctClay)
        let rr = dt
        assert.strict.deepStrictEqual(r, rr)
    })

})
