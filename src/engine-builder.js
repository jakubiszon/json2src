const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const directoryFileList = require( './directory-file-list' );

module.exports = engineBuilder;

async function getFile( filePath ) {
    const buffer = await fs.readFile( filePath, {endoding: 'utf-8'} );
    return buffer.toString();
}

/** 
 * Replaces directory separators to slash.
 * This is done to use uniform paths on Windows and Linux.
 */
function useSlashes( input ) {
    return input.replace( /\\/g, "\/" );
}

/**
 * Builds an object storing compiled views using the specified partials and helpers.
 * @param {string} templateRoot directory storing the layouts, subdirectories are included
 * @param {string} [partialsRoot] directory storing the partials, subdirectories are included
 * @param {Object.<string, function>} [helpers] an object mapping the helper functions
 */
async function engineBuilder( templateRoot, partialsRoot, helpers ) {
    let localHbs = handlebars.create();
    let hbsEngine = { };

    if( helpers ) {
        for( const helperName in helpers )
            localHbs.registerHelper( helperName, helpers[ helperName ] );
    }

    if( partialsRoot ) {
        let partialFiles = await directoryFileList( partialsRoot );
        for( const filePath of partialFiles ) {
            if( !filePath.endsWith('.hbs') ) continue;
            const fileContent = await getFile( path.join( partialsRoot, filePath ));
            let relativePath = useSlashes( filePath );
            // remove .hbs extension
            relativePath = relativePath.substring(0, relativePath.lastIndexOf('.')) || relativePath;
            localHbs.registerPartial( relativePath, fileContent );
        }
    }

    let layoutFiles = await directoryFileList( templateRoot );
    for( const filePath of layoutFiles ) {
        if( !filePath.endsWith('.hbs') ) continue;
        const fileContent = await getFile( path.join( templateRoot, filePath ));
        let relativePath = useSlashes( filePath );
        // remove .hbs extension
        relativePath = relativePath.substring(0, relativePath.lastIndexOf('.')) || relativePath;
        hbsEngine[ relativePath ] = localHbs.compile( fileContent );
    }

    return hbsEngine;
}
