# json2src - a tiny code generator
**json2src** is a minimalistic code generator. It produces software code by running your data through templates.
Your data is just any **json** and the templates are written in **handlebars**. That's it. The tool was designed to get out of your way. It is up to you what your data and your templates are.

## Existing templates and data loaders
 - [table2json](https://github.com/jakubiszon/table2json) - database structure reader which can get table definitions from postgres and sqlserver.
 - [postgres stored procedures template](https://github.com/jakubiszon/pg-stored-procedures-hbs) - template generating CRUD ( and some more ) stored procedures for your tables.

<!--- 
TODO
This tool started as part of a code generator for relational databases. There are some templates existing:
* REST api for postgres running on node/express
* CRUD stored procedures for sqlserver
* CRUD stored procedures for postgres

The above templates rely on structures extracted by [table2json](https://example.com) which is a tiny database structure extractor for **postgres** and **sqlserver**.
--->

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
		templateRoot : 'path to your templates',
		partialsRoot : 'path to your partials', // OPTIONAL
		helpers : { /* ... */ } // OPTIONAL - an object storing helper functions, the keys of the object will be used as helper names
	});

	// now we have an engine, we can run it any number of times
	await engine ({
		data : {/* data passed to each template */}, // if somehow your templates needed no data this could as well be undefined
		outputRoot : 'path to your output folder',
		filePrefix : 'filename prefix for this run'
	});

})();

```
The above example used `async/await`. Please note callbacks are not supported. If you need them you might need to wrap the objects with additional code.

## Input and output structure
At the moment all input file names are expected to end with `.hbs`.

The structure of the output files matches the input structure.
If we call:
```js
const engine = await json2src( { templateRoot : 'template_root' } );
await engine({ data:{/*...*/}, outputRoot : 'output_root', filePrefix: 'person' })
```

And the template_root has the following stucture:
```
/template_root/
├─ /data/
│  ├─ .js.hbs
├─ /modules/
│  ├─ controller.js.hbs
│  ├─ .js.hbs
```

The output_root will be stuffed with following files:
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
* for input files without a name e.g. `.ext.hbs` the output is `filePresix.ext`
<!--- 
* TODO `filePrefix` could be assigned as a function:
```js
function( path, filename ) {
	// here you could be a bit more creative about the filenames
	return 'filename without path';
}
```
--->

## Partials
Partial names reflect the structure of the `partialsRoot` folder.

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
