import assert from 'assert'
import calcEstmOcr from '../src/calcEstmOcr.mjs'


describe(`calcEstmOcr`, function() {

    let compressiveStrength = 3.6 //kN/m2
    let svp = 10 //kN/m2

    let r1 = [{
        compressiveStrength,
        svp,
    }]
    let rr1 = [{ compressiveStrength: 3.6, svp: 10, ocr: 1.0336975290504131 }]
    it(`should return ${JSON.stringify(rr1)} when calcEstmOcr(${JSON.stringify(r1)})`, function() {
        let r = calcEstmOcr(r1)
        let rr = rr1
        assert.strict.deepStrictEqual(r, rr)
    })

})
