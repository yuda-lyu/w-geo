import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import size from 'lodash-es/size.js'
import sortBy from 'lodash-es/sortBy.js'
import arrAt from 'wsemi/src/arrAt.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import cint from 'wsemi/src/cint.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isp0int from 'wsemi/src/isp0int.mjs'
import arrAverage from 'w-statistic/src/arrAverage.mjs'
import arrStd from 'w-statistic/src/arrStd.mjs'
import arrCount from 'w-statistic/src/arrCount.mjs'


/**
 * 平滑化含深度與指定欄位之樣本陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/w-geo/blob/master/test/calcDepthStartEndByConnect.test.js Github}
 * @memberOf w-geo
 * @param {Array} rows 輸入物件陣列
 * @param {String} key 輸入欲平滑之欄位鍵名稱字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.keyDepth='depth'] 輸入深度欄位鍵名稱字串，預設'depth'
 * @param {String} [opt.methodSmooth='average'] 輸入平滑化方法字串，可選'average'、'averageIn95'、'maxCount'，預設'average'
 * @param {Object} [opt.ranger={}] 輸入提取窗形方式之設定物件，預設{}
 * @param {Intger} [opt.ranger.countHalf=5] 輸入提取上下點數整數，例如給予5代表上下取5點加自己共11點，預設5
 * @param {Number} [opt.ranger.depthHalf=0.25] 輸入提取上下距離數字，單位m，例如給予0.25代表上下取0.25m共0.5m，預設0.25
 * @returns {Array} 回傳平滑化後陣列
 * @example
 * 待補充
 */
function smoothDepthByKey(rows, key, opt = {}) {

    //check
    if (size(rows) === 0) {
        return []
    }
    if (!isestr(key)) {
        return []
    }

    //countHalf
    let countHalf = get(opt, 'ranger.countHalf')
    if (!isp0int(countHalf)) {
        countHalf = 5 //上下取5點加自己共11點
    }
    countHalf = cint(countHalf)

    //depthHalf
    let depthHalf = get(opt, 'ranger.depthHalf')
    if (!isnum(depthHalf)) {
        depthHalf = 0.25 //上下取0.25m共0.5m
    }
    depthHalf = cdbl(depthHalf)

    //keyDepth
    let keyDepth = get(opt, 'keyDepth')
    if (!isestr(keyDepth)) {
        keyDepth = 'depth'
    }

    //methodSmooth
    let methodSmooth = get(opt, 'methodSmooth')
    if (methodSmooth !== 'average' && methodSmooth !== 'averageIn95' && methodSmooth !== 'maxCount') {
        methodSmooth = 'average'
    }

    //ltdtEff
    let ltdtEff = []
    each(rows, (v) => {
        let d = get(v, keyDepth)
        let r = get(v, key)
        if (isnum(d) && (isestr(r) || isnum(r))) { //key值允許字串或數字
            v[keyDepth] = cdbl(d)
            v[key] = r
            ltdtEff.push(v)
        }
    })

    //check
    if (size(ltdtEff) === 0) {
        return []
    }

    //sortBy
    ltdtEff = sortBy(ltdtEff, keyDepth)

    //up
    let up = size(ltdtEff) - 1

    //rs
    let rs = []
    each(ltdtEff, (v, k) => {

        //ks, ke
        let ks = k
        let ke = k
        if (countHalf !== null) {
            ks = Math.max(k - countHalf, 0)
            ke = Math.min(k + countHalf, up)
        }
        else if (depthHalf !== null) {

            //calc ks
            for (let i = k; i >= 0; i--) {
                let depthDiff = Math.abs(ltdtEff[i][keyDepth] - v[keyDepth])
                if (depthDiff < depthHalf) {
                    ks = i
                }
                else {
                    break
                }
            }

            //calc ke
            for (let i = k; i <= up; i++) {
                let depthDiff = Math.abs(ltdtEff[i][keyDepth] - v[keyDepth])
                if (depthDiff < depthHalf) {
                    ke = i
                }
                else {
                    break
                }
            }

        }

        //arrAt
        let ltdtTemp = arrAt(ltdtEff, ks, ke)

        //p
        let p = null
        if (methodSmooth === 'average') {

            //arr
            let arr = map(ltdtTemp, key)

            //arrAverage
            let avg = arrAverage(arr)

            //save
            p = {
                [key]: avg,
            }

        }
        else if (methodSmooth === 'averageIn95') {

            //arr
            let arr = map(ltdtTemp, key)

            //arrAverage
            let a = arrAverage(arr)

            //arrStd
            let s = arrStd(arr)

            //ts
            let _ts = []
            let ts = []
            each(ltdtTemp, (v) => {
                let t = get(v, key)
                if (isnum(t)) {
                    t = cdbl(t)
                    _ts.push(t)
                    if (t >= a - 2 * s && t <= a + 2 * s) {
                        ts.push(t) //介於平均值2倍標準差內數字才儲存
                    }
                }
            })
            // console.log('_ts', _ts)
            // console.log('ts', ts)

            //avg
            let avg = arrAverage(ts)
            // console.log('avg', avg)

            //save
            p = {
                [key]: avg,
            }

        }
        else if (methodSmooth === 'maxCount') {

            //arr
            let arr = map(ltdtTemp, key)

            //arrCount
            let q = arrCount(arr)

            //取第1個的key, 也就是最多的
            let rk = get(q, `0.key`, '')
            let rc = get(q, `0.count`, '')

            //save
            p = {
                [key]: rk,
                count: rc,
            }

        }

        //s
        let s = {
            ...v,
            ...p,
        }

        //push
        rs.push(s)

    })

    return rs
}


export default smoothDepthByKey
