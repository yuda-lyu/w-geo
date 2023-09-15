import calcDepthStartEndByDepth from './calcDepthStartEndByDepth.mjs'


function calcDepthStartEndFromCenter(rows, opt = {}) {
    console.log('Deprecated: calcDepthStartEndFromCenter -> calcDepthStartEndByDepth')
    rows = calcDepthStartEndByDepth(rows, opt)
    return rows
}


export default calcDepthStartEndFromCenter
