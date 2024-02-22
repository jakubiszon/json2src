const path = require('path');
const fs = require('fs').promises;

const runParameters = require( './run-parameters' );

module.exports = engineRunner

/**
 * @param {Object.<string, function>} engine - a template engine prepared by engine-builder script
 * @param {runParameters} runParameters - specifies data and parameters to run through the template engine
 */
async function engineRunner( engine, runParameters ) {

	const allTemplateKeys = Object.keys( engine )
	const runTemplateKeys = runParameters.isTemplateIncludedCallback ?
		allTemplateKeys.filter( runParameters.isTemplateIncludedCallback ) : allTemplateKeys;

	// ensure all needed directories exist
	const directories = runTemplateKeys.map( getDirectory );
	await createDiectories( directories );

	// for all templates found in "engine", run the processTemplate
	await Promise.all( runTemplateKeys.map( processTemplate ));

	/**
	 * Creates directories needed for all output files.
	 * @param {string[]} directories 
	 */
	async function createDiectories( directories ) {

		// get unique
		directories = directories.filter( onlyUnique );

		// order by length, longest first
		directories = directories.sort( (a,b) => b.length - a.length );

		// remove any directory which starts another one
		directories = directories.filter( dir => !directories.some( other => other !== dir && other.startsWith( dir )));

		for( let idx = 0; idx < directories.length; idx++ ) {
			const dir = directories[ idx ];
			try {
				await fs.mkdir( dir, { recursive: true } );
			} catch {
				// ignore - directory existing or whatever other error
			}

			// we only need to know the directory exists
			let stat = await fs.stat( dir );
			if( !stat.isDirectory() )
				throw new Error( `Directory does not exist ${dir}` );
		}
	}

	/**
	 * 
	 * @param {string} templatekey - key of the template to process
	 */
	async function processTemplate( templatekey ) {

		// produce text to save in the file
		let fileContents;
		try {
			// get template function
			var templateFunction = engine[ templatekey ];

			fileContents = templateFunction( runParameters.data );
		} catch ( err ) {
			if( runParameters.consoleOutput ) console.log('error when processing ' + templatekey, err);
			throw err;
		}

		// prepare full path used to save the file
		const filename = templatekey.substring( templatekey.lastIndexOf('\/') + 1 );
		const outputFolder = getDirectory( templatekey );
		var filepath = path.join( outputFolder, getFileName( runParameters.filePrefix, filename ) );

		// save file
		try {
			if( runParameters.consoleOutput ) console.log( 'saving: ', filepath );
			await fs.writeFile(filepath, fileContents, 'utf8');
		} catch ( err ) {
			if( runParameters.consoleOutput ) console.log('error when saving ' + templatekey, err);
			throw err;
		}
	}

	function getDirectory( localPathAndFilename ) {
		// remove the trailing filename
		const localDirectory = localPathAndFilename.substring(0, localPathAndFilename.lastIndexOf('\/') + 1 );

		// append local directory to outputRoot
		return path.join( runParameters.outputRoot, localDirectory );
	}
};

function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}

/**
 * Returns the name of the file produced using user-defined prefix of function.
 * @param {string | function(string):string} prefixOrFunc 
 * @param {string} filename 
 * @returns 
 */
function getFileName( prefixOrFunc, filename ) {
	if( typeof prefixOrFunc === 'function' )
		return prefixOrFunc( filename );

	if( !prefixOrFunc )
		return filename;
	
	const separator = filename.startsWith( '.' ) ? '' : '_';
	return prefixOrFunc + separator + filename;
}
