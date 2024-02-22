const fs = require( 'fs' ).promises;
const path = require( 'path' );
const json2src = require( '../index' );
const assert = require( 'assert' );

const outputDir = path.join( __dirname, 'output' );

describe( 'json2src', function run() {

	before( prepareEnvironment );
	it( 'creates output file for simple template', createsOutputFilesForSimpleTemplate );
	it( 'creates output structure for complex template', createsOutputStructureForComplexTemplate );
	it( 'includes template names in keys property', includesTemplateNamesInKeysProperty );
	it( 'calls isTemplateIncludedCallback callback and kips files', callIsTemplateIncludedCallback );
	it( 'renamed output file with callback', renamedOutputFile );

});

async function prepareEnvironment() {
	await removeTestOutput();
	await buildOutputWithTwoCatalogs();
}

/**
 * Removes of all output files that already exist.
 */
async function removeTestOutput() {
	// get all paths in the output except the .gitignore
	const outputRelativePaths = (await fs.readdir( outputDir )).filter( p => !p.endsWith( '.gitignore' ));
	const locallyRelativePaths = outputRelativePaths.map( p => path.join( outputDir, p ));
	//console.log( locallyRelativePaths );
	const removePromises = locallyRelativePaths.map( p => fs.rm( p, { recursive: true }));
	await Promise.all( removePromises );
}

async function buildOutputWithTwoCatalogs() {
	const engine = await json2src({ templateRoot: path.join( __dirname, 'templates/with-two-catalogs' ) });

	await engine({
		data: {},
		outputRoot : outputDir,
		filePrefix : function( filename, templateKey ) { return 'example.html' },
		isTemplateIncludedCallback: function( templateKey ) { return templateKey != 'catalog-1/template-1.html'; }
	});
}

/**
 * This test checks if the file "FILE.txt" exists in the output directory
 * after running "templates/simple" template.
 */
async function createsOutputFilesForSimpleTemplate () {
	const engine = await json2src({ templateRoot: path.join( __dirname, 'templates/simple' ) });

	await engine({
		data: { numbers:[1,2,3] },
		outputRoot : outputDir,
		filePrefix : 'FILE'
	});

	const filename = path.join( outputDir, 'FILE.txt' );
	const fstats = await fs.stat( filename );
	assert.ok( fstats.isFile() );

	const fileTxt = await fs.readFile( filename, { encoding: 'utf-8' });
	assert.strictEqual( fileTxt, '1,2,3' )
}

/**
 * This test checks if the entire structure of files defined is created
 * after running the "templates/complex" template.
 * It also uses partials and helpers to cover all features.
 */
async function createsOutputStructureForComplexTemplate() {
	const engine = await json2src({
		templateRoot: path.join( __dirname, 'templates/complex' ),
		partialsRoot: path.join( __dirname, 'templates/partials' ),
		helpers: {
			"toLowerCase" : function ( input ) {
				return input.toString().toLowerCase();
			},
		
			"toUpperCase" : function ( input ) {
				return input.toString().toUpperCase();
			},			
		}
	});

	await engine({
		data: {
			city: "Zonguldak",
			country: "Turkey"
		},
		outputRoot : outputDir,
		filePrefix : 'location'
	});

	const nestedOutputFile = path.join( __dirname, './output/nested1/nested2/location_complex-nested2.html' );
	const fileTxt = await fs.readFile( nestedOutputFile, { encoding: 'utf-8' });
	assert.ok( fileTxt.indexOf( "<div>zonguldak</div>" ) >= 0 );
	assert.ok( fileTxt.indexOf( "<div>TURKEY</div>" ) >= 0 );
}

async function includesTemplateNamesInKeysProperty() {
	const engine = await json2src({
		templateRoot: path.join( __dirname, 'templates/complex' ),
		partialsRoot: path.join( __dirname, 'templates/partials' ),
		helpers: {
			"toLowerCase" : function ( input ) {
				return input.toString().toLowerCase();
			},
		
			"toUpperCase" : function ( input ) {
				return input.toString().toUpperCase();
			},			
		}
	});

	assert.ok( engine.templateKeys.includes( 'complex-top.html' ));
	assert.ok( engine.templateKeys.includes( 'nested1/complex-nested1.html' ));
	assert.ok( engine.templateKeys.includes( 'nested1/nested2/complex-nested2.html' ));
}

async function callIsTemplateIncludedCallback() {
	// note that the output for this test was built in buildOutputWithTwoCatalogs

	try {
		const catalog = path.join( outputDir, 'catalog-2' );
		await fs.stat( catalog );
	} catch {
		// we expect catalog-2 to exist
		assert.fail( 'catalog-2 should exist' );
	}

	try {
		const file = path.join( outputDir, 'catalog-1/example.html' );
		await fs.stat( file );
		assert.fail( 'catalog-1 should not exist' );
	} catch {
		// we expect catalog-1 to not exist
		// do nothing
	}
}

async function renamedOutputFile() {
	// note that the output for this test was built in buildOutputWithTwoCatalogs

	try {
		const file = path.join( outputDir, 'catalog-2/example.html' );
		await fs.stat( file );
	} catch {
		// we expect catalog-2 to exist
		assert.fail( 'catalog-2/example.html should exist' );
	}
}
