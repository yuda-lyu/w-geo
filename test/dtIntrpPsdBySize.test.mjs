import assert from 'assert'
import _ from 'lodash-es'
import w from 'wsemi'
import dtIntrpPsdBySize from '../src/dtIntrpPsdBySize.mjs'


describe(`dtIntrpPsdBySize`, function() {

    let dt = {
        GSD: `[101.6, 76.2, 50.8, 25.4, 19.0, 9.5, 4.75, 2.0, 0.85, 0.425, 0.25, 0.15, 0.106, 0.075, 0.027, 0.018, 0.011, 0.008, 0.006, 0.003, 0.001, 0.0, 0.0, 0.0]`,
        GSP: `[100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, -1.0, 100.0, 99.0, 96.0, 86.0, 74.0, 61.0, 51.0, 32.0, 16.0, 0.0, 0.0, 0.0]`,
    }

    let psizes1 = 0.63
    let rr1 = { size: 0.63, fraction: 100.00000000000001 }
    it(`should return ${JSON.stringify(rr1)} when dtIntrpPsdBySize(${JSON.stringify(dt)}, ${JSON.stringify(psizes1)})`, function() {
        let r = dtIntrpPsdBySize(dt, psizes1)
        let rr = rr1
        assert.strict.deepStrictEqual(r, rr)
    })

    let psizes2 = [
        630,
        200,
        63,
        20,
        6.3,
        2,
        0.63,
        0.2,
        0.063,
        0.02,
        0.0063,
        0.002,
    ]
    let rr2 = [
        { size: 630, fraction: 100 },
        { size: 200, fraction: 100 },
        { size: 63, fraction: 99.99999999999999 },
        { size: 20, fraction: 99.99999999999999 },
        { size: 6.3, fraction: 100.00000000000001 },
        { size: 2, fraction: 100 },
        { size: 0.63, fraction: 100.00000000000001 },
        { size: 0.2, fraction: 100 },
        { size: 0.063, fraction: 98.4880247416152 },
        { size: 0.02, fraction: 88.59851004564663 },
        { size: 0.0063, fraction: 52.69597513510718 },
        { size: 0.002, fraction: 26.094876057143324 }
    ]
    it(`should return ${JSON.stringify(rr2)} when dtIntrpPsdBySize(${JSON.stringify(dt)}, ${JSON.stringify(psizes2)})`, function() {
        let r = dtIntrpPsdBySize(dt, psizes2)
        let rr = rr2
        assert.strict.deepStrictEqual(r, rr)
    })

})
