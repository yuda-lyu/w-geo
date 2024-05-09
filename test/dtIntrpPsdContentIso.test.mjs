import assert from 'assert'
import _ from 'lodash-es'
import w from 'wsemi'
import dtIntrpPsdContentIso from '../src/dtIntrpPsdContentIso.mjs'


describe(`dtIntrpPsdContentIso`, function() {

    let dt = {
        GSD: `[101.6, 76.2, 50.8, 25.4, 19.0, 9.5, 4.75, 2.0, 0.85, 0.425, 0.25, 0.15, 0.106, 0.075, 0.027, 0.018, 0.011, 0.008, 0.006, 0.003, 0.001, 0.0, 0.0, 0.0]`,
        GSP: `[100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, -1.0, 100.0, 99.0, 96.0, 86.0, 74.0, 61.0, 51.0, 32.0, 16.0, 0.0, 0.0, 0.0]`,
    }

    let out1 = {
        GSD: '[101.6, 76.2, 50.8, 25.4, 19.0, 9.5, 4.75, 2.0, 0.85, 0.425, 0.25, 0.15, 0.106, 0.075, 0.027, 0.018, 0.011, 0.008, 0.006, 0.003, 0.001, 0.0, 0.0, 0.0]',
        GSP: '[100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, -1.0, 100.0, 99.0, 96.0, 86.0, 74.0, 61.0, 51.0, 32.0, 16.0, 0.0, 0.0, 0.0]',
        ctCoarseISO: 2,
        ctGravelISO: 0,
        ctSandISO: 2,
        ctFineISO: 98,
        ctSiltISO: 72,
        ctClayISO: 26
    }
    it(`should return ${out1} when dtIntrpPsdContentIso(dt)`, function() {
        let r = dtIntrpPsdContentIso(dt)
        let rr = out1
        assert.strict.deepStrictEqual(r, rr)
    })

})
