import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import intrpPsdBySize from './src/intrpPsdBySize.mjs'


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
console.log('pfss', pfss)
// => pfss [
//   { size: 101.6, fraction: 100 },
//   { size: 76.2, fraction: 100 },
//   { size: 50.8, fraction: 100 },
//   { size: 25.4, fraction: 100 },
//   { size: 19, fraction: 100 },
//   { size: 9.5, fraction: 100 },
//   { size: 4.75, fraction: 100 },
//   { size: 2, fraction: 100 },
//   { size: 0.85, fraction: 100 },
//   { size: 0.425, fraction: 100 },
//   { size: 0.25, fraction: 100 },
//   { size: 0.15, fraction: -1 },
//   { size: 0.106, fraction: 100 },
//   { size: 0.075, fraction: 99 },
//   { size: 0.027, fraction: 96 },
//   { size: 0.018, fraction: 86 },
//   { size: 0.011, fraction: 74 },
//   { size: 0.008, fraction: 61 },
//   { size: 0.006, fraction: 51 },
//   { size: 0.003, fraction: 32 },
//   { size: 0.001, fraction: 16 },
//   { size: 0, fraction: 0 },
//   { size: 0, fraction: 0 },
//   { size: 0, fraction: 0 }
// ]

let psizes = 0.063

let r = intrpPsdBySize(pfss, psizes)
console.log(r)
// => 98.4880247416152


//node --experimental-modules g_7_1-intrpPsdBySize.mjs
