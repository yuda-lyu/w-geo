import _ from 'lodash-es'
import w from 'wsemi'
import intrpPsdBySize from './src/intrpPsdBySize.mjs'

let rIn
let rOut
let dtIn
let dtOut
let ltdtIn
let ltdtOut

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

let psizes2 = [
    0.063,
    0.02,
]
let rr2 = [
    98.4880247416152,
    88.59851004564663,
]
let _rr2 = intrpPsdBySize(pfss, psizes2)
console.log(_rr2)

//node --experimental-modules g.mjs
