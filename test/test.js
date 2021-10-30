const fs = require( 'fs' ).promises;
const path = require( 'path' );
const json2src = require( '../index' );
const assert = require( 'assert' );

describe('json2src', function run() {

	it( 'output file exists', async function () {
		const outputDir = path.join( __dirname, 'output' );
		const filename = path.join( outputDir, 'FILE.txt' );
		const engine = await json2src({ templateRoot: path.join( __dirname, 'templates' ) });
	
		try {
			//await fs.stat( filename );
			await fs.unlink( filename );
		} catch { }

		await engine({
			data: { numbers:[1,2,3] },
			outputRoot : outputDir,
			filePrefix : 'FILE'
		});
	
		const fstats = await fs.stat( filename );
		assert.ok( fstats.isFile() );

		const fileTxt = await fs.readFile( filename, { encoding: 'utf-8' });
		assert.strictEqual( fileTxt, '1,2,3' )
	});
});
