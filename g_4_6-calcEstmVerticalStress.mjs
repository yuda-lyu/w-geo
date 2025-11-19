import calcEstmVerticalStress from './src/calcEstmVerticalStress.mjs'


let ltdtIn
let ltdtOut

ltdtIn = [
    {
        depth: 1,
        rd: 17.5,
        rsat: 18.5,
    },
    {
        depth: 3,
        rd: 18.0,
        rsat: 19.0,
    },
]
ltdtOut = calcEstmVerticalStress(ltdtIn)
console.log(ltdtOut)
// => [
//   { depth: 1, rd: 17.5, rsat: 18.5, sv: 17.34375, svp: 8.146875 },
//   { depth: 3, rd: 18, rsat: 19, sv: 56.046875, svp: 26.616875 }
// ]

ltdtIn = [
    {
        depth: 1,
        rd: 17.5,
        rsat: 18.5,
    },
    {
        depth: 2,
    },
    {
        depth: 3,
        rd: 18.0,
        rsat: 19.0,
    },
]
ltdtOut = calcEstmVerticalStress(ltdtIn)
console.log(ltdtOut)
// => [
//   { depth: 1, rd: 17.5, rsat: 18.5, sv: 17.34375, svp: 8.146875 },
//   { depth: 2, rd: 17.75, rsat: 18.75, sv: 37.234375, svp: 17.614375 },
//   { depth: 3, rd: 18, rsat: 19, sv: 56.046875, svp: 26.616875 }
// ]


//node g_4_6-calcEstmVerticalStress.mjs
