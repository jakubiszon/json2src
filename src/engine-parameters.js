/**
 * Specifies parameters of an engine to build.
 */
module.exports = class engineParameters {
    /**
     * Directory to read the templates from.
     * @type {string}
     */
	templateRoot;

    /**
     * Directory to read partials from.
     * @type {string}
     */
    partialsRoot;

    /**
     * An object defining helper functions.
     * Each property-name of this object will be available in the templates as helper-name.
     * @type {Object.<string, function>}
     */
    helpers;
}
