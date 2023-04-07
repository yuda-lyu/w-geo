

let _icis = null
function getIcInfor() {

    //core
    let core = () => {
        let r = [
            {
                nameCht: '礫質砂土',
                nameEng: 'Gravelly sand',
                color: 'rgb(173, 215, 255)',
                colorPrimary: '#467dec',
                min: 0,
                max: 1.31,
            },
            {
                nameCht: '砂土-純砂至粉質砂土',
                nameEng: 'Sands-clean sand to silty sand',
                color: 'rgb(193, 233, 247)',
                colorPrimary: 'linear-gradient(90deg, #dad74d 0%, #467dec 100%)',
                min: 1.31,
                max: 2.05,
            },
            {
                nameCht: '混和砂土-粉質砂土至砂質粉土',
                nameEng: 'Sand mixtures-silty sand to sandy silt',
                color: 'rgb(223, 223, 247)',
                colorPrimary: 'linear-gradient(90deg, #467dec 0%, #dad74d 100%)',
                min: 2.05,
                max: 2.60,
            },
            {
                nameCht: '粉土混合物-黏質粉土至粉質黏土',
                nameEng: 'Silt mixtures-clayey silt to silty clay',
                color: 'rgb(253, 223, 225)',
                colorPrimary: 'linear-gradient(90deg, #ea4e2d 0%, #dad74d 100%)',
                min: 2.60,
                max: 2.95,
            },
            {
                nameCht: '黏土',
                nameEng: 'Clays',
                color: 'rgb(253, 203, 207)',
                colorPrimary: '#ea4e2d',
                min: 2.95,
                max: 3.60,
            },
            {
                nameCht: '有機土',
                nameEng: 'Organic soils',
                color: 'rgb(255, 193, 227)',
                colorPrimary: '#ea4e2d',
                min: 3.60,
                max: 99,
            },
        ]
        return r
    }

    if (_icis !== null) {
        return _icis
    }
    _icis = core()
    return _icis
}


export {
    getIcInfor
}
export default { //整合輸出預設得要有default
    getIcInfor
}
