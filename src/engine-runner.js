const path = require('path');
const fs = require('fs').promises;


module.exports = async function( engine, { data, outputRoot, filePrefix, consoleOutput } ) {

	// ensure all needed directories exist
	const directories = Object.keys( engine ).map( getDirectory );
	await createDiectories( directories );

	// for all templates found in "engine", run the processTemplate
	const keys = Object.keys(engine);
	await Promise.all( keys.map( processTemplate ));

	async function createDiectories( arrDirectories ) {

		// get unique
		arrDirectories = arrDirectories.filter( onlyUnique );

		// order by length, shortest first
		arrDirectories = arrDirectories.sort( (a,b) => a.length - b.length );

		for( let idx = 0; idx < arrDirectories.length; idx++ ) {
			const dir = arrDirectories[ idx ];
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

			fileContents = templateFunction( data );
		} catch ( err ) {
			if( consoleOutput ) console.log('error when processing ' + templatekey, err);
			throw err;
		}

		// prepare full path used to save the file
		const filename = templatekey.substring( templatekey.lastIndexOf('\/') + 1 );
		const outputFolder = getDirectory( templatekey );
		var filepath = path.join( outputFolder, getFileName( filePrefix, filename ) );

		// save file
		try {
			if( consoleOutput ) console.log( 'saving: ', filepath );
			await fs.writeFile(filepath, fileContents, 'utf8');
		} catch ( err ) {
			if( consoleOutput ) console.log('error when saving ' + templatekey, err);
			throw err;
		}
	}

	function getDirectory( localPathAndFilename ) {
		// remove the trailing filename
		const localDirectory = localPathAndFilename.substring(0, localPathAndFilename.lastIndexOf('\/'));

		// append local directory to outputRoot
		return path.join( outputRoot, localDirectory );
	}
};

function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}

function getFileName( prefixOrFunc, filename ) {
	if( typeof prefixOrFunc === 'function' )
		return prefixOrFunc( filename );

	if( !prefixOrFunc )
		return filename;
	
	const separator = filename.startsWith( '.' ) ? '' : '_';
	return prefixOrFunc + separator + filename;
}
