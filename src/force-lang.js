//const repl = require('repl');
const log = require('bunny-logger');
const NativeLib = require('./native_lib');
const eval = require('./eval');
const loadfile = require('./load-file');

class Force {

	constructor(){
		log.info('constructor...');
		log.info('__dirname: ' + __dirname);
		log.info('argv: ' + process.argv)
		log.info('cwd: ' + process.cwd())
	}

	async load_lib(){
		await eval.load_lib();
	}
	async eval_file(filename){
		eval.eval(await loadfile.load(filename));
	}
	exec(script){
		eval.eval(script);
	}
	populate_repl(){
		NativeLib.populate_repl();
	}
};

module.exports = new Force();
