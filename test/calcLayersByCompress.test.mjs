import assert from 'assert'
import _ from 'lodash-es'
import w from 'wsemi'
import calcCptUnitWeight from '../src/calcCptUnitWeight.mjs'
import { calcCpt } from '../src/calcCpt.mjs'
import { simplifyRobertson2009 } from '../src/calcCptClassify.mjs'
import calcLayersByCompress from '../src/calcLayersByCompress.mjs'
import _rowsIn from './calcLayersByCompress-rowsIn.json' assert { type: "json" }
import _rowsOut from './calcLayersByCompress-rowsOut.json' assert { type: "json" }


describe(`calcLayersByCompress`, function() {
    let rowsIn = _rowsIn

    //numMaxLayers
    let numMaxLayers = 20

    //optDef
    let optDef = {
        rsatIni: 19.5,
        coe_a: 0.75,
        unitSvSvp: 'MPa',
    }

    //optUnitWeight
    let optUnitWeight = {
        ...optDef,
        method: 'Lunne(1997) for Robertson stress exponent',
    }

    //calcCptUnitWeight
    rowsIn = calcCptUnitWeight(rowsIn, optUnitWeight)

    //optCpt
    let optCpt = {
        ...optDef,
        methodIterate: 'basic', //basic, binarySearch
        methodSmooth: 'none', //測試數據已使用averageIn95
        intrpSv: (depth, k, v, ltdt) => {
            // console.log('intrpSv', depth, k, v)
            let sv = v.sv //單位為MPa
            return {
                sv,
            }
        },
        // let rpU0: (depth, k, v, ltdt) => {
        // },
        unitSvSvp: 'MPa',
    }

    //calcCpt
    rowsIn = calcCpt(rowsIn, optCpt)
    // console.log('rowsIn[0](calcCpt)',rowsIn[0])

    if (true) {

        //simplifyRobertson2009
        rowsIn = _.map(rowsIn, (v, k) => {
            let type = simplifyRobertson2009(v.iRobFrQtn, null, { numOfType: 6, returnZone: true })
            v.type = w.cint(type) //表層無type則使用0
            return v
        })

    }

    //添加輔助合併分層參數
    rowsIn = _.map(rowsIn, (v) => {

        //typeIcn
        let typeIcn = 0
        if (v.Icn <= 2.05) {
            typeIcn = 6
        }
        else if (v.Icn <= 2.60) {
            typeIcn = 5
        }
        else if (v.Icn <= 2.95) {
            typeIcn = 4
        }
        else {
            typeIcn = 3
        }
        v.typeIcn = typeIcn

        //type2
        let type2 = v.type <= 4.5 ? 3 : 6
        v.type2 = type2

        //type3
        let type3 = 0
        if (v.type <= 3) {
            type3 = 3
        }
        else if (v.type <= 5) {
            type3 = 4.5
        }
        else {
            type3 = 6
        }
        v.type3 = type3

        //type4
        let type4 = 0
        if (v.type <= 3) {
            type4 = 3
        }
        else if (v.type <= 4) {
            type4 = 4
        }
        else if (v.type <= 5) {
            type4 = 5
        }
        else {
            type4 = 6
        }
        v.type4 = type4

        return v
    })

    //calcLayersByCompress
    let optCompress = {
        keyType: 'type',
        keyMgType: 'type',
        keyMgType2: 'type2',
        keyMgType3: 'type3',
        keyMgType4: 'type4',
        keyMgTypeIcn: 'typeIcn',
        keyMgValueIcn: 'Icn',
        numMaxLayers,
        baseOnOriginalLayers: false, //true false
    }

    it(`should return rowsOut when calcLayersByCompress(rowsIn, ${JSON.stringify(optCompress)})`, function() {
        let r = calcLayersByCompress(rowsIn, optCompress)
        let rr = _rowsOut
        assert.strict.deepStrictEqual(r, rr)
    })

})
