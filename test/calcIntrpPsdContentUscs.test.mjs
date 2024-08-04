import assert from 'assert'
import _ from 'lodash-es'
import w from 'wsemi'
import calcIntrpPsdContentUscs from '../src/calcIntrpPsdContentUscs.mjs'


describe(`calcIntrpPsdContentUscs`, function() {

    let r1 = [{
        GSD: `[101.6, 76.2, 50.8, 25.4, 19.0, 9.5, 4.75, 2.0, 0.85, 0.425, 0.25, 0.15, 0.106, 0.075, 0.034, 0.022, 0.013, 0.009, 0.007, 0.003, 0.001, 0.0, 0.0, 0.0]`,
        GSP: `[100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, -1.0, 84.0, 46.0, 18.0, 13.0, 10.0, 8.0, 7.0, 4.0, 3.0, 0.0, 0.0, 0.0]`,
    }]
    let rr1 = [{
        GSD: '[101.6, 76.2, 50.8, 25.4, 19.0, 9.5, 4.75, 2.0, 0.85, 0.425, 0.25, 0.15, 0.106, 0.075, 0.034, 0.022, 0.013, 0.009, 0.007, 0.003, 0.001, 0.0, 0.0, 0.0]',
        GSP: '[100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, -1.0, 84.0, 46.0, 18.0, 13.0, 10.0, 8.0, 7.0, 4.0, 3.0, 0.0, 0.0, 0.0]',
        ctGravelUSCS: 0,
        ctSandUSCS: 54,
        ctSiltUSCS: 40,
        ctClayUSCS: 6,
        ctCoarseUSCS: 54,
        ctFineUSCS: 46
    }]
    it(`should return ${JSON.stringify(rr1)} when calcIntrpPsdContentUscs(${JSON.stringify(r1)})`, function() {
        let r = calcIntrpPsdContentUscs(r1)
        let rr = rr1
        assert.strict.deepStrictEqual(r, rr)
    })

})
