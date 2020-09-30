const json2src = require('../index');

(async function run( ) {
	const engine  = await json2src( { templateRoot: 'D:\\tmp\\in' } );

	await engine({
		outputRoot : 'D:\\tmp\\out',
		filePrefix : 'FILE'
	});
})();
