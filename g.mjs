// import relaPorousParams from './src/relaPorousParams.mjs'
// import checkDepthStartEnd from './src/checkDepthStartEnd.mjs'
import calcVerticalStress from './src/calcVerticalStress.mjs'

let waterLevel
let rows
let rowsNew

waterLevel = 0
rows = [
    {
        depthStart: 0,
        depthEnd: 5,
        rsat: 18, //kN/m3
    },
    {
        depthStart: 5,
        depthEnd: 10,
        rsat: 18, //kN/m3
    },
    {
        depthStart: 10,
        depthEnd: 20,
        rsat: 18, //kN/m3
    },
]
rowsNew = calcVerticalStress(waterLevel, rows)
console.log(rowsNew, (18 - 9.81) * 15) //地下 15(m) 處之垂直有效應力為 122.85(kN/m2)
// => [
//     {
//       depthStart: 0,
//       depthEnd: 5,
//       rsat: 18,
//       waterLevel: 0,
//       sv: 45,
//       svp: 20.474999999999998,
//       zsv: 2.5
//     },
//     {
//       depthStart: 5,
//       depthEnd: 10,
//       rsat: 18,
//       waterLevel: 0,
//       sv: 135,
//       svp: 61.425,
//       zsv: 7.5
//     },
//     {
//       depthStart: 10,
//       depthEnd: 20,
//       rsat: 18,
//       waterLevel: 0,
//       sv: 270,
//       svp: 122.85,
//       zsv: 15
//     }
// ]

waterLevel = 0
rows = [
    {
        depthStart: 0,
        depthEnd: 5,
        rsat: 18, //kN/m3
    },
    {
        depthStart: 5,
        depthEnd: 10,
        rsat: 19, //kN/m3
    },
    {
        depthStart: 10,
        depthEnd: 20,
        rsat: 20, //kN/m3
    },
]
rowsNew = calcVerticalStress(waterLevel, rows)
console.log(rowsNew, (19 - 9.81) * 15) //地下 15(m) 處之垂直有效應力為 137.85(kN/m2)
// => [
//     {
//       depthStart: 0,
//       depthEnd: 5,
//       rsat: 18,
//       waterLevel: 0,
//       sv: 45,
//       svp: 20.474999999999998,
//       zsv: 2.5
//     },
//     {
//       depthStart: 5,
//       depthEnd: 10,
//       rsat: 19,
//       waterLevel: 0,
//       sv: 137.5,
//       svp: 63.925,
//       zsv: 7.5
//     },
//     {
//       depthStart: 10,
//       depthEnd: 20,
//       rsat: 20,
//       waterLevel: 0,
//       sv: 285,
//       svp: 137.85,
//       zsv: 15
//     }
// ]

waterLevel = 20
rows = [
    {
        depthStart: 0,
        depthEnd: 5,
        rd: 18, //kN/m3
    },
    {
        depthStart: 5,
        depthEnd: 10,
        rd: 18, //kN/m3
    },
    {
        depthStart: 10,
        depthEnd: 20,
        rd: 18, //kN/m3
    },
]
rowsNew = calcVerticalStress(waterLevel, rows)
console.log(rowsNew, (18) * 15) //地下 15(m) 處之垂直總應力與垂直有效應力為 270(kN/m2)
// => [
//     {
//       depthStart: 0,
//       depthEnd: 5,
//       rd: 18,
//       waterLevel: 20,
//       sv: 45,
//       svp: 45,
//       zsv: 2.5
//     },
//     {
//       depthStart: 5,
//       depthEnd: 10,
//       rd: 18,
//       waterLevel: 20,
//       sv: 135,
//       svp: 135,
//       zsv: 7.5
//     },
//     {
//       depthStart: 10,
//       depthEnd: 20,
//       rd: 18,
//       waterLevel: 20,
//       sv: 270,
//       svp: 270,
//       zsv: 15
//     }
// ]

waterLevel = 3
rows = [
    {
        depthStart: 0,
        depthEnd: 3,
        rd: 18, //kN/m3
    },
    {
        depthStart: 3,
        depthEnd: 11,
        rsat: 20, //kN/m3
    },
]
rowsNew = calcVerticalStress(waterLevel, rows)
console.log(rowsNew) //地下 7(m) 處之垂直有效應力為 94.76(kN/m2)
// => [
//     {
//       depthStart: 0,
//       depthEnd: 3,
//       rd: 18,
//       waterLevel: 3,
//       sv: 27,
//       svp: 27,
//       zsv: 1.5
//     },
//     {
//       depthStart: 3,
//       depthEnd: 11,
//       rsat: 20,
//       waterLevel: 3,
//       sv: 134,
//       svp: 94.75999999999999,
//       zsv: 7
//     }
// ]

waterLevel = 3
rows = [
    {
        depthStart: 0,
        depthEnd: 1,
        rd: 18, //kN/m3
    },
    {
        depthStart: 1,
        depthEnd: 5,
        rd: 18, //kN/m3
        rsat: 20, //kN/m3
    },
    {
        depthStart: 5,
        depthEnd: 9,
        rsat: 20, //kN/m3
    },
]
rowsNew = calcVerticalStress(waterLevel, rows)
console.log(rowsNew) //地下 7(m) 處之垂直有效應力為 94.76(kN/m2)
// => [
//     {
//       depthStart: 0,
//       depthEnd: 1,
//       rd: 18,
//       waterLevel: 3,
//       sv: 9,
//       svp: 9,
//       zsv: 0.5
//     },
//     {
//       depthStart: 1,
//       depthEnd: 5,
//       rd: 18,
//       rsat: 20,
//       waterLevel: 3,
//       sv: 56,
//       svp: 56,
//       zsv: 3
//     },
//     {
//       depthStart: 5,
//       depthEnd: 9,
//       rsat: 20,
//       waterLevel: 3,
//       sv: 134,
//       svp: 94.75999999999999,
//       zsv: 7
//     }
// ]


//node --experimental-modules --es-module-specifier-resolution=node g.mjs
