// const repl = require('repl');
import log from 'bunny-logger';
import NativeLib from './native_lib.js';
import evalx from './eval.js';
import loadfile from './load-file.js';
import env from './env.js';

class Force {
  constructor() {
    env.set('os:cwd', { _type: 'TC_STR', _datum: process.cwd() }, 'TC_VAR');
    env.set('os:argv', { _type: 'TC_JSON', _datum: process.argv }, 'TC_VAR');
    env.set('os:__dirname', { _type: 'TC_STR', _datum: import.meta.dirname }, 'TC_VAR');
    env.set('os:bin', { _type: 'TC_STR', _datum: '' }, 'TC_VAR');
  }

  async load_lib() {
    await evalx.load_lib();
  }

  load_lib_sync() {
    evalx.load_lib();
  }

  async eval_file(filename) {
    env.set('os:bin', { _type: 'TC_STR', _datum: filename }, 'TC_VAR');
    await evalx.eval(await loadfile.load(filename), filename);
  }

  // 	deprecated ...
  // 	eval_file_sync(filename){
  // 		env.set('os:bin',{_type: 'TC_STR', _datum: filename}, 'TC_VAR');
  // 		evalx.eval(loadfile.loadsync(filename), filename);
  // 	}
  async exec(script) {
    await evalx.eval(script, '<stdin>');
  }

  populate_repl() {
    NativeLib.populate_repl();
  }
}

export default new Force();
