import relaPorousParams from './src/relaPorousParams.mjs'


let GS = 2.7
let e = 0.86
let rd = 14.240322580645163 //kN/m3
let rsat = 18.776129032258066 //kN/m3
let r

let coreFuncs = relaPorousParams(null, null, null, null, { returnFuncs: true }).coreFuncs

console.log('rd get_rd_from_GS_e', coreFuncs.get_rd_from_GS_e(GS, e))
// => rd get_rd_from_GS_e 14.240322580645163

console.log('rd get_rd_from_rsat_e', coreFuncs.get_rd_from_rsat_e(rsat, e))
// => rd get_rd_from_rsat_e 14.240322580645163

console.log('rd get_rd_from_rsat_GS', coreFuncs.get_rd_from_rsat_GS(rsat, GS))
// => rd get_rd_from_rsat_GS 14.240322580645161

console.log('rsat get_rsat_from_GS_e', coreFuncs.get_rsat_from_GS_e(GS, e))
// => rsat get_rsat_from_GS_e 18.776129032258066

console.log('rsat get_rsat_from_rd_e', coreFuncs.get_rsat_from_rd_e(rd, e))
// => rsat get_rsat_from_rd_e 18.776129032258066

console.log('rsat get_rsat_from_rd_GS', coreFuncs.get_rsat_from_rd_GS(rd, GS))
// => rsat get_rsat_from_rd_GS 18.77612903225807

console.log('e get_e_from_GS_rd', coreFuncs.get_e_from_GS_rd(GS, rd))
// => e get_e_from_GS_rd 0.8599999999999999

console.log('e get_e_from_rd_rsat', coreFuncs.get_e_from_rd_rsat(rd, rsat))
// => e get_e_from_rd_rsat 0.8599999999999998

console.log('e get_e_from_GS_rsat', coreFuncs.get_e_from_GS_rsat(GS, rsat))
// => e get_e_from_GS_rsat 0.86

console.log('GS get_GS_from_rd_e', coreFuncs.get_GS_from_rd_e(rd, e))
// => GS get_GS_from_rd_e 2.7

console.log('GS get_GS_from_rd_rsat', coreFuncs.get_GS_from_rd_rsat(rd, rsat))
// => GS get_GS_from_rd_rsat 2.6999999999999997

console.log('GS get_GS_from_rsat_e', coreFuncs.get_GS_from_rsat_e(rsat, e))
// => GS get_GS_from_rsat_e 2.7

r = relaPorousParams(rd, rsat, null, null)
console.log('rd,rsat', r)
// => rd,rsat {
//     rd: 14.240322580645163,
//     rsat: 18.776129032258066,
//     GS: 2.7,
//     e: 0.8599999999999998
// }

r = relaPorousParams(rd, null, GS, null)
console.log('rd,GS', r)
// => rd,GS {
//     rd: 14.240322580645163,
//     rsat: 18.77612903225807,
//     GS: 2.7,
//     e: 0.8599999999999999
// }

r = relaPorousParams(rd, null, null, e)
console.log('rd,e', r)
// => rd,e {
//     rd: 14.240322580645163,
//     rsat: 18.776129032258066,
//     GS: 2.7,
//     e: 0.86
// }

r = relaPorousParams(null, rsat, GS, null)
console.log('rsat,GS', r)
// => rsat,GS {
//     rd: 14.240322580645161,
//     rsat: 18.776129032258066,
//     GS: 2.7,
//     e: 0.8600000000000001
// }

r = relaPorousParams(null, rsat, null, e)
console.log('rsat,e', r)
// => rsat,e {
//     rd: 14.240322580645163,
//     rsat: 18.776129032258066,
//     GS: 2.7,
//     e: 0.86
// }

r = relaPorousParams(null, null, GS, e)
console.log('GS,e', r)
// => GS,e {
//     rd: 14.240322580645163,
//     rsat: 18.776129032258066,
//     GS: 2.7,
//     e: 0.86
// }

r = relaPorousParams(rd, rsat, GS, null)
console.log('rd,rsat,GS', r)
// => rd,rsat,GS {
//     rd: 14.240322580645163,
//     rsat: 18.776129032258066,
//     GS: 2.7,
//     e: 0.8599999999999999
// }

r = relaPorousParams(rd, rsat, null, e)
console.log('rd,rsat,e', r)
// => rd,rsat,e {
//     rd: 14.240322580645163,
//     rsat: 18.776129032258066,
//     GS: 2.7,
//     e: 0.86
// }

r = relaPorousParams(rd, null, GS, e)
console.log('rd,GS,e', r)
// => rd,GS,e {
//     rd: 14.240322580645163,
//     rsat: 18.776129032258066,
//     GS: 2.7,
//     e: 0.86
// }

r = relaPorousParams(null, rsat, GS, e)
console.log('rsat,GS,e', r)
// => rsat,GS,e {
//     rd: 14.240322580645163,
//     rsat: 18.776129032258066,
//     GS: 2.7,
//     e: 0.86
// }

try {
    r = relaPorousParams(13.9, null, GS, e)
}
catch (e) {
    r = e.toString()
}
console.log('GS,e', r)
// => GS,e {
//   rd: 14.1,
//   rsat: 18.776129032258066,
//   GS: 2.7,
//   e: 0.86,
//   err: '輸入孔隙比[0.86]與反算出孔隙比[0.8785106382978726]差距過大'
// }

//node --experimental-modules g_1_1-relaPorousParams.mjs
