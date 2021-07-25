import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'


let fdSrc = './src'
let fdTar = './dist'

rollupFiles({ //rollupFiles預設會clean folder
    fns: 'WGeo.mjs',
    fdSrc,
    fdTar,
    nameDistType: 'kebabCase',
    // bNodePolyfill: true,
    // bMinify: false,
    globals: {
    },
    external: [
    ],
})
    .catch((err) => {
        console.log(err)
    })
