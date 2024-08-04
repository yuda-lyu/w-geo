import assert from 'assert'
import _ from 'lodash-es'
import w from 'wsemi'
import calcIntrpPsdContentIso from '../src/calcIntrpPsdContentIso.mjs'


describe(`calcIntrpPsdContentIso`, function() {

    let r1 = [{
        GSD: `[101.6, 76.2, 50.8, 25.4, 19.0, 9.5, 4.75, 2.0, 0.85, 0.425, 0.25, 0.15, 0.106, 0.075, 0.027, 0.018, 0.011, 0.008, 0.006, 0.003, 0.001, 0.0, 0.0, 0.0]`,
        GSP: `[100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, -1.0, 100.0, 99.0, 96.0, 86.0, 74.0, 61.0, 51.0, 32.0, 16.0, 0.0, 0.0, 0.0]`,
    }]
    let rr1 = [{
        GSD: '[101.6, 76.2, 50.8, 25.4, 19.0, 9.5, 4.75, 2.0, 0.85, 0.425, 0.25, 0.15, 0.106, 0.075, 0.027, 0.018, 0.011, 0.008, 0.006, 0.003, 0.001, 0.0, 0.0, 0.0]',
        GSP: '[100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, -1.0, 100.0, 99.0, 96.0, 86.0, 74.0, 61.0, 51.0, 32.0, 16.0, 0.0, 0.0, 0.0]',
        ctGravelISO: 0,
        ctSandISO: 2,
        ctSiltISO: 72,
        ctClayISO: 26,
        ctCoarseISO: 2,
        ctFineISO: 98,
    }]
    it(`should return ${JSON.stringify(rr1)} when calcIntrpPsdContentIso(${JSON.stringify(r1)})`, function() {
        let r = calcIntrpPsdContentIso(r1)
        let rr = rr1
        assert.strict.deepStrictEqual(r, rr)
    })

})
