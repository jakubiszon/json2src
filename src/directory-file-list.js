const fs = require('fs').promises;
const path = require('path');

module.exports = directoryFileList;

/**
 * Returns relative paths of all files within the specified directory.
 * @param {string} directory 
 * @returns {Promise<string[]>}
 */
async function directoryFileList ( directory ) {
    if( !directory.endsWith( '/' )) directory += '/';
    directory = path.normalize( directory );
    let fileList = await loadFilesRecursive( directory );

    return fileList.map( filePath => path.relative( directory, filePath ));
}

/**
 * Returns the list of absolute file paths representing the files nested in direrctory
 * @param {String} directory
 * @returns {Promise<string[]>} list of files in the directory and subdirectories
 */
async function loadFilesRecursive( directory ) {
    let filelist = [];
    const files = await fs.readdir( directory );

    for(const file of files) {

        const filePath = path.join( directory, file );
        if( (await fs.stat( filePath )).isDirectory() )
            filelist = filelist.concat( await loadFilesRecursive( filePath ) );
        else {
            filelist.push( filePath );
        }
    }

    return filelist;
}
