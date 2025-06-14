import relaPsdContent from './src/relaPsdContent.mjs'


let ctGravel = 15 //%
let ctSand = 30 //%
let ctSilt = 45 //%
let ctClay = 10 //%
let r

r = relaPsdContent(ctGravel, ctSand, ctSilt, ctClay)
console.log(r)
// => {
//   ctGravel: 15,
//   ctSand: 30,
//   ctSilt: 45,
//   ctClay: 10,
//   ctCoarse: 45,
//   ctFine: 55
// }

//node g_1_3-relaPsdContent.mjs
