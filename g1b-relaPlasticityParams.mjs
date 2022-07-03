import relaPlasticityParams from './src/relaPlasticityParams.mjs'


let LL = 24 //%
let PI = 14 //%
let PL = 10 //%
let r

try {
    r = relaPlasticityParams(LL, null, null)
}
catch (e) {
    r = e.toString()
}
console.log('LL', r)
// => LL { LL: 24, PL: null, PI: null }

try {
    r = relaPlasticityParams(null, PI, null)
    console.log('PI', r)
}
catch (e) {
    r = e.toString()
}
// => PI { LL: null, PL: null, PI: 14 }

try {
    r = relaPlasticityParams(null, null, PL)
}
catch (e) {
    r = e.toString()
}
console.log('PL', r)
// => PL { LL: null, PL: 10, PI: null }

try {
    r = relaPlasticityParams(LL, PI, null)
}
catch (e) {
    r = e.toString()
}
console.log('LL,PI', r)
// => LL,PI { LL: 24, PL: 10, PI: 14 }

try {
    r = relaPlasticityParams(LL, null, PL)
}
catch (e) {
    r = e.toString()
}
console.log('LL,PL', r)
// => LL,PL { LL: 24, PL: 10, PI: 14 }

try {
    r = relaPlasticityParams(null, PI, PL)
}
catch (e) {
    r = e.toString()
}
console.log('PI,PL', r)
// => PI,PL { LL: 24, PL: 10, PI: 14 }

try {
    r = relaPlasticityParams(LL, PI, PL)
}
catch (e) {
    r = e.toString()
}
console.log('LL,PI,PL', r)
// => LL,PI,PL { LL: 24, PL: 10, PI: 14 }

try {
    r = relaPlasticityParams(2, PI, PL)
}
catch (e) {
    r = e.toString()
}
console.log('2,PI,PL', r)
// => 2,PI,PL {
//   LL: 2,
//   PL: 10,
//   PI: 14,
//   err: '液限[2]<=塑限[10], 反算出塑限[-12]<=0, 反算出塑性指數[-8]<=0, 輸入液限[2]與反算出液限[24]差距過大'
// }

try {
    r = relaPlasticityParams(32, PI, PL)
}
catch (e) {
    r = e.toString()
}
console.log('32,PI,PL', r)
// => 32,PI,PL {
//   LL: 32,
//   PL: 10,
//   PI: 14,
//   err: '輸入塑限[10]與反算出塑限[18]差距過大, 輸入塑性指數[14]與反算出塑性指數[22]差距過大, 輸入液限[32]與反算出液限[24]差距過大'
// }

//node --experimental-modules --es-module-specifier-resolution=node g1b-relaPlasticityParams.mjs
