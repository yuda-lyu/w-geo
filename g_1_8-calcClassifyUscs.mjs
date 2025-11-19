import path from 'node:path'
import fs from 'node:fs'
import _ from 'lodash-es'
import w from 'wsemi'
import calcClassifyUscs from './src/calcClassifyUscs.mjs'


let rows = [
    {
        id: 'BH-01',
        LL: 25,
        PI: 5,
        Cu: 6.5,
        Cc: 1.2,
        ctGravel: 5,
        ctSand: 80,
        ctSilt: 10,
        ctClay: 5,
    },
    {
        id: 'BH-02',
        LL: 38,
        PI: 14,
        Cu: 12.0,
        Cc: 0.9,
        ctGravel: 2,
        ctSand: 45,
        ctSilt: 35,
        ctClay: 18,
    },
    {
        id: 'BH-03',
        LL: 55,
        PI: 32,
        Cu: 18.5,
        Cc: 0.7,
        ctGravel: 0,
        ctSand: 10,
        ctSilt: 30,
        ctClay: 60,
    },
    {
        id: 'VH-01(CL)',
        LL: 44,
        PI: 22,
        Cu: 14.33,
        Cc: 0.85,
        ctGravel: 2,
        ctSand: 33,
        ctSilt: 28,
        ctClay: 37,
    },
    {
        id: 'VH-01(SC)',
        LL: 34,
        PI: 13,
        Cu: 10.33,
        Cc: 1.02,
        ctGravel: 3,
        ctSand: 57,
        ctSilt: 22,
        ctClay: 18,
    },
]

_.each(rows, (v) => {
    let r = calcClassifyUscs(v)
    console.log(v.id, r)
})


//node g_1_8-calcClassifyUscs.mjs
