const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const engineParameters = require( './engine-parameters' );
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
 * @param {engineParameters} engineParameters object defining templates, partials and helpers
 * @returns {Object.<string, function>} an object mapping each template key to a compiled handlebars function
 */
async function engineBuilder( engineParameters ) {

    if( typeof engineParameters.templateRoot !== 'string' ) throw 'engineParameters.templateRoot must be a string';
    if( !engineParameters.templateRoot ) throw 'engineParameters.templateRoot must have a value';

    let localHbs = handlebars.create();
    let templateMap = { };

    if( engineParameters.helpers ) {
        for( const helperName in engineParameters.helpers )
            localHbs.registerHelper( helperName, engineParameters.helpers[ helperName ] );
    }

    if( engineParameters.partialsRoot ) {
        let partialFiles = await directoryFileList( engineParameters.partialsRoot );
        for( const filePath of partialFiles ) {
            if( !filePath.endsWith('.hbs') ) continue;
            const fileContent = await getFile( path.join( engineParameters.partialsRoot, filePath ));
            let relativePath = useSlashes( filePath );
            // remove .hbs extension
            relativePath = relativePath.substring(0, relativePath.lastIndexOf('.')) || relativePath;
            localHbs.registerPartial( relativePath, fileContent );
        }
    }

    let layoutFiles = await directoryFileList( engineParameters.templateRoot );
    for( const filePath of layoutFiles ) {
        if( !filePath.endsWith('.hbs') ) continue;
        const fileContent = await getFile( path.join( engineParameters.templateRoot, filePath ));
        let relativePath = useSlashes( filePath );
        // remove .hbs extension
        relativePath = relativePath.substring(0, relativePath.lastIndexOf('.')) || relativePath;
        templateMap[ relativePath ] = localHbs.compile( fileContent );
    }

    return templateMap;
}
