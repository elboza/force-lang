const log = require('bunny-logger');
const env = require('./env');

class NativeLib{
	constructor(){
		this.populate();
	}
	test_func(){
		log.info('pippo');
	}
	bye_func(){
		process.exit(0);
	}
	noop_func(){
		//do nothing (no operation)
	}
	print_stack_func(){
		env.print_stack();
	}
	print_env_func(){
		env.print_debug();
	}
	populate(){
		env.set('pippo',{_type: 'TC_NATIVE_FUNC', _datum: this.test_func}, 'TC_WORD');
		env.set('bye',{_type: 'TC_NATIVE_FUNC', _datum: this.bye_func}, 'TC_WORD');
		env.set('noop',{_type: 'TC_NATIVE_FUNC', _datum: this.noop_func}, 'TC_WORD');
		env.set('.s',{_type: 'TC_NATIVE_FUNC', _datum: this.print_stack_func}, 'TC_WORD');
		env.set('.e',{_type: 'TC_NATIVE_FUNC', _datum: this.print_env_func}, 'TC_WORD');
	}
};

module.exports = new NativeLib();
