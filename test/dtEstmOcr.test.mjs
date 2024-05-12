import assert from 'assert'
import dtEstmOcr from '../src/dtEstmOcr.mjs'


describe(`dtEstmOcr`, function() {

    let compressiveStrength = 3.6 //kN/m2
    let svp = 10 //kN/m2

    let r1 = {
        compressiveStrength,
        svp,
    }
    let rr1 = { compressiveStrength: 3.6, svp: 10, ocr: 1.0336975290504131 }
    it(`should return ${JSON.stringify(rr1)} when dtEstmOcr(${JSON.stringify(r1)})`, function() {
        let r = dtEstmOcr(r1)
        let rr = rr1
        assert.strict.deepStrictEqual(r, rr)
    })

})
