import get from 'lodash-es/get.js'
import isnum from 'wsemi/src/isnum.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'


function estmRelativeDensity(rd, rdMin, rdMax, opt = {}) {
    //rd, 乾單位重(kN/m3)

    //checkLimit
    let checkLimit = get(opt, 'checkLimit')
    if (!isbol(checkLimit)) {
        checkLimit = true
    }

    //check rd
    if (!isnum(rd)) {
        throw new Error(`rd[${rd}] is not a number`)
    }
    rd = cdbl(rd)

    //check rdMin
    if (!isnum(rdMin)) {
        throw new Error(`rdMin[${rdMin}] is not a number`)
    }
    rdMin = cdbl(rdMin)

    //check rdMax
    if (!isnum(rdMax)) {
        throw new Error(`rdMax[${rdMax}] is not a number`)
    }
    rdMax = cdbl(rdMax)

    //check rdMin > rdMax
    if (checkLimit && rdMin > rdMax) {
        throw new Error(`rdMin[${rdMin}] > rdMax[${rdMax}]`)
    }

    //check rd < rdMin
    if (checkLimit && rd < rdMin) {
        throw new Error(`rd[${rd}] < rdMin[${rdMin}]`)
    }

    //check rd > rdMax
    if (checkLimit && rd > rdMax) {
        throw new Error(`rd[${rd}] > rdMax[${rdMax}]`)
    }

    //dr1, dr2
    let dr1 = rdMax * (rd - rdMin)
    let dr2 = rd * (rdMax - rdMin)

    //Dr, 相對密度(%)
    let Dr = null
    if (dr2 > 0) {

        //Dr
        Dr = dr1 / dr2 * 100

        //因試驗誤差, 可能出現小於0或大於100
        Dr = Math.max(Dr, 0)
        Dr = Math.min(Dr, 100)

    }

    //r
    let r = {
        rd,
        rdMin,
        rdMax,
        Dr,
    }

    return r
}


export default estmRelativeDensity
