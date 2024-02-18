const path = require( 'path' );
const assert = require( 'assert' );
const directoryFileList = require( '../src/directory-file-list' );

describe( 'directory-file-list', function() {

    it( 'reads files from relative directory path', readsRelativeRootDirectory );
    it( 'reads files from absolute directory paths', readsAbsoluteRootDirectory );

});

async function readsRelativeRootDirectory() {
    // "test" directory is relative to the package root
    const files = await directoryFileList( './test' );
    assert.ok( files.includes( 'directory-file-list.test.js' ));
    assert.ok( files.includes( path.normalize( 'templates/simple/.txt.hbs' )));
}

async function readsAbsoluteRootDirectory() {
    const files = await directoryFileList( path.join( __dirname, './' ));
    assert.ok( files.includes( 'directory-file-list.test.js' ));
    assert.ok( files.includes( path.normalize( 'templates/simple/.txt.hbs' )));
}