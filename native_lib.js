const log = require('bunny-logger');
const env = require('./env');

class NativeLib{
	constructor(){
		this.populate();
	}
	test_func(){
		log.info('...hai detto pippo?');
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
	print_words_func(){
		let x = env._dict;
		//x=x.filter(item => item._type == 'TC_NATIVE_FUNC');
		for(var item of x){
			if(item._datum._type == 'TC_NATIVE_FUNC'|| item._datum._type == 'TC_COMP_FUNC'){
				//log.info(`${item._name} `);
				process.stdout.write(`${item._name} `);
			}
		}
		log.info('');
	}
	see_func(func_name){
		var x=env.lookup(func_name);
		if(!x){
			log.info('no word found...');
			return;
		}
		switch(x._datum._type){
			case 'TC_NATIVE_FUNC':
				log.info(`: ${x._name}`);
				log.info('<native func> ;');
				break;
			case 'TC_COMP_FUNC':
				log.info(`: ${x._name}`);
				process.stdout.write(`  `);
				for(var n of x._datum._datum){
					process.stdout.write(`${n._datum} `);
				}
				log.info('');
				break;
			default:
				log.info('not a word...');
				break;
		}
	}
	populate(){
		env.set('pippo',{_type: 'TC_NATIVE_FUNC', _datum: this.test_func}, 'TC_WORD');
		env.set('bye',{_type: 'TC_NATIVE_FUNC', _datum: this.bye_func}, 'TC_WORD');
		env.set('noop',{_type: 'TC_NATIVE_FUNC', _datum: this.noop_func}, 'TC_WORD');
		env.set('.s',{_type: 'TC_NATIVE_FUNC', _datum: this.print_stack_func}, 'TC_WORD');
		env.set('.e',{_type: 'TC_NATIVE_FUNC', _datum: this.print_env_func}, 'TC_WORD');
		env.set('words',{_type: 'TC_NATIVE_FUNC', _datum: this.print_words_func}, 'TC_WORD');
	}
};

module.exports = new NativeLib();
