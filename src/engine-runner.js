const path = require('path');
const fs = require('fs').promises;
const async = require('async');

module.exports = async function( engine, runParameters ) {

	// ensure all needed directories exist
	const directories = Object.keys( engine ).map( getDirectory );
	await createDiectories( directories );

	// for all templates found in "engine", run the processTemplate
	await async.all( Object.keys( engine ), processTemplate );

	async function createDiectories( arrDirectories ) {

		// get unique
		arrDirectories = arrDirectories.filter( onlyUnique );

		// order by length, shortest first
		arrDirectories = arrDirectories.sort( (a,b) => a.length - b.length );

		// create directories
		await async.eachSeries( arrDirectories, async function ( dir ) {
			await fs.mkdir( dir, { recursive: true } );
		});
	}

	/**
	 * 
	 * @param {string} templatekey - key of the template to process 
	 */
	async function processTemplate( templatekey ) {

		// get template function
		var templateFunction = engine[ templatekey ];

		// produce text to save in the file
		var fileContents = templateFunction( runParameters.data );

		// prepare full path used to save the file
		const filename = templatekey.substring( templatekey.lastIndexOf('\/') + 1 );
		const outputFolder = getDirectory( templatekey );
		const separator = filename.startsWith( '.' ) ? '' : '_';
		var filepath = path.join( outputFolder, runParameters.filePrefix + separator + filename );

		// save file
		try {
			console.log( 'saving: ', filepath );
			await fs.writeFile(filepath, fileContents, 'utf8');
		} catch ( err ) {
			console.log('error when saving ' + templatekey, err);
			throw err;
		}
	}

	function getDirectory( localPathAndFilename ) {
		// remove the trailing filename
		const localDirectory = localPathAndFilename.substring(0, localPathAndFilename.lastIndexOf('\/'));

		// append local directory to outputRoot
		return path.join( runParameters.outputRoot, localDirectory );
	}
};

function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}
