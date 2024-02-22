# json2src - a tiny code generator
**json2src** is a minimalistic code generator. It produces software code by running your data through templates.
Your data is just any **json** and the templates are written in **handlebars**. That's it. The tool was designed to get out of your way. It is up to you what your data and your templates are.

## Existing templates and data loaders
 - [table2json](https://github.com/jakubiszon/table2json) - database structure reader which can get table definitions from postgres and sqlserver.
 - [postgres stored procedures template](https://github.com/jakubiszon/pg-stored-procedures-hbs) - template generating CRUD ( and some more ) stored procedures for your tables.

## Usage
This program needs to be added to your `package.json`. To install run:
```
npm install --save https://github.com/jakubiszon/json2src.git
```

Example usage:
```js
const json2src = require('json2src');

(async function () {

	// preparing an engine, this will compile the templates, partials and assign helpers
	const engine = await json2src({
		// path to templates directory
		templateRoot : 'path/to/templates',

		// OPTIONAL - path to partials directory
		partialsRoot : 'path/to/partials',

		// OPTIONAL - an object storing helper functions, the keys of the object will be used as helper names
		helpers : { /* ... */ }
	});

	// now we have an engine, we can run it any number of times
	await engine ({
		// data passed to each template
		data : { ... },

		// path to output directory
		outputRoot : 'path/to/output',

		// filename prefix or a function naming the files, explained below
		filePrefix : 'filename prefix for this run',

		// OPTIONAL - a function taking full template name as param and returning boolean
		// to decide if the given template should be included in this run
		isTemplateIncludedCallback: function( templateKey ) { ... }
	});

})();

```
The above example used `async/await`. Callbacks are not supported.

## Input and output structure
At the moment all input file names are expected to end with `.hbs`.

The structure of the output files matches the input structure.
If we call:
```js
const engine = await json2src({
	templateRoot : 'template_root'
});

await engine({
	data:{/*...*/},
	outputRoot : 'output_root',
	filePrefix: 'person'
});
```

And the `template_root` contains the following stucture:
```
/template_root/
├─ /data/
│  ├─ .js.hbs
├─ /modules/
│  ├─ controller.js.hbs
│  ├─ .js.hbs
```

The `output_root` will be stuffed with following files:
```
/output_root/
├─ /data/
│  ├─ person.js
├─ /modules/
│  ├─ person_controller.js
│  ├─ person.js
```

We can continue running the same engine to produce more files:
```js
await engine({ data:{/*...*/}, outputRoot : 'output_root', filePrefix: 'order' })
await engine({ data:{/*...*/}, outputRoot : 'output_root', filePrefix: 'order_item' })
```

We will end up with:
```
/output_root/
├─ /data/
│  ├─ order.js
│  ├─ order_item.js
│  ├─ person.js
├─ /modules/
│  ├─ order_controller.js
│  ├─ order.js
│  ├─ order_item_controller.js
│  ├─ order_item.js
│  ├─ person_controller.js
│  ├─ person.js
```

## Output file names
Output file names are controlled by the `filePrefix` passed as part of `RunParameters` object.
* for input files formed as `name.ext.hbs` the `filePrefix` is added with an underscore and results with `filePrefix_name.ext`
* for input files without a name e.g. `.ext.hbs` the output is `filePrefix.ext`
* when the prefix is assigned a falsy value - the output file names are just the template names without the `.hbs` extensions
* `filePrefix` could also be assigned as a function:
```js
/**
 * @param {string} filename - name of the template, without the path and .hbs extension
 * @param {string} templateKey - relative path to the file and name without extension, helps to distinguish files with same name in different directories
 */
function( filename, templateKey ) {
    // the filename param is the 
    // the returned string will be used as the filename
    // no tests were done for return values containing paths
    return 'some-other-file-name.js';
}
```

## Partials
Partial names reflect the structure of the `partialsRoot` directory.

Example partial structure:
```
/partials_root/
├─ /controller/
│  ├─ post.hbs
│  ├─ put.hbs
├─ database.hbs
```

Example usage of the above:
```hbs
{{>controller/post}}
{{>database}}
```

## Helpers
The `helpers` property of `EngineParameters` object passed to `json2src` is expected to store functions. The keys of the `helpers` object will be used as names when registering helpers to handlebars.

Example
```js
let helpers = {
	"toLowerCase" : function ( input ) {
		return input.toString().toLowerCase();
	},

	"toUpperCase" : function ( input ) {
		return input.toString().toUpperCase();
	},
}
```

The above helpers could be referenced as:
```hbs
{{toLowerCase someVariable}}
{{toUpperCase someVariable}}
```

## Skipping files
[Run parameters]((src/run-parameters.js)) can include a callback function `isTemplateIncludedCallback` which can tell the engine to skip selected files.

The following run will not process templates which are found inside `modules` subdirectory of the `templateRoot`. Additionally output directories are only created when an output file needs them. In the case below, `modules` directory would not be created inside `outputRoot`.
```js
await engine({
	data:{/*...*/},
	outputRoot : 'output_root',
	filePrefix: 'test',
	isTemplateIncludedCallback: function ( templateKey ) {
		return !templateKey.startsWith( 'modules/' );
	}
});
```

### Listing template keys
If you need the list of template keys before running the engine, the list is assigned as `templateKeys` property of the engine function.

```js
const engine = await json2src({
	templateRoot : 'template_root'
});

// print all template keys registered in the engine
console.log( engine.templateKeys );
```
