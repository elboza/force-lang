//const repl = require('repl');
const log = require('bunny-logger');
const NativeLib = require('./native_lib');
const eval = require('./eval');
const loadfile = require('./load-file');
const env = require('./env');

class Force {

	constructor(){
		env.set('os:cwd',{_type: 'TC_STR', _datum: process.cwd()}, 'TC_VAR');
		env.set('os:argv',{_type: 'TC_JSON', _datum: process.argv}, 'TC_VAR');
		env.set('os:__dirname',{_type: 'TC_STR', _datum: __dirname}, 'TC_VAR');
		env.set('os:bin',{_type: 'TC_STR', _datum: ''}, 'TC_VAR');
	}

	async load_lib(){
		await eval.load_lib();
	}
	async eval_file(filename){
		env.set('os:bin',{_type: 'TC_STR', _datum: filename}, 'TC_VAR');
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
