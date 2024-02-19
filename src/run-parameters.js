/**
 * Specifies parameters passed to a single engine run.
 */
module.exports = class runParameters {
	/**
	 * Data passed to each of the templates in the engine.
	 * @type {Object}
	 */
	data;

	/**
	 * Root directory to which output files will be saved.
	 * @type {string}
	 */
	outputRoot;

	/**
	 * Prefix to use for each filename or a function to produce the filename to use.
	 * @type {string|function(string):string}
	 */
	filePrefix;

	/**
	 * Decides whether the run should output non-error information to the console.
	 */
	consoleOutput;

	/**
	 * Optional callback which will be passed the template key to decide
	 * if the template should be included in the current run.
	 * If this callback is not specified - all templates are included.
	 * @type {null | function(string):boolean}
	 */
	isTemplateIncludedCallback;
}
