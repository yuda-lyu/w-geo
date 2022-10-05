
//eps, 數值計算誤差
let eps = 1e-6

//g, 重力加速度(m/s2)
let g = 9.81

//rw, 水單位重(kN/m3)
let rw = 9.81

//rd, 乾單位重(kN/m3)
let rd = 18.03986577

//rsat, 飽和單位重(kN/m3)
let rsat = 21.26597315

//Pa, 一大氣壓(MPa)
let Pa = 0.10139616
// let Pa = 101.39616 //正常空氣壓力 1033.6(g/cm2) = 1033.6/1000*9.81 = 10.139616(N/cm2) = 10.139616/1000*10000 = 101.39616(kN/m2)

let cnst = {
    eps,
    g,
    rw,
    Pa,
    assesment_rd: rd,
    assesment_rsat: rsat,
}


export default cnst
