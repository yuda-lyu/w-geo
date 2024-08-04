import get from 'lodash-es/get.js'
import find from 'lodash-es/find.js'
import round from 'lodash-es/round.js'
import size from 'lodash-es/size.js'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import dtIntrpPsdBySize from './dtIntrpPsdBySize.mjs'


function dtIntrpPsdContentUscs(dt, opt = {}) {

    //keyGSD
    let keyGSD = get(opt, 'keyGSD', '')
    if (!isestr(keyGSD)) {
        keyGSD = 'GSD'
    }

    //keyGSP
    let keyGSP = get(opt, 'keyGSP', '')
    if (!isestr(keyGSP)) {
        keyGSP = 'GSP'
    }

    //keySize
    let keySize = get(opt, 'keySize', '')
    if (!isestr(keySize)) {
        keySize = 'size'
    }

    //keyFraction
    let keyFraction = get(opt, 'keyFraction', '')
    if (!isestr(keyFraction)) {
        keyFraction = 'fraction'
    }

    //showLog
    let showLog = get(opt, 'showLog')
    if (!isbol(showLog)) {
        showLog = true
    }

    //dtIntrpPsdBySize
    let psizes = [
        101.6,
        76.2,
        50.8,
        25.4,
        19.0,
        9.5,
        4.75,
        2.0,
        0.85,
        0.425,
        0.25,
        0.15,
        0.106,
        0.075,
        0.034,
        0.022,
        0.013,
        0.009,
        0.007,
        0.005,
        0.003,
        0.001,
    ]
    let psds = dtIntrpPsdBySize(dt, psizes, opt)
    // console.log('psds', psds)

    //check
    if (size(psds) === 0) {
        if (showLog) console.log('dt', dt)
        if (showLog) console.log('psizes', psizes)
        if (showLog) console.log('keyGSD', keyGSD)
        if (showLog) console.log('keyGSP', keyGSP)
        if (showLog) console.log('keySize', keySize)
        if (showLog) console.log('keyFraction', keyFraction)
        throw new Error('invalid PSD')
    }

    // '計算ctGRAVEL(%), ctSAND(%), ctSILT(%)
    // '粗顆粒材料(tGRAVEL, ctSAND)：累積停留在 200 號上篩材料之百分比
    // '細顆粒材料(rSILT, rCLAY)：累積通過 200 號篩材料之百分比
    // 'ASTM與ASHTO之土壤粒徑特性分類法以50(um)作為粉土與黏土的界線，實際USCS要劃分黏土粉土得要看塑性(A線)
    // 'ctGRAVEL：礫石 = 100 - 累積停留在 4 號上篩材料之百分比
    // 'ctSAND：砂土 = 累積停留在 4 號篩上材料之百分比 - 累積停留在 200 號篩上材料之百分比
    // 'rSILT：粉土 = 細顆粒材料 - 通過 0.005(mm) 以下百分比
    // 'rCLAY：黏土 = 通過 0.005mm 以下百分比
    // Dim s4percent As Double = Val(dt("SivGSP")(getSiveIndex("#4")))
    // Dim s10percent As Double = Val(dt("SivGSP")(getSiveIndex("#10")))
    // Dim s40percent As Double = Val(dt("SivGSP")(getSiveIndex("#40")))
    // Dim s200percent As Double = Val(dt("SivGSP")(getSiveIndex("#200")))
    // rs [
    //   [ '4吋', 101.6, 100 ],  [ '3吋', 76.2, 100 ],
    //   [ '2吋', 50.8, 100 ],   [ '1吋', 25.4, 100 ],
    //   [ '3/4吋', 19, 100 ],   [ '3/8吋', 9.5, 100 ],
    //   [ '#4', 4.75, 100 ],    [ '#10', 2, 100 ],
    //   [ '#20', 0.85, 100 ],   [ '#40', 0.425, 100 ],
    //   [ '#60', 0.25, 100 ],   [ '#100', 0.15, -1 ],
    //   [ '#140', 0.106, 84 ],  [ '#200', 0.075, 46 ],
    //   [ '2分', 0.034, 18 ],   [ '5分', 0.022, 13 ],
    //   [ '15分', 0.013, 10 ],  [ '30分', 0.009, 8 ],
    //   [ '60分', 0.007, 7 ],   [ '250分', 0.003, 4 ],
    //   [ '1440分', 0.001, 3 ], [ '0分', 0, 0 ],
    //   [ '0分', 0, 0 ],        [ '0分', 0, 0 ]
    // ]

    let p4_75 = find(psds, { size: 4.75 }) //#4
    // let p2 = find(psds, { size: 2 }) //#10
    // let p0_425 = find(psds, { size: 0.425 }) //#40
    let p0_075 = find(psds, { size: 0.075 }) //#200
    let p0_005 = find(psds, { size: 0.005 }) //比重計分析的0.005(mm)通過百分比

    let f4_75 = get(p4_75, 'fraction')
    // let f2 = get(p2, 'fraction')
    // let f0_425 = get(p0_425, 'fraction')
    let f0_075 = get(p0_075, 'fraction')
    let f0_005 = get(p0_005, 'fraction')

    //check
    if (!isnum(f4_75)) {
        throw new Error('invalid PSD in 4.75mm')
    }
    if (!isnum(f0_075)) {
        throw new Error('invalid PSD in 0.075mm')
    }
    if (!isnum(f0_005)) {
        throw new Error('invalid PSD in 0.005mm')
    }
    f4_75 = cdbl(f4_75)
    f0_075 = cdbl(f0_075)
    f0_005 = cdbl(f0_005)
    // console.log('f4_75', f4_75, 'f0_075', f0_075, 'f0_005', f0_005)

    //ctGravelUSCS, ctSandUSCS, ctFineUSCS, ctClayUSCS, 四捨五入可能會導致4項總和非100%
    let ctGravelUSCS = 100 - f4_75
    ctGravelUSCS = round(ctGravelUSCS)
    let ctSandUSCS = f4_75 - f0_075
    ctSandUSCS = round(ctSandUSCS)
    let ctSiltUSCS = f0_075 - f0_005
    ctSiltUSCS = round(ctSiltUSCS)
    let ctClayUSCS = f0_005
    ctClayUSCS = round(ctClayUSCS)
    // console.log('ctGravelUSCS', ctGravelUSCS, 'ctSandUSCS', ctSandUSCS, 'ctSiltUSCS', ctSiltUSCS, 'ctClayUSCS', ctClayUSCS)

    //add ctCoarseUSCS, ctGravelUSCS, ctSandUSCS, ctFineUSCS, ctSiltUSCS, ctClayUSCS
    dt.ctGravelUSCS = ctGravelUSCS
    dt.ctSandUSCS = ctSandUSCS
    dt.ctSiltUSCS = ctSiltUSCS
    dt.ctClayUSCS = ctClayUSCS
    dt.ctCoarseUSCS = ctGravelUSCS + ctSandUSCS
    dt.ctFineUSCS = ctSiltUSCS + ctClayUSCS
    // console.log('ctGravel Ori', dt.ctGravel, 'New', ctGravelUSCS)
    // console.log('ctSand Ori', dt.ctSand, 'New', ctSandUSCS)
    // console.log('ctFine Ori', (cdbl(dt.ctSilt) + cdbl(dt.ctClay)), 'New', ctFineUSCS)
    // console.log('ctClay Ori', dt.ctClay, 'New', ctClayUSCS)

    return dt
}


export default dtIntrpPsdContentUscs
