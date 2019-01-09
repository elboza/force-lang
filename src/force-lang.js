//const repl = require('repl');
const NativeLib = require('./native_lib');
const eval = require('./eval');
const loadfile = require('./load-file');

class Force {

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
