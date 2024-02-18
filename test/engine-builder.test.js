const assert = require( 'assert' );
const path = require( 'path' );
const engineBuilder = require( '../src/engine-builder' );

describe ( 'engine-builder', function() {

    let engine;
    before( loadEngine )
    it( 'includes template names as keys', includesTemplateNamesAsKeys );
    it( 'does not use backslash', doesNotUseBackslash );

    /**
     * Prepares the "engine" variable used in the tests
     */
    async function loadEngine() {
        engine = await engineBuilder( path.join( __dirname, './templates/complex' ));
    }

    /**
     * Checks that the output "engine" contains objects keys which
     * represent paths to template files relative to the template root directory.
     */
    function includesTemplateNamesAsKeys() {
        const keys = Object.keys( engine );
        assert.ok( keys.includes( 'complex-top.html' ));
        assert.ok( keys.includes( 'nested1/complex-nested1.html' ));
        assert.ok( keys.includes( 'nested1/nested2/complex-nested2.html' ));
    }

    function doesNotUseBackslash() {
        const keys = Object.keys( engine );
        const keysWithBackSlash = keys.filter( key => key.indexOf('\\') >= 0 );
        assert.equal( keysWithBackSlash.length, 0, 'engine contains keys with backslash' );
    }
});
