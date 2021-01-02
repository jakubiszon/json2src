const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const folderReader = require('./folder-reader');

module.exports = engineBuilder;

async function getFile( filePath ) {
    const buffer = await fs.readFile( filePath );
    return buffer.toString();
}

/** replaces folder separators to slash */
function normalizePath( input ) {
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
        if( !partialsRoot.endsWith( '/' ) ) partialsRoot += '/';
		partialsRoot = path.normalize(partialsRoot);
        let partialFiles = await folderReader( partialsRoot );
        for( const filePath of partialFiles ) {
            if( !filePath.endsWith('.hbs') ) continue;
            const fileContent = await getFile( filePath );
            let relativePath = filePath.substr( partialsRoot.length );
            relativePath = relativePath.substring(0, relativePath.lastIndexOf('.')) || relativePath;
            relativePath = normalizePath( relativePath );
            localHbs.registerPartial( relativePath, fileContent );
        }
    }

    if( !templateRoot.endsWith( '/' ) ) templateRoot += '/';
	templateRoot = path.normalize(templateRoot);
    let layoutFiles = await folderReader( templateRoot );
    for( const filePath of layoutFiles ) {
        if( !filePath.endsWith('.hbs') ) continue;
        const fileContent = await getFile( filePath );
        let relativePath = filePath.substr( templateRoot.length );
        relativePath = relativePath.substring(0, relativePath.lastIndexOf('.')) || relativePath;
        relativePath = normalizePath( relativePath );
        hbsEngine[ relativePath ] = localHbs.compile( fileContent );
    }

    return hbsEngine;
}
