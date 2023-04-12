import each from 'lodash/each'
import map from 'lodash/map'
import get from 'lodash/get'
import size from 'lodash/size'
import isNumber from 'lodash/isNumber'
import max from 'lodash/max'
import flattenDeep from 'lodash/flattenDeep'
// import cloneDeep from 'lodash/cloneDeep'
import dig from 'wsemi/src/dig.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isint from 'wsemi/src/isint.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import cint from 'wsemi/src/cint.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import getConvertLocByChart from 'w-highcharts/src/getConvertLocByChart.mjs'
import renderNoDataByChart from 'w-highcharts/src/renderNoDataByChart.mjs'
import getMarker from 'w-highcharts/src/getMarker.mjs'
import getColor from 'w-highcharts/src/getColor.mjs'
import { genHtText, genHtTextSub, genTextParentheses, getFontfamily } from './_hc.mjs'
import { getIcInfor } from './_cpt.mjs'
import { extractLtdtDepthAndData } from './_share.mjs'


function getOption(optParam = {}) {

    //dataPoints
    let dataPoints = get(optParam, 'dataPoints', [])
    let dataPointsColor = get(optParam, 'dataPointsColor', undefined)
    let dataPointsMarkerSize = get(optParam, 'dataPointsMarkerSize', undefined)
    let dataPointsMultiSeries = get(optParam, 'dataPointsMultiSeries', undefined) //若為多數據時, 各數據格式為{name:名稱,data:陣列數據}

    //margin
    let marginTop = get(optParam, 'marginTop', 70) //影響legend position
    let marginBottom = get(optParam, 'marginBottom', 10) //影響legend position
    let marginLeft = get(optParam, 'marginLeft', 90) //影響legend position
    let marginRight = get(optParam, 'marginRight', 1) //影響legend position, 1px時可能會出現右邊框消失問題

    let yLabel = get(optParam, 'xLabel', '')
    let yLabelFontSize = get(optParam, 'xLabelFontSize', 12)
    let yTickLabelFontSize = get(optParam, 'xTickLabelFontSize', 9)
    // let yUnit = get(optParam, 'xUnit', '') //於調用處已併入label故不使用
    let yDig = get(optParam, 'xDig', undefined)
    let yLimMin = get(optParam, 'xLimMin', undefined)
    let yLimMax = get(optParam, 'xLimMax', undefined)
    let ySoftMin = get(optParam, 'xSoftMin', undefined)
    let ySoftMax = get(optParam, 'xSoftMax', undefined)
    let yTickInterval = get(optParam, 'xTickInterval', undefined)
    let xLabel = get(optParam, 'yLabel', '')
    let xLabelFontSize = get(optParam, 'yLabelFontSize', 12)
    let xTickLabelFontSize = get(optParam, 'yTickLabelFontSize', 9)
    // let xUnit = get(optParam, 'yUnit', '') //於調用處已併入label故不使用
    let xDig = get(optParam, 'yDig', undefined)
    let xLimMin = get(optParam, 'yLimMin', 0) //深度最小預設為0
    let xLimMax = get(optParam, 'yLimMax', undefined)
    let xSoftMax = get(optParam, 'ySoftMax', undefined)
    yTickLabelFontSize = 12
    xTickLabelFontSize = 12

    let condenseXLabel = get(optParam, 'condenseYLabel', false) //外部y代表深度
    let displayDataMode = get(optParam, 'displayDataMode', 'line')
    let useLegend = get(optParam, 'useLegend', false)
    let useTooltip = get(optParam, 'useTooltip', true)
    let addStaticPP = get(optParam, 'addStaticPP', false)
    let addIcRanges = get(optParam, 'addIcRanges', false)

    //margin
    let margin = {
        marginTop,
        marginBottom,
        marginLeft: condenseXLabel ? 1 : marginLeft,
        marginRight,
    }

    //ltseries
    let ltseries = []

    //noData
    let noData = true
    each(dataPoints, (v, i) => {
        if (size(v.data) > 0) {
            noData = false
            return false
        }
    })
    if (noData) {

        //default data
        dataPoints = [[[0, 0]]]

        //close tooltip, 滑鼠移至隱藏點還是會跳出tooltip得關閉
        useTooltip = false
        useLegend = false

    }

    //add dataPoints
    each(dataPoints, (v, i) => {
        // console.log(i, 'v', v)

        //mode
        let mode = get(v, 'mode', '')

        //s
        let s = null

        //auto
        if (mode === '') {

            //colorIndex
            let colorIndex = i
            if (isint(get(v, 'colorIndex'))) {
                colorIndex = cint(v.colorIndex)
            }

            //getConvertLocByChart
            s = getConvertLocByChart(displayDataMode, v.name, v.data, colorIndex)

            //dataPointsColor
            if (isestr(dataPointsColor)) {
                s.marker.fillColor = dataPointsColor
            }

            //dataPointsMarkerSize
            if (isnum(dataPointsMarkerSize)) {
                s.marker.radius = cdbl(dataPointsMarkerSize)
            }

            //dataPointsMultiSeries
            if (dataPointsMultiSeries) {
                s.marker.symbol = getMarker(i).symbol
                s.marker.fillColor = getColor(i)
            }

            //compare
            if (get(v, 'compare')) {
                s.marker.radius -= 1 //樣本尺寸減小
                s.marker.fillColor = 'transparent' //透明
                s.marker.lineColor = 'rgba(0,0,0,0.5)' //線改半透明灰色
            }

        }
        else if (mode === 'custom') {
            s = v
        }
        else {
            throw new Error(`invalid mode[${mode}]`)
        }

        //check
        if (iseobj(s)) {

            //push
            ltseries.push(s)

        }

        // //s
        // let s = getConvertLocByChart(displayDataMode, v.name, v.data)

        // //noData
        // if (noData) {
        //     s.lineWidth = 0
        //     s.marker.enabled = false
        // }

        // //push
        // ltseries.push(s)

    })

    //xSoftMax, 有給予xSoftMax就直接使用, 若未給予xLimMax才自動計算xSoftMax
    if (!isNumber(xSoftMax) && !isNumber(xLimMax)) {
        let psx = map(ltseries, (v) => {
            return map(v.data, 0)
        })
        psx = flattenDeep(psx)
        let psxMax = max(psx)
        xSoftMax = psxMax * 1.5
    }

    //ySoftMax, 有給予ySoftMax就直接使用, 若未給予yLimMax才自動計算ySoftMax
    if (!isNumber(ySoftMax) && !isNumber(yLimMax)) {
        let psy = map(ltseries, (v) => {
            return map(v.data, 1)
        })
        psy = flattenDeep(psy)
        let psyMax = max(psy)
        ySoftMax = psyMax * 1.5
    }

    //addStaticPP
    if (addStaticPP) {

        //xmax
        let xmax
        if (isNumber(xLimMax)) {
            xmax = xLimMax
        }
        else if (isNumber(xSoftMax)) {
            xmax = xSoftMax
        }
        else {
            let psx = map(ltseries, (v) => {
                // return map(v.data, 'x', null) //因需加速故點改為陣列
                // return map(v.data, '1', null) //因需加速故點改為陣列
                return map(v.data, '0', null) //因需加速故點改為陣列
            })
            psx = flattenDeep(psx)
            xmax = max(psx)
        }

        //ppmax, 水假設單位重1(t/m3)
        let ppmax = xmax * 1 * (1000 * 9.81 / 1e6) //MPa

        //s
        let s = {
            name: 'static pp', //預設沒開啟legend故不會顯示
            data: [[0, 0], [xmax, ppmax]],
            lineWidth: 2,
            color: '#f26',
            marker: {
                enabled: false,
            },
        }

        //push
        ltseries.push(s)

    }

    //useYGridLine, yPlotBands
    let useYGridLine = true
    let yPlotBands
    let yPlotLines
    if (addIcRanges) {
        useYGridLine = false
        let icis = getIcInfor()
        yPlotBands = map(icis, (ici) => {
            return {
                from: ici.min,
                to: ici.max,
                color: ici.color,
                borderColor: 'rgba(255,255,255,0.5)',
                borderWidth: 1,
            }
        })
        // yPlotLines = map(icis, (ici) => {
        //     return {
        //         dashStyle: 'Solid',
        //         value: ici.max,
        //         width: 10,
        //         color: 'black',
        //     }
        // })
    }

    //options
    let options = {

        credits: {
            enabled: false //不顯示highchart icon
        },

        navigation: {
            buttonOptions: {
                enabled: false //若有引用export.js時關閉匯出按鈕
            }
        },

        boost: {
            enabled: false, //深度圖需關閉
            // useGPUTranslations: true,
        },

        chart: {
            animation: false, //關閉初始動畫
            inverted: true,
            //zoomType: 'xy',
            ...margin,
            backgroundColor: 'transparent',
            plotBorderColor: '#222',
            plotBorderWidth: 1,
            events: {
                render: function () {
                    let chart = this

                    if (noData) {
                        let invXY = true
                        renderNoDataByChart(chart, { invXY })
                    }

                },
            },
        },

        plotOptions: {
            series: {
                animation: false, //關閉初始動畫
            },
        },

        title: {
            text: '',
        },

        xAxis: {
            crosshair: true,
            // opposite: true,
            title: {
                useHTML: true,
                text: xLabel,
                margin: 5,
                style: {
                    fontFamily: getFontfamily(),
                    fontSize: xLabelFontSize + 'pt',
                    color: '#000',
                    textAlign: 'center',
                    lineHeight: '1.1rem',
                }
            },
            // reversed: true,
            // type: 'logarithmic',

            // minRange: 1,

            lineColor: 'rgba(0,0,0,0.8)',
            lineWidth: 1,

            // tickAmount: 10,
            // tickInterval: xTickInterval,
            gridLineColor: 'rgba(0,0,0,0.2)',
            gridLineWidth: 1,

            // minorTickInterval: 1,
            minorGridLineColor: 'rgba(0,0,0,0.1)',
            minorGridLineWidth: 0,

            tickPosition: 'inside',
            tickColor: '#222',
            tickWidth: 1,

            minorTickPosition: 'inside',
            minorTickColor: '#666',
            minorTickLength: 5,
            minorTickWidth: 1,

            softMax: xSoftMax,

            labels: {
                autoRotation: 0,
                // distance: 50,
                // padding: 0,
                // y: -10,
                style: {
                    fontSize: xTickLabelFontSize + 'px',
                    color: '#222',
                },
                formatter: function() {
                    if (isNumber(xDig)) {
                        return dig(this.value, xDig)
                    }
                    return this.value
                },
            },

            // tickPositioner: function () { //若有監聽tickPositioner會調用2次
            //     // console.log('x tickPositioner')
            //     yDigTrans = getDigFromTickPositions(this.tickPositions)
            // },

        },

        yAxis: {
            crosshair: true,
            opposite: true,
            title: {
                useHTML: true,
                text: yLabel,
                margin: 0,
                // x: -10,
                y: 15,
                style: {
                    fontFamily: getFontfamily(),
                    fontSize: yLabelFontSize + 'pt',
                    color: '#000',
                    textAlign: 'center',
                    lineHeight: '1.1rem',
                },
            },
            // reversed: true,
            // type: 'logarithmic',

            // minRange: 1,

            plotBands: yPlotBands,
            plotLines: yPlotLines,

            lineColor: 'rgba(0,0,0,0.8)',
            lineWidth: 1,

            // tickAmount: 10,
            // tickInterval: 10,
            tickInterval: yTickInterval,
            gridLineColor: 'rgba(0,0,0,0.2)',
            gridLineWidth: useYGridLine ? 1 : 0,

            // minorTickInterval: 1,
            minorGridLineColor: 'rgba(0,0,0,0.1)',
            minorGridLineWidth: 0,

            tickPosition: 'inside',
            tickColor: '#222',
            tickWidth: 1,

            minorTickPosition: 'inside',
            minorTickColor: '#666',
            minorTickLength: 5,
            minorTickWidth: 1,

            softMin: ySoftMin,
            softMax: ySoftMax,

            // tickAmount: 3,

            labels: {
                autoRotation: 0,
                // overflow: 'allow', //會遮蔽造成無法辨識數字
                // distance: 50,
                // padding: 0,
                y: -10,
                style: {
                    fontSize: yTickLabelFontSize + 'px',
                    color: '#222',
                },
                formatter: function() {
                    if (isNumber(yDig)) {
                        return dig(this.value, yDig)
                    }
                    return this.value
                },
            },

            // tickPositioner: function () { //若有監聽tickPositioner會調用2次
            //     // console.log('y tickPositioner')
            //     yDigTrans = getDigFromTickPositions(this.tickPositions)
            // },

        },

        tooltip: {
            enabled: false,
        },

        legend: {
            enabled: false,
        },

        series: ltseries,

    }

    if (isNumber(xLimMin)) {
        options.xAxis.min = xLimMin
        options.xAxis.endOnTick = false
    }
    if (isNumber(xLimMax)) {
        options.xAxis.max = xLimMax
        options.xAxis.endOnTick = false
    }

    if (isNumber(yLimMin)) {
        options.yAxis.min = yLimMin
        options.yAxis.endOnTick = false
    }
    if (isNumber(yLimMax)) {
        options.yAxis.max = yLimMax
        options.yAxis.endOnTick = false
    }

    //useLegend
    if (useLegend) {
        options.legend = {
            enabled: true,
            shared: true,
            useHTML: true,
            floating: true,
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'bottom',
            x: -10,
            y: -10,
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderColor: '#aaa',
            borderWidth: 1,
            symbolWidth: 25,
        }
    }

    //useTooltip
    if (useTooltip) {
        options.tooltip = {
            enabled: true,
            shared: true,
            useHTML: true,
        }
    }
    // console.log('options', JSON.stringify(options))

    return options
}


async function getCptDepthHcOpt(dataCPT, retKind = '', optParam = {}) {

    //optParam
    // let groupNameCht = get(optParam, 'groupNameCht', '')
    // let groupNameEng = get(optParam, 'groupNameEng', undefined)
    let xLabelPre = get(optParam, 'xLabelPre', '')
    let useXLabelChtAndEng = get(optParam, 'useXLabelChtAndEng', true)
    // let xLabelCht = get(optParam, 'xLabelCht', '')
    // let xLabelEng = get(optParam, 'xLabelEng', undefined)
    // let xUnit = get(optParam, 'xUnit', undefined)
    // let xDig = get(optParam, 'xDig', undefined)
    // let xLimMin = get(optParam, 'xLimMin', undefined)
    // let xLimMax = get(optParam, 'xLimMax', undefined)
    let useXYLabelEng = get(optParam, 'useXYLabelEng', true)
    let useYLabel = get(optParam, 'useYLabel', true)
    let yLabelCht = get(optParam, 'yLabelCht', '海床下深度')
    let yLabelEng = get(optParam, 'yLabelEng', 'Depth below seabed')
    let yLabelTextSizeCht = get(optParam, 'yLabelTextSizeCht', 12)
    let yLabelTextSizeEng = get(optParam, 'yLabelTextSizeEng', 10)
    let yUnit = get(optParam, 'yUnit', 'm')
    let yDig = get(optParam, 'yDig', undefined)
    let yLimMin = get(optParam, 'yLimMin', undefined)
    let yLimMax = get(optParam, 'yLimMax', undefined)

    //groupName
    // let groupName = fmtText(groupNameCht)
    // if (groupNameEng) {
    //     groupName += genHtTextSub(groupNameEng, 10)
    // }

    //legendName
    // let legendName = fmtText(groupNameCht)
    // if (groupNameEng) {
    //     legendName += `(${fmtText(groupNameEng)})`
    // }

    //yLabel
    let yLabel = ''
    if (useYLabel) {
        if (isestr(yLabelCht)) {
            if (isestr(yUnit)) {
                yLabel += genHtText(yLabelCht + genTextParentheses(yUnit), yLabelTextSizeCht)
            }
            else {
                yLabel += genHtText(yLabelCht, yLabelTextSizeCht)
            }
        }
        if (useXYLabelEng && yLabelEng) {
            yLabel += genHtTextSub(yLabelEng + genTextParentheses(yUnit), yLabelTextSizeEng)
        }
    }

    async function core(ltdt, key, optExt = {}) {

        //optExt
        let xLabelPre = get(optExt, 'xLabelPre', '')
        let xLabelCht = get(optExt, 'xLabelCht', '')
        let xLabelEng = get(optExt, 'xLabelEng', undefined)
        let xLabelTextSizePre = get(optExt, 'xLabelTextSizePre', 14)
        let xLabelTextSizeCht = get(optExt, 'xLabelTextSizeCht', 12)
        let xLabelTextSizeEng = get(optExt, 'xLabelTextSizeEng', 10)
        let xUnit = get(optExt, 'xUnit', undefined)

        //useXLabelChtAndEng
        if (!useXLabelChtAndEng) {
            xLabelCht = ''
            xLabelEng = ''
        }

        //xLabel
        let xLabel = ''
        if (isestr(xLabelPre)) {
            xLabel += genHtText(xLabelPre, xLabelTextSizePre) + '<br>'
        }
        if (isestr(xLabelCht)) {
            if (isestr(xUnit)) {
                xLabel += genHtText(xLabelCht + genTextParentheses(xUnit), xLabelTextSizeCht)
            }
            else {
                xLabel += genHtText(xLabelCht, xLabelTextSizeCht)
            }
        }
        if (useXYLabelEng && isestr(xLabelEng)) {
            xLabel += genHtTextSub(xLabelEng + genTextParentheses(xUnit), xLabelTextSizeEng)
        }

        //extractLtdtDepthAndData
        let allowNull = true //允許保存null使繪圖曲線有跳點
        let ps = extractLtdtDepthAndData(ltdt, key, allowNull)

        //dataPoints, 先提供本次數據, 日後擴充過去數據
        let dataPoints = [{
            name: '',
            data: ps,
        }]

        //getOption
        let opt = getOption({ ...optParam, ...optExt, dataPoints, xLabel, yUnit, yDig, yLimMin, yLimMax })

        return opt
    }

    //optRes, 現共有12總
    let optRes = null
    if (retKind === 'qc') {
        optRes = await core(dataCPT, 'qc', { yLabel, xLabelPre, xLabelCht: '錐尖阻抗 q<sub>c</sub>', xLabelEng: 'Cone resistance', xUnit: 'MPa', xLimMin: 0, xSoftMax: 30, xTickInterval: 10 })
    }
    else if (retKind === 'qt') {
        optRes = await core(dataCPT, 'qt', { yLabel, xLabelPre, xLabelCht: '校正錐尖阻抗 q<sub>t</sub>', xLabelEng: 'Corrected cone resistance', xUnit: 'MPa', xLimMin: 0, xSoftMax: 30 })
    }
    else if (retKind === 'qnet') {
        optRes = await core(dataCPT, 'qnet', { yLabel, xLabelPre, xLabelCht: '淨校正錐尖阻抗 q<sub>net</sub>', xLabelEng: 'Net corrected cone resistance', xUnit: 'MPa', xLimMin: 0, xSoftMax: 30 })
    }
    else if (retKind === 'Qt') {
        optRes = await core(dataCPT, 'Qt', { yLabel, xLabelPre, xLabelCht: '正規化錐尖阻抗 Q<sub>t</sub>', xLabelEng: 'Normalized cone resistance Q<sub>t</sub>', xUnit: '', xLimMin: 0, xLimMax: 150 })
    }
    else if (retKind === 'Qtn') {
        optRes = await core(dataCPT, 'Qtn', { yLabel, xLabelPre, xLabelCht: '正規化錐尖阻抗 Q<sub>tn</sub>', xLabelEng: 'Normalized cone resistance Q<sub>tn</sub>', xUnit: '', xLimMin: 0, xLimMax: 150 })
    }
    else if (retKind === 'fs') {
        optRes = await core(dataCPT, 'fs', { yLabel, xLabelPre, xLabelCht: '摩擦應力 f<sub>s</sub>', xLabelEng: 'Sleeve friction', xUnit: 'MPa', xLimMin: 0, xSoftMax: 1.2, xTickInterval: 0.2 })
    }
    else if (retKind === 'Rf') {
        optRes = await core(dataCPT, 'Rf', { yLabel, xLabelPre, xLabelCht: '摩擦比 R<sub>f</sub>', xLabelEng: 'Friction ratio', xUnit: '%', xLimMin: 0, xSoftMax: 8, xTickInterval: 2 })
    }
    else if (retKind === 'Fr') {
        optRes = await core(dataCPT, 'Fr', { yLabel, xLabelPre, xLabelCht: '正規化摩擦比 F<sub>r</sub>', xLabelEng: 'Normalized friction ratio', xUnit: '%', xLimMin: 0, xSoftMax: 8, xTickInterval: 2 })
    }
    else if (retKind === 'u2') {
        optRes = await core(dataCPT, 'u2', { yLabel, xLabelPre, xLabelCht: '孔隙水壓 u<sub>2</sub>', xLabelEng: 'Pore pressure', xUnit: 'MPa', addStaticPP: true })
    }
    else if (retKind === 'Bq') {
        optRes = await core(dataCPT, 'Bq', { yLabel, xLabelPre, xLabelCht: '超額孔隙水壓比 B<sub>q</sub>', xLabelEng: 'Pore pressure ratio', xUnit: '', xLimMin: -1, xLimMax: 3 })
    }
    else if (retKind === 'Ic') {
        optRes = await core(dataCPT, 'Ic', { yLabel, xLabelPre, xLabelCht: '土壤行為分類指數 I<sub>c</sub>', xLabelEng: 'Soil behaviour type index', xUnit: '', xLimMin: 1, xLimMax: 5, xTickInterval: 1, addIcRanges: true })
    }
    else if (retKind === 'Icn') {
        optRes = await core(dataCPT, 'Icn', { yLabel, xLabelPre, xLabelCht: '土壤行為分類指數 I<sub>cn</sub>', xLabelEng: 'Soil behaviour type index', xUnit: '', xLimMin: 1, xLimMax: 5, xTickInterval: 1, addIcRanges: true })
    }
    else if (retKind === 'Rob:Bq-qt') {
        optRes = await core(dataCPT, 'iRobBqqt', { yLabel, xLabelPre, xLabelCht: 'Robertson B<sub>q</sub>-q<sub>t</sub>', xLabelEng: 'Zone index', xUnit: '', xLimMin: 0, xLimMax: 14, displayDataMode: 'dot point' })
    }
    else if (retKind === 'Rob:Rf-qt') {
        optRes = await core(dataCPT, 'iRobRfqt', { yLabel, xLabelPre, xLabelCht: 'Robertson R<sub>f</sub>-q<sub>t</sub>', xLabelEng: 'Zone index', xUnit: '', xLimMin: 0, xLimMax: 14, displayDataMode: 'dot point' })
    }
    else if (retKind === 'Rob:Bq-Qt') {
        optRes = await core(dataCPT, 'iRobBqQt', { yLabel, xLabelPre, xLabelCht: 'Robertson B<sub>q</sub>-Q<sub>t</sub>', xLabelEng: 'Zone index', xUnit: '', xLimMin: 0, xLimMax: 10, displayDataMode: 'dot point' })
    }
    else if (retKind === 'Rob:Bq-Qtn') {
        optRes = await core(dataCPT, 'iRobBqQtn', { yLabel, xLabelPre, xLabelCht: 'Robertson B<sub>q</sub>-Q<sub>tn</sub>', xLabelEng: 'Zone index', xUnit: '', xLimMin: 0, xLimMax: 10, displayDataMode: 'dot point' })
    }
    else if (retKind === 'Rob:Fr-Qt') {
        optRes = await core(dataCPT, 'iRobFrQt', { yLabel, xLabelPre, xLabelCht: 'Robertson F<sub>r</sub>-Q<sub>t</sub>', xLabelEng: 'Zone index', xUnit: '', xLimMin: 0, xLimMax: 10, displayDataMode: 'dot point' })
    }
    else if (retKind === 'Rob:Fr-Qtn') {
        optRes = await core(dataCPT, 'iRobFrQtn', { yLabel, xLabelPre, xLabelCht: 'Robertson F<sub>r</sub>-Q<sub>tn</sub>', xLabelEng: 'Zone index', xUnit: '', xLimMin: 0, xLimMax: 10, displayDataMode: 'dot point' })
    }
    else if (retKind === 'Ram:Bq-Qt') {
        optRes = await core(dataCPT, 'iRamBqQt', { yLabel, xLabelPre, xLabelCht: 'Ramsey B<sub>q</sub>-Q<sub>t</sub>', xLabelEng: 'Zone index', xUnit: '', xLimMin: 0, xLimMax: 10, displayDataMode: 'dot point' })
    }
    else if (retKind === 'Ram:Fr-Qt') {
        optRes = await core(dataCPT, 'iRamFrQt', { yLabel, xLabelPre, xLabelCht: 'Ramsey F<sub>r</sub>-Q<sub>t</sub>', xLabelEng: 'Zone index', xUnit: '', xLimMin: 0, xLimMax: 10, displayDataMode: 'dot point' })
    }
    else {
        throw new Error(`invalid retKind[${retKind}]`)
    }

    return optRes
}


export default getCptDepthHcOpt
