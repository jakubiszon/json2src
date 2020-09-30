const fs = require('fs').promises;
const path = require('path');

module.exports = loadFilesRecursive;

/**
 * 
 * @param {String} dir directory to read
 * @returns {String[]} list of files in the directory and subdirectories
 */
async function loadFilesRecursive( dir ) {
    let filelist = [];
    const files = await fs.readdir( dir );

    for(const file of files) {

        const filePath = path.join( dir, file );
        if( (await fs.stat( filePath )).isDirectory() )
            filelist = filelist.concat( await loadFilesRecursive( filePath ) );
        else {
            filelist.push( filePath );
        }
    }

    return filelist;
}

/**
 * 
 * @param {String} prefix 
 * @param  {...String} strList 
 */
function removePrefixDir( prefix, ...strList ) {
    return strList.map( str => str.startsWith( prefix ) ? str.substring( prefix.length ) : str );
}
