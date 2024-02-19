const engineBuilder = require('./src/engine-builder');
const engineRunner = require('./src/engine-runner');
const runParameters = require( './src/run-parameters' );
const engineParameters = require( './src/engine-parameters' );

/**
 * Builds a template engine and returns a function used to run it.
 * @param {engineParameters} engineParameters
 * @returns {function(runParameters): Promise} a function which runs the engine, it also contains a templateKeys property which lists the templates
 */
module.exports = async function ( engineParameters ) {

	const engine = await engineBuilder ( engineParameters );

	/**
	 * Loops the data through all templates defined in the engine and saves them into outputRoot directory
	 * @param {runParameters} runParameters 
	 * @returns {Promise} a promise that resolves when all output files are created
	 */
	function engineRun( runParameters ) {
		return engineRunner( engine, runParameters );
	}

	engineRun.templateKeys = Object.keys( engine );

	return engineRun;
}
