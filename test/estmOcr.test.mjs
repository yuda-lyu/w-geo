import assert from 'assert'
import estmOcr from '../src/estmOcr.mjs'


describe(`estmOcr`, function() {

    let compressiveStrength = 3.6 //kN/m2
    let svp = 10 //kN/m2

    let rr1 = { compressiveStrength: 3.6, svp: 10, ocr: 1.0336975290504131 }
    it(`should return ${JSON.stringify(rr1)} when estmOcr( ${compressiveStrength}, ${svp} )`, function() {
        let r = estmOcr(compressiveStrength, svp)
        let rr = rr1
        assert.strict.deepStrictEqual(r, rr)
    })

})
