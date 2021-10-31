const engineBuilder = require('./src/engine-builder');
const engineRunner = require('./src/engine-runner');

/**
 * @typedef EngineParameters
 * @param {string} templateRoot directory storing the layouts, subdirectories are included
 * @param {string} [partialsRoot] directory storing the partials, subdirectories are included
 * @param {Object.<string, function>} [helpers] an object mapping the helper functions
 */
function EngineParameters() {
	this.templateRoot = "";
	this.partialsRoot = "";
	this.helpers = {};
}

/**
 * @function fileNameFunc returns filenames (without paths) to use when saving output files
 * @param {string} templateName path and anme of the template, relative to the templateRoot of the engine
 * @returns {string} filename (without path) to use to save the output file
 */
function fileNameFunc( templateName ) {
	return "filename";
}

 /**
  * @typedef RunParameters
  * @property {Object} data - data passed to each of the layouts specified in the engine
  * @property {string} outputRoot - folder to which compiled output files will be saved
  * @property {string|fileNameFunc} filePrefix - NOT USED YET prefix to use for each filename or a function to make the filename
  */
function RunParameters () {
	this.data = {};
	this.outputRoot = "";
	this.filePrefix = "";
	this.consoleOutput = true;
}

/**
 * Returns an engine function.
 * @function
 * @param {EngineParameters} engineParameters
 */
module.exports = async function ({ templateRoot, partialsRoot, helpers }) {

	if( typeof consoleOutput === 'undefined' ) consoleOutput = true;
	const engine = await engineBuilder (
		templateRoot,
		partialsRoot,
		helpers
	);

	/**
	 * Loops the data through all templates defined in the engine and saves them into outputRoot folder
	 * @function
	 * @param {RunParameters} runParameters 
	 * @returns {Promise}
	 */
	function engineRun({ data, outputRoot, filePrefix, consoleOutput }) {
		return engineRunner( engine, { data, outputRoot, filePrefix, consoleOutput });
	}

	return engineRun;
}
