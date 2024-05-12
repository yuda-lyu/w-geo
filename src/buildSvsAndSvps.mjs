import each from 'lodash-es/each.js'
import get from 'lodash-es/get.js'
import sortBy from 'lodash-es/sortBy.js'
import size from 'lodash-es/size.js'
import cdbl from 'wsemi/src/cdbl.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import cnst from './cnst.mjs'
import calcDepthStartEndByDepth from './calcDepthStartEndByDepth.mjs'
import calcVerticalStress from './calcVerticalStress.mjs'


function buildSvsAndSvps(ltdt, opt = {}) {

    //keyDepth
    let keyDepth = get(opt, 'keyDepth')
    if (!isestr(keyDepth)) {
        keyDepth = 'depth'
    }

    //keyRd
    let keyRd = get(opt, 'keyRd')
    if (!isestr(keyRd)) {
        keyRd = 'rd'
    }

    //keyRsat
    let keyRsat = get(opt, 'keyRsat')
    if (!isestr(keyRsat)) {
        keyRsat = 'rsat'
    }

    //waterLevelUsual
    let waterLevelUsual = get(opt, 'waterLevelUsual')
    if (!isnum(waterLevelUsual)) {
        waterLevelUsual = 0
    }
    waterLevelUsual = cdbl(waterLevelUsual)

    //waterLevelDesign
    let waterLevelDesign = get(opt, 'waterLevelDesign')
    if (!isnum(waterLevelDesign)) {
        waterLevelDesign = 0
    }
    waterLevelDesign = cdbl(waterLevelDesign)

    //取可計算垂直與有效垂直應力參數
    let rs = []
    each(ltdt, (v) => {

        //depth(m)
        let depth = get(v, keyDepth)
        if (!isnum(depth)) {
            return true //跳出換下一個
        }
        depth = cdbl(depth)
        // console.log('depth', depth)

        //rd(kN/m3)
        let rd = get(v, keyRd)
        if (!isnum(rd)) {
            return true //跳出換下一個
        }
        rd = cdbl(rd)
        // console.log('rd', rd)

        //rsat(kN/m3)
        let rsat = get(v, keyRsat)
        if (!isnum(rsat)) {
            return true //跳出換下一個
        }
        rsat = cdbl(rsat)
        // console.log('rsat', rsat)

        //push
        rs.push({
            [keyDepth]: depth,
            [keyRd]: rd,
            [keyRsat]: rsat,
        })

    })
    // console.log('rs', rs)

    //check
    if (size(rs) === 0) {
        // console.log('ltdt', ltdt)
        return null
    }

    //sortBy
    rs = sortBy(rs, keyDepth)
    // console.log('rs(sortBy)', rs)

    //添加深度0與超深節點避免外插問題
    let depthMin = get(rs, `0.${keyDepth}`)
    depthMin = Math.min(depthMin, 0) //最淺為0
    let depthMax = get(rs, `${size(rs) - 1}.${keyDepth}`)
    depthMax = Math.max(depthMax, 1) //避免小於1
    depthMax *= 2 //加深2倍
    rs = [
        {
            [keyDepth]: depthMin,
            [keyRd]: 0,
            [keyRsat]: 0,
        },
        ...rs,
        {
            [keyDepth]: depthMax,
            [keyRd]: cnst.assesment_rd, //18.03986577,
            [keyRsat]: cnst.assesment_rsat, //21.26597315,
        }]

    //calcDepthStartEndByDepth, 由中點深度反算起訖深度
    rs = calcDepthStartEndByDepth(rs)
    // console.log('rs(calcDepthStartEndByDepth)', rs)

    //檢核, 深度(depth)位於 7.82m 處:
    //rsat=21.26597315 => sv=166.29991
    //rsat=18.99331942 => sv=148.5277578
    //rsat=14.95757398 => sv=116.9682285
    // let ts = rs
    // ts = filter(ts, (v) => {
    //     return v.depth <= 7.82
    // })
    // ts = map(ts, keyRsat)
    // console.log('average rsat', average(ts))

    //calcVerticalStress
    let rsn = null
    try {
        rsn = calcVerticalStress(rs, {
            waterLevelUsual,
            waterLevelDesign,
            unitSvSvp: 'kPa',
        })
    }
    catch (err) {
        console.log(err)
        throw new Error('無法計算垂直總應力與有效應力')
    }
    // console.log('rsn(calcVerticalStress)', rsn)

    //svs, svps, rds, rsats
    let svs = []
    let svps = []
    let rds = []
    let rsats = []
    each(rsn, (v, k) => {

        //sv, svp(kN/m2)
        svs.push([v.depth, v.sv])
        svps.push([v.depth, Math.min(v.svpUsual, v.svpDesign)]) //選svpUsual與svpDesign較小值, 偏保守

        //rd, rsat(kN/m3)
        let vv = get(rs, k)
        rds.push([vv.depth, vv[keyRd]])
        rsats.push([vv.depth, vv[keyRsat]])

    })
    // console.log('svs', svs)
    // console.log('svps', svps)
    // console.log('rds', rds)
    // console.log('rsats', rsats)

    return {
        svs,
        svps,
        rds,
        rsats,
    }
}


export default buildSvsAndSvps
