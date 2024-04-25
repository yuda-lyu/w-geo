import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import get from 'lodash-es/get.js'
import size from 'lodash-es/size.js'
import max from 'lodash-es/max.js'
import min from 'lodash-es/min.js'
import mean from 'lodash-es/mean.js'
import sum from 'lodash-es/sum.js'
import range from 'lodash-es/range.js'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import regLine from 'w-statistic/src/regLine.mjs'
import studentTInv from 'w-statistic/src/studentTInv.mjs'


async function calcPropInterfaceFrictionAngle(ltdt, xMeanTarget, opt = {}) {
    //x為D50或PI, y為phi_peak或phi_residual
    //xMeanTarget為指定D50或PI處內插BE值, 通常為全部試體的平均D50或平均PI

    //keyX
    let keyX = get(opt, 'keyX', '')
    if (!isestr(keyX)) {
        keyX = 'x'
    }

    //keyY
    let keyY = get(opt, 'keyY', '')
    if (!isestr(keyY)) {
        keyY = 'y'
    }

    //useRegIntercept
    let useRegIntercept = get(opt, 'useRegIntercept')
    if (!isbol(useRegIntercept)) {
        useRegIntercept = true
    }

    //ps
    let ps = []
    each(ltdt, (v) => {
        let x = get(v, keyX, '')
        let y = get(v, keyY, '')
        if (isnum(x) && isnum(y)) {
            x = cdbl(x)
            y = cdbl(y)
            ps.push([x, y])
        }
    })
    // console.log('ps', ps)

    //nps
    let nps = size(ps)
    // console.log('nps', nps)

    //check
    if (nps === 0) {
        throw new Error('no effective data')
    }

    //rgl, 線性回歸y=mx+b
    let rgl = null
    if (nps === 1) {
        if (useRegIntercept) {
            //需有截距但只有1點, 故強制視為斜率0截距y之直線
            rgl = {
                m: 0,
                interpY: ps[0][1],
            }
        }
        else {
            //只有1點但使用基於無截距內外差, 則採用線性回歸內外插
            rgl = await regLine(ps, { useRegIntercept, useSync: false })
        }
    }
    else {
        rgl = await regLine(ps, { useRegIntercept, useSync: false }) //採用線性回歸內外插
    }
    // console.log('rgl', rgl)

    //phisEst
    let phisEst = map(ps, (p) => {
        let phiEst = rgl.m * p[0] + rgl.b
        return phiEst
    })
    // console.log('phisEst', phisEst)

    //dphisEst2
    let dphisEst2 = map(ps, (p, k) => {
        let phi = ps[k][1]
        let phiEst = phisEst[k]
        let dphiEst2 = (phi - phiEst) ** 2
        return dphiEst2
    })
    // console.log('dphisEst2', dphisEst2)

    //xs
    let xs = map(ps, 0)
    // console.log('xs', xs)

    //xMax, xMin, xMean
    let xMax = max(xs)
    let xMin = min(xs)
    let xMean = mean(xs)
    let xRange = xMax - xMin
    // console.log('xMax', xMax, 'xMin', xMin)
    // console.log('xMean', xMean)
    // console.log('xRange', xRange)

    //dxm2
    let dxm2 = map(xs, (x) => {
        let dx = (x - xMean) ** 2
        return dx
    })
    // console.log('dxm2', dxm2)

    // //phis
    // let phis = map(ps, 1)
    // // console.log('phis', phis)

    // //phiMax, phiMin, phiMean
    // let phiMax = max(phis)
    // let phiMin = min(phis)
    // let phiMean = mean(phis)
    // // console.log('phiMax', phiMax, 'phiMin', phiMin)
    // // console.log('phiMean', phiMean)

    //xSSE
    let xSSE = sum(dxm2)
    // console.log('xSSE', xSSE)

    //phiSSE
    let phiSSE = sum(dphisEst2)
    // console.log('phiSSE', phiSSE)

    //alpha
    let alpha = 0.05

    //t_alpha/2_n-2=T.INV((1-alpha/2),nps-2)
    let _v = (1 - alpha / 2)
    let _df = nps - 1
    let tinv = await studentTInv(_df, _v)
    // console.log('tinv', tinv)

    //BE, UE, LE
    let BE = rgl.m * xMeanTarget + rgl.b
    let tE = tinv * (phiSSE / (nps - 2)) ** 0.5 * (1 / nps + (xMeanTarget - xMean) ** 2 / xSSE) ** 0.5
    let UE = BE + tE
    let LE = BE - tE
    // console.log('xMeanTarget', xMeanTarget)
    // console.log('LE', LE, 'BE', BE, 'UE', UE)

    //繪圖曲線
    let _nps = 11 //20
    let _ps = []
    let _r = 1
    let _dr = 1.1
    each(range(_nps), (v) => {
        _ps.push(_r)
        _r *= _dr
    })
    _ps = map(_ps, (v) => {
        return v - 1
    })
    let _rMax = _ps[_nps - 1]
    let _rr = xRange / _rMax
    _ps = map(_ps, (v) => {
        return xMin + v * _rr
    })
    // console.log('_nps', _nps)
    // console.log('_ps', _ps)

    //_psBE, _psUE, _psLE
    let _psBE = []
    let _psUE = []
    let _psLE = []
    each(_ps, (v) => {
        let _BE = rgl.m * v + rgl.b
        let _tE = tinv * (phiSSE / (nps - 2)) ** 0.5 * (1 / nps + (v - xMean) ** 2 / xSSE) ** 0.5
        let _UE = _BE + _tE
        let _LE = _BE - _tE
        _psBE.push(_BE)
        _psUE.push(_UE)
        _psLE.push(_LE)
    })
    // console.log('_psBE', _psBE)
    // console.log('_psUE', _psUE)
    // console.log('_psLE', _psLE)

    //r
    let r = {
        rgl, //m,b
        BE,
        UE,
        LE,
        psBE: _psBE,
        psUE: _psUE,
        psLE: _psLE,
    }

    return r
}


export default calcPropInterfaceFrictionAngle
