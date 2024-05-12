import relaRelativeDensity from './src/relaRelativeDensity.mjs'


let rd = 16.5 //kN/m3
let Gt_dry_min = 16 //kN/m3
let Gt_dry_max = 17 //kN/m3
let r

r = relaRelativeDensity(rd, Gt_dry_min, Gt_dry_max)
console.log(r)
// => { rd: 16.5, Gt_dry_min: 16, Gt_dry_max: 17, Dr: 51.515151515151516 }

//node --experimental-modules g.mjs
