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
	emit_func(){
		const x = env.s.pop();
		//log.info(x);
		if(x._type === 'TC_NUM'){
			process.stdout.write(String.fromCharCode(x._datum));
			return;
		}
		log.info(`unknown item type ${x._type} of ${x._datum}`);
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
	print_tos_func(){
		const x = env.s.pop();
		if(!x) return;
		//log.info(x);
		switch(x._type){
			case 'TC_NUM':
			case 'TC_STR':
				log.info(x._datum);
				break;
			case 'TC_JSON':
				log.info(JSON.stringify(x._datum));
				break;
			case 'TC_VAR':
				log.info(x._name);
				break;
			default:
				log.info(`unknown: { ${x._type} ${x._datum} }`);
				break;
		}
	}
	print_debug_tos_func(){
		const x = env.s.pop();
		if(!x) return;
		//log.info(x);
		switch(x._type){
			case 'TC_NUM':
			case 'TC_STR':
				log.info(`{ ${x._type} ${x._datum} }`);
				break;
			case 'TC_JSON':
				log.info(`{ ${x._type} ${JSON.stringify(x._datum)} }`);
				break;
			case 'TC_VAR':
				log.info(`{ ${x._type} ${x._name} ${x._datum._datum} }`);
				break;
			default:
				log.info(`unknown: { ${x._type} ${x._datum} }`);
				break;
		}
	}
	assign_var_func(){
		const varx = env.s.pop();
		const val = env.s.pop();
		if(!varx || !val) return;
		//log.info(varx);
		//log.info(val);
		switch(val._type){
			case'TC_NUM':
			case 'TC_STR':
				varx._datum = val;
				env.set(varx._name, val, varx._type, varx._where);
				break;
			default:
				break;
		}
	}
	read_var_func(){
		const varx = env.s.pop();
		if(!varx) return;
		//log.info(varx);
		switch(varx._datum._type){
			case'TC_NUM':
			case 'TC_STR':
				env.s.push(varx._datum);
				break;
			default:
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
		env.set('emit',{_type: 'TC_NATIVE_FUNC', _datum: this.emit_func}, 'TC_WORD');
		env.set('.',{_type: 'TC_NATIVE_FUNC', _datum: this.print_tos_func}, 'TC_WORD');
		env.set('.?',{_type: 'TC_NATIVE_FUNC', _datum: this.print_debug_tos_func}, 'TC_WORD');
		env.set('!',{_type: 'TC_NATIVE_FUNC', _datum: this.assign_var_func}, 'TC_WORD');
		env.set('@',{_type: 'TC_NATIVE_FUNC', _datum: this.read_var_func}, 'TC_WORD');
	}
};

module.exports = new NativeLib();
