import assert from 'assert'
import _ from 'lodash-es'
import w from 'wsemi'
import intrpPsdBySize from '../src/intrpPsdBySize.mjs'


describe(`intrpPsdBySize`, function() {

    let psd = [101.6, 76.2, 50.8, 25.4, 19.0, 9.5, 4.75, 2.0, 0.85, 0.425, 0.25, 0.15, 0.106, 0.075, 0.027, 0.018, 0.011, 0.008, 0.006, 0.003, 0.001, 0.0, 0.0, 0.0]
    let psf = [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, -1.0, 100.0, 99.0, 96.0, 86.0, 74.0, 61.0, 51.0, 32.0, 16.0, 0.0, 0.0, 0.0]
    let pfss = _.map(psd, (_v, k) => {
        let s = _.get(psd, k)
        let f = _.get(psf, k)
        return {
            size: s,
            fraction: f,
        }
    })

    let psizes1 = 0.063
    let rr1 = 98.4880247416152
    it(`should return ${JSON.stringify(rr1)} when intrpPsdBySize(${JSON.stringify(pfss)}, ${JSON.stringify(psizes1)})`, function() {
        let r = intrpPsdBySize(pfss, psizes1)
        let rr = rr1
        assert.strict.deepStrictEqual(r, rr)
    })

    let psizes2 = [
        0.063,
        0.02,
    ]
    let rr2 = [
        98.4880247416152,
        88.59851004564663,
    ]
    it(`should return ${JSON.stringify(rr2)} when intrpPsdBySize(${JSON.stringify(pfss)}, ${JSON.stringify(psizes2)})`, function() {
        let r = intrpPsdBySize(pfss, psizes2)
        let rr = rr2
        assert.strict.deepStrictEqual(r, rr)
    })

})
