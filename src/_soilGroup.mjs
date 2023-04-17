import get from 'lodash/get'
import each from 'lodash/each'
import map from 'lodash/map'
import find from 'lodash/find'
import keys from 'lodash/keys'
import sortBy from 'lodash/sortBy'
import isestr from 'wsemi/src/isestr.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import dig from 'wsemi/src/dig.mjs'
import { getIcInfor } from './_cpt.mjs'


let _kpSoilGroups = null
function getSoilGroups() {

    //core
    let core = () => {

        //soilGroups
        let soilGroups = [
            {
                key: 'sand',
                nameCht: '砂土',
                nameEng: 'Sand',
                nameEngineeringEng: 'SAND',
                group: '粗粒料土壤', //粗粒料土壤: 砂土,粉質砂土,黏質砂土
                colorPrimary: `#467dec`,
                colorSecondary: `#467dec`,
            },
            {
                key: 'silty-sand',
                nameCht: '粉質砂土',
                nameEng: 'Silty-sand',
                nameEngineeringEng: 'SILTY-SAND',
                group: '粗粒料土壤', //粗粒料土壤: 砂土,粉質砂土,黏質砂土
                colorPrimary: `linear-gradient(90deg, #dad74d 0%, #467dec 100%)`,
                colorSecondary: `#00D9A3`,
            },
            {
                key: 'sand/silt',
                nameCht: '砂粉混合土',
                nameEng: 'Sand/Silt',
                nameEngineeringEng: 'SAND/SILT',
                group: '混合土壤', //混合土壤: 砂黏混合土,砂粉混合土
                colorPrimary: `repeating-linear-gradient(90deg, #dad74d 5px, #467dec 10px, #dad74d 15px)`,
                colorSecondary: `#87A7A3`,

            },
            {
                key: 'clayey-sand',
                nameCht: '黏質砂土',
                nameEng: 'Clayey-sand',
                nameEngineeringEng: 'CLAYEY-SAND',
                group: '粗粒料土壤', //粗粒料土壤: 砂土,粉質砂土,黏質砂土
                colorPrimary: `linear-gradient(90deg, #ea4e2d 0%, #467dec 100%)`,
                colorSecondary: `#B973FF`,
            },
            {
                key: 'sand/clay',
                nameCht: '砂黏混合土',
                nameEng: 'Sand/Clay',
                nameEngineeringEng: 'SAND/CLAY',
                group: '混合土壤', //混合土壤: 砂黏混合土,砂粉混合土
                colorPrimary: `repeating-linear-gradient(90deg, #ea4e2d 5px, #467dec 10px, #ea4e2d 15px)`,
                colorSecondary: `#859C78`,
            },
            {
                key: 'sandy-silt',
                nameCht: '砂質粉土',
                nameEng: 'Sandy-silt',
                nameEngineeringEng: 'SANDY-SILT',
                group: '細粒料土壤', //細粒料土壤: 粉土,砂質粉土,黏質粉土,粉質黏土,砂質黏土,黏土,粉黏混合土
                colorPrimary: `linear-gradient(90deg, #467dec 0%, #dad74d 100%)`,
                colorSecondary: `#00D9D9`,
            },
            {
                key: 'silt',
                nameCht: '粉土',
                nameEng: 'Silt',
                nameEngineeringEng: 'SILT',
                group: '細粒料土壤', //細粒料土壤: 粉土,砂質粉土,黏質粉土,粉質黏土,砂質黏土,黏土,粉黏混合土
                colorPrimary: `#dad74d`,
                colorSecondary: `#D9D900`,
            },
            {
                key: 'clayey-silt',
                nameCht: '黏質粉土',
                nameEng: 'Clayey-silt',
                nameEngineeringEng: 'CLAYEY-SILT',
                group: '細粒料土壤', //細粒料土壤: 粉土,砂質粉土,黏質粉土,粉質黏土,砂質黏土,黏土,粉黏混合土
                colorPrimary: `linear-gradient(90deg, #ea4e2d 0%, #dad74d 100%)`,
                colorSecondary: `#FFBF00`,
            },
            {
                key: 'sandy-clay',
                nameCht: '砂質黏土',
                nameEng: 'Sandy-clay',
                nameEngineeringEng: 'SANDY-CLAY',
                group: '細粒料土壤', //細粒料土壤: 粉土,砂質粉土,黏質粉土,粉質黏土,砂質黏土,黏土,粉黏混合土
                colorPrimary: `linear-gradient(90deg, #467dec 0%, #ea4e2d 100%)`,
                colorSecondary: `#2DB200`,
            },
            {
                key: 'silty-clay',
                nameCht: '粉質黏土',
                nameEng: 'Silty-clay',
                nameEngineeringEng: 'SILTY-CLAY',
                group: '細粒料土壤', //細粒料土壤: 粉土,砂質粉土,黏質粉土,粉質黏土,砂質黏土,黏土,粉黏混合土
                colorPrimary: `linear-gradient(90deg, #dad74d 0%, #ea4e2d 100%)`,
                colorSecondary: `#FFDC73`,
            },
            {
                key: 'silt/clay',
                nameCht: '粉黏混合土',
                nameEng: 'Silt/Clay',
                nameEngineeringEng: 'SILT/CLAY',
                group: '細粒料土壤', //細粒料土壤: 粉土,砂質粉土,黏質粉土,粉質黏土,砂質黏土,黏土,粉黏混合土
                colorPrimary: `repeating-linear-gradient(90deg, #dad74d 5px, #ea4e2d 10px, #dad74d 15px`,
                colorSecondary: `#C6BEAC`,
            },
            {
                key: 'clay',
                nameCht: '黏土',
                nameEng: 'Clay',
                nameEngineeringEng: 'CLAY',
                group: '細粒料土壤', //細粒料土壤: 粉土,砂質粉土,黏質粉土,粉質黏土,砂質黏土,黏土,粉黏混合土
                colorPrimary: `#ea4e2d`,
                colorSecondary: `#ea4e2d`,
            },
        ]

        return soilGroups
    }

    if (_kpSoilGroups !== null) {
        return _kpSoilGroups
    }
    _kpSoilGroups = core()
    return _kpSoilGroups
}


function getSoilGroupByKV(key, value, pickKey) {

    //soilGroups
    let soilGroups = getSoilGroups()

    //find
    let r = find(soilGroups, { [key]: value })
    if (!iseobj(r)) {
        r = null
    }

    //pickKey
    if (isestr(pickKey)) {
        r = get(r, pickKey, null)
    }

    return r
}


function sortSoilGroupsByKey(items, key = 'key') {

    //sgs
    let sgs = getSoilGroups()

    //kp
    let kp = {}
    each(sgs, (v, k) => {
        kp[v[key]] = k
    })
    // console.log('kp', kp, 'sgs', sgs)

    if (isearr(items)) {

        //sortBy
        items = sortBy(items, (k) => {
            return kp[k]
        })

    }
    else if (iseobj(items)) {

        //ks
        let ks = keys(items)

        //sortBy
        ks = sortBy(ks, (k) => {
            return kp[k]
        })

        //reorder
        let t = {}
        each(ks, (k) => {
            t[k] = items[k]
        })
        items = t

    }
    else {
        return items
        // throw new Error(`invalid items`)
    }

    return items
}


function getSoilGroupsT4() {

    //useTypes4
    let useTypes4 = ['sand', 'sandy-silt', 'clayey-silt', 'clay']
    useTypes4 = map(useTypes4, (v) => {
        return getSoilGroupByKV('key', v, 'nameEngineeringEng')
    })

    return useTypes4
}


function getSoilGroupsT6() {

    //useTypes6
    let useTypes6 = ['sand', 'silty-sand', 'clayey-sand', 'sandy-silt', 'clayey-silt', 'clay']
    useTypes6 = map(useTypes6, (v) => {
        return getSoilGroupByKV('key', v, 'nameEng')
    })

    return useTypes6
}


function getSoilGroupsT9() {

    //useTypes9
    let useTypes9 = ['sand', 'silty-sand', 'clayey-sand', 'sandy-silt', 'silt', 'clayey-silt', 'sandy-clay', 'silty-clay', 'clay']
    useTypes9 = map(useTypes9, (v) => {
        return getSoilGroupByKV('key', v, 'nameEng')
    })

    return useTypes9
}


function getSoilGroupsIcIcn(k) {

    //check
    if (k !== 'Ic' && k !== 'Icn') {
        throw new Error(`k[${k}] must be Ic or Icn`)
    }

    //getIcInfor
    let icis = getIcInfor()

    //useTypes
    let useTypes = []
    each(icis, (ici) => {
        let key = `${k}(${dig(ici.min, 2)}-${dig(ici.max, 2)})`
        useTypes.push(key)
    })
    // console.log('useTypes', useTypes)

    return useTypes
}


function getSoilGroupsIc() {
    return getSoilGroupsIcIcn('Ic')
}


function getSoilGroupsIcn() {
    return getSoilGroupsIcIcn('Icn')
}


function getKpSoilGroups() {
    let kp = {}

    //soilGroups
    let soilGroups = getSoilGroups()

    //getIcInfor
    let icis = getIcInfor()

    //添加土壤單元與工程土壤單元
    each(['nameEng', 'nameEngineeringEng'], (k) => {
        each(soilGroups, (v) => {
            let key = v[k]
            kp[key] = {
                key,
                ...v,
            }
        })
    })

    //添加Ic值
    each(icis, (ici) => {
        each(['Ic', 'Icn'], (k) => {
            let key = `${k}(${dig(ici.min, 2)}-${dig(ici.max, 2)})`
            kp[key] = {
                key,
                ...ici,
            }
        })
    })
    // console.log('kp', kp)

    return kp
}


export {
    getSoilGroups,
    getSoilGroupByKV,
    sortSoilGroupsByKey,
    getSoilGroupsIc,
    getSoilGroupsIcn,
    getSoilGroupsT4,
    getSoilGroupsT6,
    getSoilGroupsT9,
    getKpSoilGroups
}
export default { //整合輸出預設得要有default
    getSoilGroups,
    getSoilGroupByKV,
    sortSoilGroupsByKey,
    getSoilGroupsIc,
    getSoilGroupsIcn,
    getSoilGroupsT4,
    getSoilGroupsT6,
    getSoilGroupsT9,
    getKpSoilGroups
}
