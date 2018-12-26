const log = require('bunny-logger');
const env = require('./env');
const err = require('./error');
const eval = require('./eval');

class NativeLib{
	constructor(){
		this.populate();
	}
	make_func_obj(func_name){
		return {
			"_type":"TC_COMP_FUNC",
			"_datum":func_name
		}
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
			case 'TC_BOOL':
				log.info(x._datum);
				break;
			case 'TC_JSON':
				log.info(JSON.stringify(x._datum));
				break;
			case 'TC_VAR':
				log.info(x._name);
				break;
			case 'TC_ERR':
				log.info(`ERR: ${x._datum.msg}`);
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
			case 'TC_BOOL':
				log.info(`{ ${x._type} ${x._datum} }`);
				break;
			case 'TC_JSON':
				log.info(`{ ${x._type} ${JSON.stringify(x._datum)} }`);
				break;
			case 'TC_VAR':
				log.info(`{ ${x._type} ${x._name} ${x._datum._datum} }`);
				break;
			case 'TC_ERR':
				log.info(`ERR: ${x._datum.msg}`);
				break;
			default:
				log.info(`unknown: { ${x._type} ${x._datum} }`);
				break;
		}
	}
	assign_var_func(){
		const varx = env.s.pop();
		const val = env.s.pop();
		if(!varx || !val) {
			env.s.push(err.throw('no items on top 2 elements of the stack... aborting'));
			return;
		}
		//log.info(varx);
		//log.info(val);
		switch(val._type){
			case'TC_NUM':
			case 'TC_STR':
			case 'TC_JSON':
				varx._datum = val;
				//env.set(varx._name, val, varx._type, varx._where);
				break;
			default:
				break;
		}
	}
	read_var_func(){
		const varx = env.s.pop();
		if(!varx) {
			env.s.push(err.throw('no element on top of the stack... aborting'));
			return;
		}
		//log.info(varx);
		switch(varx._datum._type){
			case'TC_NUM':
			case 'TC_STR':
			case 'TC_JSON':
				env.s.push(varx._datum);
				break;
			default:
				break;
		}
	}
	not_func(){
		if(!env.is_bool(env.TOS())){
			env.s.push(err.throw('TOS is not a bool. aborting operation...'));
			return;
		}
		let x = env.get_bool_val(env.s.pop());
		env.s.push(env.set_bool_val(!x));
	}
	and_func(){
		if(!env.is_bool(env.TOS())){
			env.s.push(err.throw('TOS is not a bool. aborting operation...'));
			return;
		}
		if(!env.is_bool(env.TOS2())){
			env.s.push(err.throw('TOS" is not a bool. aborting operation...'));
			return;
		}
		let a=env.get_bool_val(env.s.pop());
		let b=env.get_bool_val(env.s.pop());
		env.s.push(env.set_bool_val(a&&b));
	}
	or_func(){
		if(!env.is_bool(env.TOS())){
			env.s.push(err.throw('TOS is not a bool. aborting operation...'));
			return;
		}
		if(!env.is_bool(env.TOS2())){
			env.s.push(err.throw('TOS2 is not a bool. aborting operation...'));
			return;
		}
		let a=env.get_bool_val(env.s.pop());
		let b=env.get_bool_val(env.s.pop());
		env.s.push(env.set_bool_val(a||b));
	}
	is_num_func(){
		if(env.is_num(env.s.pop())){
			env.s.push(env.true_obj());
			return;
		}
		env.s.push(env.false_obj());
	}
	is_falsy_func(){
		let x = env.s.pop();
		if(x){
			switch(x._type){
				case 'TC_NUM':
					if(x._datum==0) return env.s.push(env.true_obj()); else return env.s.push(env.false_obj());
					break;
				case 'TC_STR':
					if(x._datum == '') return env.s.push(env.true_obj());
					break;
				case 'TC_BOOL':
					if(env.is_false(x)) return env.s.push(env.true_obj());
					break;
				case 'TC_JLIST':
				case 'TC_JOBJ':
				default:
					return env.s.push(env.false_obj());
					break;
			}
		}
		return env.s.push(env.true_obj());
	}
	dup_func(){
		env.s.push(env.TOS());
	}
	swap_func(){
		if(env.TOS() && env.TOS2()){
			let x = env.s.pop();
			let y = env.s.pop();
			env.s.push(x);
			env.s.push(y);
			return;
		}
		env.s.push(err.throw('not 2 elemets in the stack... aborting...'));
	}
	drop_func(){
		env.s.pop();
	}
	ndrop_func(){
		
	}
	nbye_func(){
		if(env.TOS() && env.TOS()._type == 'TC_NUM'){
			process.exit(env.s.pop()._datum);
		}
		env.s.push(err.throw('TOS not a number... aborting'));
	}
	over_func(){
		env.s.push(env.s.look_at(1));
	}
	num_plus_func(){
		if(env.TOS() && env.TOS()._type == 'TC_NUM' && env.TOS2() && env.TOS2()._type == 'TC_NUM'){
			env.s.push({_type: 'TC_NUM', _datum: env.s.pop()._datum + env.s.pop()._datum});
			return;
		}
		env.s.push(err.throw('no numbers on top 2 elements of the stack... aborting'));
	}
	num_minus_func(){
		if(env.TOS() && env.TOS()._type == 'TC_NUM' && env.TOS2() && env.TOS2()._type == 'TC_NUM'){
			let x = env.s.pop()._datum;
			let y = env.s.pop()._datum;
			env.s.push({_type: 'TC_NUM', _datum: y - x});
			return;
		}
		env.s.push(err.throw('no numbers on top 2 elements of the stack... aborting'));
	}
	num_times_func(){
		if(env.TOS() && env.TOS()._type == 'TC_NUM' && env.TOS2() && env.TOS2()._type == 'TC_NUM'){
			env.s.push({_type: 'TC_NUM', _datum: env.s.pop()._datum * env.s.pop()._datum});
			return;
		}
		env.s.push(err.throw('no numbers on top 2 elements of the stack... aborting'));
	}
	num_div_func(){
		if(env.TOS() && env.TOS()._type == 'TC_NUM' && env.TOS2() && env.TOS2()._type == 'TC_NUM'){
			let x = env.s.pop()._datum;
			let y = env.s.pop()._datum;
			env.s.push({_type: 'TC_NUM', _datum: y / x});
			return;
		}
		env.s.push(err.throw('no numbers on top 2 elements of the stack... aborting'));
	}
	plus_func(){
		eval.eval('f+');
	}
	minus_func(){
		eval.eval('n:-');
	}
	times_func(){
		eval.eval('n:*');
	}
	division_func(){
		eval.eval('n:/');
	}
	module_func(){
		eval.eval('n:%');
	}
	string_plus_func(){
		if(env.is_string(env.TOS()) || env.is_string(env.TOS2())){
			if(env.is_num(env.TOS()) || env.is_num(env.TOS2()) || env.is_string(env.TOS()) || env.is_string(env.TOS2())){
				const x= env.s.pop();
				const y= env.s.pop();
				env.s.push({"_type":"TC_STR","_datum":y._datum+x._datum});
				return;
			}
		}
		env.s.push(err.throw("invalid arguments type"));
	}
	array_plus_func(){
		if(env.is_list(env.TOS()) || env.is_list(env.TOS2())){
			const x= env.s.pop();
			const y= env.s.pop();
			env.s.push({"_type":"TC_JSON","_datum":y._datum.concat(x._datum)});
			return;
		}
		env.s.push(err.throw("invalid arguments type"));
	}
	throw_func(){
		if(env.TOS() && env.TOS()._type == 'TC_STR'){
			env.s.push(err.throw(env.s.pop()._datum));
			return;
		}
		if(env.TOS() && env.TOS()._type == 'TC_JSON'){
			const err_arg = env.s.pop();
			env.s.push(err.throw(err_arg._datum.msg, err_arg._datum.code));
			return;
		}
		env.s.push(err.throw('invalid throw argument in TOS'));
	}
	handle_repl_func(){
		err.handle_repl();
	}
	handle_standard_func(){
		err.handle_standard();
	}
	populate_repl(){
		env.set('handle',{_type: 'TC_NATIVE_FUNC', _datum: this.handle_repl_func}, 'TC_WORD');
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
		env.set('not',{_type: 'TC_NATIVE_FUNC', _datum: this.not_func}, 'TC_WORD');
		env.set('and',{_type: 'TC_NATIVE_FUNC', _datum: this.and_func}, 'TC_WORD');
		env.set('or',{_type: 'TC_NATIVE_FUNC', _datum: this.or_func}, 'TC_WORD');
		env.set('is_num',{_type: 'TC_NATIVE_FUNC', _datum: this.is_num_func}, 'TC_WORD');
		env.set('is_falsy',{_type: 'TC_NATIVE_FUNC', _datum: this.is_falsy_func}, 'TC_WORD');
		env.set('dup',{_type: 'TC_NATIVE_FUNC', _datum: this.dup_func}, 'TC_WORD');
		env.set('swap',{_type: 'TC_NATIVE_FUNC', _datum: this.swap_func}, 'TC_WORD');
		env.set('drop',{_type: 'TC_NATIVE_FUNC', _datum: this.drop_func}, 'TC_WORD');
		env.set('ndrop',{_type: 'TC_NATIVE_FUNC', _datum: this.ndrop_func}, 'TC_WORD');
		env.set('nbye',{_type: 'TC_NATIVE_FUNC', _datum: this.nbye_func}, 'TC_WORD');
		env.set('over',{_type: 'TC_NATIVE_FUNC', _datum: this.over_func}, 'TC_WORD');
		env.set('n:+',{_type: 'TC_NATIVE_FUNC', _datum: this.num_plus_func}, 'TC_WORD');
		env.set('n:-',{_type: 'TC_NATIVE_FUNC', _datum: this.num_minus_func}, 'TC_WORD');
		env.set('n:*',{_type: 'TC_NATIVE_FUNC', _datum: this.num_times_func}, 'TC_WORD');
		env.set('n:/',{_type: 'TC_NATIVE_FUNC', _datum: this.num_div_func}, 'TC_WORD');
		env.set('+',{_type: 'TC_NATIVE_FUNC', _datum: this.plus_func}, 'TC_WORD');
		env.set('-',{_type: 'TC_NATIVE_FUNC', _datum: this.minus_func}, 'TC_WORD');
		env.set('*',{_type: 'TC_NATIVE_FUNC', _datum: this.times_func}, 'TC_WORD');
		env.set('/',{_type: 'TC_NATIVE_FUNC', _datum: this.division_func}, 'TC_WORD');
		env.set('%',{_type: 'TC_NATIVE_FUNC', _datum: this.module_func}, 'TC_WORD');
		env.set('handle',{_type: 'TC_NATIVE_FUNC', _datum: this.handle_standard_func}, 'TC_WORD');
		env.set('throw',{_type: 'TC_NATIVE_FUNC', _datum: this.throw_func}, 'TC_WORD');
		env.set('s:+',{_type: 'TC_NATIVE_FUNC', _datum: this.string_plus_func}, 'TC_WORD');
		env.set('a:+',{_type: 'TC_NATIVE_FUNC', _datum: this.array_plus_func}, 'TC_WORD');
	}
};

module.exports = new NativeLib();
