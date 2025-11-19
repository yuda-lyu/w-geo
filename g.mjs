import _ from 'lodash-es'
import w from 'wsemi'
import calcEstmRelativeDensity from './src/calcEstmRelativeDensity.mjs'


let rIn
let rOut
let dtIn
let dtOut
let ltdtIn
let ltdtOut

let r2 = [
    {
        depth: 1,
        rd: 16.5,
        rdMin: 16,
        rdMax: 17,
    },
    {
        depth: 1.5,
        rd: null,
        rdMin: 16.2,
        rdMax: 17.7,
    },
    {
        depth: 2,
        rd: 17.1,
        rdMin: 16.6,
        rdMax: 18,
    },
]
let rr2 = [
    {
        depth: 1,
        rd: 16.5,
        rdMin: 16,
        rdMax: 17,
        Dr: 51.515151515151516,
    },
]
let _rr2 = calcEstmRelativeDensity(r2)
console.log(_rr2)


//node g.mjs
