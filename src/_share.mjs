import get from 'lodash-es/get'
import each from 'lodash-es/each'
import sortBy from 'lodash-es/sortBy'
import isNumber from 'lodash-es/isNumber'
import size from 'lodash-es/size'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'


function pickData(dt, pickKey) {
    let value = null
    if (isestr(pickKey)) {
        let t = get(dt, pickKey)
        if (isnum(t)) {
            value = cdbl(t) //只有數字才回傳, 否則傳null
        }
    }
    else if (isfun(pickKey)) {
        value = pickKey(dt)
    }
    return value
}


function extractLtdtDepthAndData(ltdt, pickKey1, allowNull = false) {

    //ps
    let ps = []
    each(ltdt, function (v) {

        //depthCenter
        let depthCenter = pickData(v, 'depth')

        //valueX
        let valueX = pickData(v, pickKey1)

        //check
        if (depthCenter === null) { //因是繪製隨深度指定x值圖, depthCenter不允許null
            return true
        }

        //check
        if (!allowNull) {
            if (valueX === null) { //若valueX允許null則繪製曲線可跳, 若不允許則曲線自動接續
                return true
            }
        }

        //push
        ps.push([depthCenter, valueX]) //因點數過多highcharts會出現errors12, 需改使用浮點數陣列

    })

    //需偵測是否全部valueX為null
    let numNull = 0
    each(ps, (v) => {
        if (!isNumber(v[1])) {
            numNull += 1
        }
    })
    if (numNull === size(ps)) {
        ps = [] //若數據都為null則清空ps, 視為無任何數據
    }

    return ps
}


function extractLtdtDataXY(ltdt, pickKeyX, pickKeyY) {

    //ps
    let ps = []
    each(ltdt, function (v) {

        //valueX
        let valueX = pickData(v, pickKeyX)

        //valueY
        let valueY = pickData(v, pickKeyY)

        //check
        if (valueX === null || valueY === null) { //因須繪製xy值圖, valueX與valueY不允許null
            return true
        }

        //push
        ps.push([valueX, valueY]) //因點數過多highcharts會出現errors12, 需改使用浮點數陣列

    })

    //sortBy
    ps = sortBy(ps, 0) //highcharts需排序

    return ps
}


// function extractData(ltdt, pickKey1, pickKeyY) {
//     let ps = []
//     if (!isestr(pickKeyY)) {
//         //取深度與key1
//         let allowNull = false
//         ps = extractLtdtDepthAndData(ltdt, pickKey1, allowNull)
//     }
//     else {
//         //取key1與key2
//         ps = extractLtdtDataXY(ltdt, pickKey1, pickKeyY)
//     }
//     return ps
// }


export {
    pickData,
    extractLtdtDepthAndData,
    extractLtdtDataXY
    // extractData
}
export default { //整合輸出預設得要有default
    pickData,
    extractLtdtDepthAndData,
    extractLtdtDataXY
    // extractData
}
