const log = require('bunny-logger');
//const request = require('request-promise-native');
const request = require('sync-request');
const JSON5 = require('json5');
const env = require('./env');
const err = require('./error');
const eval = require('./eval');
const loadfile = require('./load-file');
const obj_utils = require('./obj_utils');

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
		env.s.push(err.throw(`unknown item type ${x._type} of ${x._datum}`));
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
				log.info(obj_utils.stringify(x._datum));
				break;
			case 'TC_FUNC_JS':
				log.info('#-<js func>');
				break;
			case 'TC_LAMBDA_FUNC':
				log.info('#-<lambda func>');
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
				log.info(`{ ${x._type} ${obj_utils.stringify(x._datum)} }`);
				break;
			case 'TC_FUNC_JS':
				log.info('#-<js func>');
				break;
			case 'TC_LAMBDA_FUNC':
				log.info('#-<lambda func>');
				break;
			case 'TC_VAR':
				log.info(`{ ${x._type} ${x._name} ${obj_utils.stringify(x._datum._datum)} }`);
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
	is_string_func(){
		if(env.is_string(env.s.pop())){
			env.s.push(env.true_obj());
			return;
		}
		env.s.push(env.false_obj());
	}
	is_list_func(){
		if(env.is_list(env.s.pop())){
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
	array_at_func(){
		if(env.is_num(env.TOS()) && env.is_list(env.TOS2())){
			try{
				var index=env.s.pop()._datum;
				var arr=env.s.pop()._datum;
				if(index<0) index=arr.length+index;
				if(index>=arr.length || index<0){
					env.s.push(err.throw("invalid index bound"));
					return;
				}
				const value=arr[index];
				const xval=env.adj_bool_val(value);
				env.s.push({"_type":env.guess_type(value), "_datum":xval});
				return;
			}catch(e){
				env.s.push(err.throw(e));
				return;
			}
		}
		env.s.push(err.throw("invalid arguments type"));
	}
	array_set_at_func(){
		if(env.TOS() && env.is_num(env.TOS2()) && env.is_list(env.s.look_at(2))){
			try{
				var value=env.s.pop()._datum;
				var index=env.s.pop()._datum;
				var arr=env.s.pop()._datum;
				if(index<0) index=arr.length+index;
				if(index>=arr.length || index<0){
					env.s.push(err.throw("invalid index bound"));
					return;
				}
				arr[index]=value;
				env.s.push({"_type":"TC_JSON", "_datum":arr});
				return;
			}catch(e){
				env.s.push(err.throw(e));
				return;
			}
		}
		env.s.push(err.throw("invalid arguments type"));
	}
	object_at_func(){
		if(env.is_string(env.TOS()) && env.is_obj(env.TOS2())){
			try{
				var key=env.s.pop()._datum;
				var obj=env.s.pop()._datum;
				var value=obj[key];
				if(value){
					const xval=env.adj_bool_val(value);
					env.s.push({"_type":env.guess_type(value), "_datum":xval});
					return;
				}
				env.s.push(err.throw("invalid object key"));
				return;
			}catch(e){
				env.s.push(err.throw(e));
				return;
			}
		}
		env.s.push(err.throw("invalid arguments type"));
	}
	object_set_at_func(){
		if(env.TOS() && env.is_string(env.TOS2()) && env.is_obj(env.s.look_at(2))){
			try{
				var value=env.s.pop()._datum;
				var key=env.s.pop()._datum;
				var obj=env.s.pop()._datum;
				obj[key]=value;
				env.s.push({"_type":'TC_JSON', "_datum":obj});
				return;
			}catch(e){
				env.s.push(err.throw(e));
				return;
			}
		}
		env.s.push(err.throw("invalid arguments type"));
	}
	array_length_func(){
		if(env.is_list(env.TOS())){
			try{
				var x=env.s.pop()._datum.length;
				env.s.push({"_type":"TC_NUM","_datum":x});
				return;
			}catch(e){
				env.s.push(err.throw(e));
				return;
			}
		}
		env.s.push(err.throw("invalid arguments type. TOS not a list"));
	}
	array_push_func(){
		if(env.is_list(env.TOS2()) && env.TOS()){
			try{
				var value=env.s.pop()._datum;
				var arr=env.s.pop()._datum;
				arr.push(value);
				env.s.push({"_type":"TC_JSON","_datum":arr});
				return;
			}catch(e){
				env.s.push(err.throw(e));
				return;
			}
		}
		env.s.push(err.throw("invalid arguments type."));
	}
	array_pop_func(){
		if(env.is_list(env.TOS())){
			try{
				var value=env.s.pop()._datum.pop();
				const xval=env.adj_bool_val(value);
				env.s.push({"_type":env.guess_type(value), "_datum":xval});
				return;
			}catch(e){
				env.s.push(err.throw(e));
				return;
			}
		}
		env.s.push(err.throw("invalid arguments type. TOS not a list"));
	}
	object_keys_func(){
		if(env.is_obj(env.TOS())){
			try{
				var x=env.s.pop()._datum;
				env.s.push({"_type":"TC_JSON","_datum":Object.keys(x)});
				return;
			}catch(e){
				env.s.push(err.throw(e));
				return;
			}
		}
		env.s.push(err.throw("invalid arguments type."));
	}
	object_values_func(){
		if(env.is_obj(env.TOS())){
			try{
				var x=env.s.pop()._datum;
				env.s.push({"_type":"TC_JSON","_datum":Object.values(x)});
				return;
			}catch(e){
				env.s.push(err.throw(e));
				return;
			}
		}
		env.s.push(err.throw("invalid arguments type."));
	}
	string_split_func(){
		if(env.TOS() && env.is_string(env.TOS2())){
			try{
				var x=env.s.pop();
				var y=env.s.pop()._datum;
				var z;
				if(env.is_string(x)){
					z=y.split(x._datum);
				}
				if(env.is_obj(x)){
					z=y.split(x._datum.separator, x._datum.limit);
				}
				if(z){
					env.s.push({"_type":"TC_JSON","_datum":z});
					return;
				}
			}catch(e){
				env.s.push(err.throw(e));
				return;
			}
		}
		env.s.push(err.throw("invalid arguments type."));
	}
	string_join_func(){
		if(env.is_string(env.TOS()) && env.is_list(env.TOS2())){
			try{
				var separator=env.s.pop()._datum;
				var list=env.s.pop()._datum;
				env.s.push({"_type":"TC_STR","_datum":list.join(separator)});
				return;
			}catch(e){
				env.s.push(err.throw(e));
				return;
			}
		}
		env.s.push(err.throw("invalid arguments type."));
	}
	json_stringify_func(){
		if(env.is_json(env.TOS())){
			try{
			env.s.push({"_type":"TC_STR","_datum":JSON5.stringify(env.s.pop()._datum)});
			}catch(e){
				env.s.push(err.throw(e));
			}
			return;
		}
		env.s.push(err.throw("invalid arguments type."));
	}
	json_parse_func(){
		if(env.is_string(env.TOS())){
			try{
			env.s.push({"_type":"TC_JSON","_datum":JSON5.parse(env.s.pop()._datum)});
			}catch(e){
				env.s.push(err.throw(e));
			}
			return;
		}
		env.s.push(err.throw("invalid arguments type."));
	}
	string_at_func(){
		if(env.is_num(env.TOS()) && env.is_string(env.TOS2())){
			try{
				var index=env.s.pop()._datum;
				var str=env.s.pop()._datum;
				if(index<0) index=str.length+index;
				env.s.push({"_type":"TC_STR","_datum":str[index]});
			}catch(e){
				env.s.push(err.throw(e));
			}
			return;
		}
		env.s.push(err.throw("invalid arguments type."));
	}
	string_set_at_func(){
		if(env.is_string(env.TOS()) && env.is_num(env.TOS2()) && env.is_string(env.s.look_at(2))){
			try{
				var replacement=env.s.pop()._datum;
				var index=env.s.pop()._datum;
				var str=env.s.pop()._datum;
				if(index<0) index=str.length+index;
				var result=str.substr(0, index) + replacement+ str.substr(index + replacement.length);
				env.s.push({"_type":"TC_STR","_datum":result});
			}catch(e){
				env.s.push(err.throw(e));
			}
			return;
		}
		env.s.push(err.throw("invalid arguments type."));
	}
	equal_func(){
		if(env.TOS() && env.TOS2()){
			try{
				var x=env.s.pop()._datum;
				var y=env.s.pop()._datum;
				env.s.push({"_type":"TC_BOOL","_datum":y===x ? 'T' : 'F'}); 
			}catch(e){
				env.s.push(err.throw(e));
			}
			return;
		}
		env.s.push(err.throw("invalid arguments type."));
	}
	eq_func(){
		if(env.TOS() && env.TOS2()){
			try{
				var x=env.s.pop()._datum;
				var y=env.s.pop()._datum;
				env.s.push({"_type":"TC_BOOL","_datum":y==x ? 'T' : 'F'}); 
			}catch(e){
				env.s.push(err.throw(e));
			}
			return;
		}
		env.s.push(err.throw("invalid arguments type."));
	}
	num_minor_func(){
		if(env.is_num(env.TOS()) && env.is_num(env.TOS2())){
			try{
				var x=env.s.pop()._datum;
				var y=env.s.pop()._datum;
				env.s.push({"_type":"TC_BOOL","_datum":y<x ? 'T' : 'F'}); 
			}catch(e){
				env.s.push(err.throw(e));
			}
			return;
		}
		env.s.push(err.throw("invalid arguments type."));
	}
	num_major_func(){
		if(env.is_num(env.TOS()) && env.is_num(env.TOS2())){
			try{
				var x=env.s.pop()._datum;
				var y=env.s.pop()._datum;
				env.s.push({"_type":"TC_BOOL","_datum":y>x ? 'T' : 'F'}); 
			}catch(e){
				env.s.push(err.throw(e));
			}
			return;
		}
		env.s.push(err.throw("invalid arguments type."));
	}
	num_min_eq_func(){
		if(env.is_num(env.TOS()) && env.is_num(env.TOS2())){
			try{
				var x=env.s.pop()._datum;
				var y=env.s.pop()._datum;
				env.s.push({"_type":"TC_BOOL","_datum":y<=x ? 'T' : 'F'}); 
			}catch(e){
				env.s.push(err.throw(e));
			}
			return;
		}
		env.s.push(err.throw("invalid arguments type."));
	}
	num_maj_eq_func(){
		if(env.is_num(env.TOS()) && env.is_num(env.TOS2())){
			try{
				var x=env.s.pop()._datum;
				var y=env.s.pop()._datum;
				env.s.push({"_type":"TC_BOOL","_datum":y>=x ? 'T' : 'F'}); 
			}catch(e){
				env.s.push(err.throw(e));
			}
			return;
		}
		env.s.push(err.throw("invalid arguments type."));
	}
	delete_dict_func(){
		if(env.TOS() && env.TOS()._type=='TC_STR'){
			try{
				env.delete(env.s.pop()._datum); 
			}catch(e){
				env.s.push(err.throw(e));
			}
			return;
		}
		env.s.push(err.throw("invalid arguments type."));
	}
	net_request_func(){ //async....
		if(env.is_obj(env.TOS())){
			try{
				//let resp= await request(env.s.pop()._datum);
				let x=env.s.pop()._datum;
				let resp= request(x.method,x.url,x);
				//env.s.push({"_type":"TC_STR","_datum":resp});
				env.s.push({"_type":"TC_STR","_datum":resp.body.toString('utf8')}); 
			}catch(e){
				env.s.push(err.throw(e));
			}
			return;
		}
		env.s.push(err.throw("invalid arguments type."));
	}
	included_func(){
		if(env.is_string(env.TOS())){
			try{
				const arg= env.s.pop()._datum;
				const filename = loadfile.resolve_path(arg);
				var x = loadfile.loadsync(filename);
				eval.eval(x);
				return;
			}catch(e){
				env.s.push(err.throw(e));
				return;
			}
		}
		env.s.push(err.throw("invalid arguments type"));
	}
	file_slurp_func(){
		if(env.is_string(env.TOS())){
			try{
				const arg= env.s.pop()._datum;
				const filename = loadfile.resolve_path(arg);
				var x = loadfile.loadsync(filename);
				env.s.push({"_type":"TC_STR","_datum":x});
				return;
			}catch(e){
				env.s.push(err.throw(e));
				return;
			}
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
	require_js_func(){
		if(env.TOS() && env.TOS()._type == 'TC_STR'){
			try{
				const arg= env.s.pop()._datum;
				const filename = loadfile.resolve_path(arg);
				var js=require(filename);
				env.s.push({"_type":env.guess_type(js),"_datum":js});
				return;
			}catch(e){
				env.s.push(err.throw(e));
				return;
			}
		}
		env.s.push(err.throw('invalid request-js argument type'));
	}
	funcjs_exec_func(){
		try{
			if(env.TOS() && env.TOS()._type=='TC_LAMBDA_FUNC'){
				eval.eval_parsed(env.s.pop()._datum);
				return;
			}
			if(env.TOS() && env.TOS()._type == 'TC_FUNC_JS'){
				var x=env.s.pop()._datum;
				var arity=x.length;
				var args=[];
				//log.info(arity);
				while(arity>0){
					args.unshift(env.s.pop()._datum);
					arity--;
				}
				//log.info(args);
				var y=x.apply(null,args);
				//log.info(y);
				if(y) env.s.push({"_type":env.guess_type(y),"_datum":y});
				return;
			}
			if(env.TOS() && env.TOS()._type == 'TC_STR' && env.TOS2() && 	env.TOS2()._type=='TC_JSON'){
				var method=env.s.pop()._datum;
				var method_list=method.split(".");
				var x=env.s.pop()._datum;
				var funcall=x;
				for(var item of method_list){
					funcall=funcall[item];
				}
				//log.info(funcall);
				var arity=funcall.length;
				var args=[];
				//log.info(arity);
				while(arity>0){
					args.unshift(env.s.pop()._datum);
					arity--;
				}
				//log.info(args);
				var y=funcall.apply(x,args);
				//log.info(y);
				if(y) env.s.push({"_type":env.guess_type(y),"_datum":y});
				return;
			}
			env.s.push(err.throw('invalid funcall-js argument type'));
		}catch(e){
			env.s.push(err.throw(e));
		}
	}
	handle_repl_func(){
		err.handle_repl();
	}
	handle_standard_func(){
		err.handle_standard();
	}
	regex_test_func(){
		try{
			if(env.is_obj(env.TOS()) && env.is_string(env.TOS2())){
				var rex_obj = env.s.pop(),_datum;
				var str = env.s.pop()._datum;
				var my_rex = new RegExp(rex_obj.rex, rex_obj.flags);
				const result = my_rex.test(str);
				env.s.push(
						result ?
						env.true_obj() :
						env.false_obj()
					);
				return;
			}
			if(env.is_string(env.TOS()) && env.is_string(env.TOS2())){
				var rex = env.s.pop()._datum;
				var str = env.s.pop()._datum;
				var my_rex = new RegExp(rex);
				const result = my_rex.test(str);
				env.s.push(
						result ?
						env.true_obj() :
						env.false_obj()
					);
				return;
			}
			env.s.push(err.throw('invalid regex test argument type'));
		}catch(e){
			env.s.push(err.throw(e));
		}
	}
	regex_exec_func(){
		try{
			if(env.is_obj(env.TOS()) && env.is_string(env.TOS2())){
				var rex_obj = env.s.pop(),_datum;
				var str = env.s.pop()._datum;
				var my_rex = new RegExp(rex_obj.rex, rex_obj.flags);
				const result = my_rex.exec(str);
				env.s.push(
						result ?
						{"_type":"TC_JSON","_datum":result} :
						0
					);
				return;
			}
			if(env.is_string(env.TOS()) && env.is_string(env.TOS2())){
				var rex = env.s.pop()._datum;
				var str = env.s.pop()._datum;
				var my_rex = new RegExp(rex);
				const result = my_rex.exec(str);
				env.s.push(
						result ?
						{"_type":"TC_JSON","_datum":result} :
						0
					);
				return;
			}
			env.s.push(err.throw('invalid regex exec argument type'));
		}catch(e){
			env.s.push(err.throw(e));
		}
	}
	regex_match_func(){
		try{
			if(env.is_obj(env.TOS()) && env.is_string(env.TOS2())){
				var rex_obj = env.s.pop(),_datum;
				var str = env.s.pop()._datum;
				var my_rex = new RegExp(rex_obj.rex, rex_obj.flags);
				const result = str.match(my_rex);
				env.s.push(
						result ?
						{"_type":"TC_JSON","_datum":result} :
						0
					);
				return;
			}
			if(env.is_string(env.TOS()) && env.is_string(env.TOS2())){
				var rex = env.s.pop()._datum;
				var str = env.s.pop()._datum;
				var my_rex = new RegExp(rex);
				const result = str.match(my_rex);
				env.s.push(
						result ?
						{"_type":"TC_JSON","_datum":result} :
						0
					);
				return;
			}
			env.s.push(err.throw('invalid regex match argument type'));
		}catch(e){
			env.s.push(err.throw(e));
		}
	}
	regex_search_func(){
		try{
			if(env.is_obj(env.TOS()) && env.is_string(env.TOS2())){
				var rex_obj = env.s.pop(),_datum;
				var str = env.s.pop()._datum;
				var my_rex = new RegExp(rex_obj.rex, rex_obj.flags);
				const result = str.search(my_rex);
				env.s.push({"_type":"TC_NUM","_datum":result});
				return;
			}
			if(env.is_string(env.TOS()) && env.is_string(env.TOS2())){
				var rex = env.s.pop()._datum;
				var str = env.s.pop()._datum;
				var my_rex = new RegExp(rex);
				const result = str.search(my_rex);
				env.s.push({"_type":"TC_NUM","_datum":result});
				return;
			}
			env.s.push(err.throw('invalid regex search argument type'));
		}catch(e){
			env.s.push(err.throw(e));
		}
	}
	regex_replace_func(){
		try{
			if(env.is_obj(env.TOS()) && env.is_string(env.TOS2()) && env.is_string(env.s.look_at(2))){
				var rex_obj = env.s.pop(),_datum;
				var replace = env.s.pop()._datum;
				var str = env.s.pop()._datum;
				var my_rex = new RegExp(rex_obj.rex, rex_obj.flags);
				const result = str.replace(my_rex, replace);
				env.s.push({"_type":"TC_JSON","_datum":result});
				return;
			}
			if(env.is_string(env.TOS()) && env.is_string(env.TOS2()) && env.is_string(env.s.look_at(2))){
				var rex = env.s.pop()._datum;
				var replace = env.s.pop()._datum;
				var str = env.s.pop()._datum;
				var my_rex = new RegExp(rex);
				const result = str.replace(my_rex, replace);
				env.s.push({"_type":"TC_STR","_datum":result});
				return;
			}
			env.s.push(err.throw('invalid regex replace argument type'));
		}catch(e){
			env.s.push(err.throw(e));
		}
	}
	array_shift_func(){
		try{
			if(env.is_list(env.TOS())){
				let value = env.s.pop()._datum.shift();
				const xval=env.adj_bool_val(value);
				env.s.push({"_type":env.guess_type(value), "_datum":xval});
				return;
			}
			env.s.push(err.throw('invalid operation. TOS is not an list'));
		}catch(e){
			env.s.push(err.throw(e));
		}
	}
	array_unshift_func(){
		try{
			if(env.TOS() && env.is_list(env.TOS2())){
				let value = env.s.pop()._datum;
				let array = env.s.pop()._datum;
				array.unshift(value);
				env.s.push({"_type":"TC_JSON", "_datum":array});
				return;
			}
			env.s.push(err.throw('invalid operation. TOS2 is not an list'));
		}catch(e){
			env.s.push(err.throw(e));
		}
	}
	array_each_func(){
		try{
			if(env.TOS() && env.TOS()._type=='TC_LAMBDA_FUNC' && env.is_list(env.TOS2())){
				let funcall = env.s.pop()._datum;
				let array = env.s.pop()._datum;
				//Vx€array, !!funcall
				while(array.length >0 ){
					var value = array.shift();
					const xval=env.adj_bool_val(value);
					env.s.push({"_type":env.guess_type(value), "_datum":xval});
					eval.eval_parsed(funcall);
				}
				return;
			}
			env.s.push(err.throw('invalid arguments. TOS should be a LAMBDA function and TOS2 should be a list'));
		}catch(e){
			env.s.push(err.throw(e));
		}
	}
	parse_args_func(){
		try{
			if(env.is_list(env.TOS())){
				const rx_double_dash = /^\-\-[a-zA-Z0-9]+/;
				const rx_single_dash = /^\-[a-zA-Z0-9]+/;
				const rx_no_dash = /^[^\-]/;
				const rx_two_dashes = /^\-\-/;
				let args = {argv:[]};
				const params_data = env.s.pop()._datum;
				//log.info(params_data);
				let param_found=false;
				let test_col, is_dash;
				let argv = env.lookup('os:argv')._datum._datum;
				argv.shift(); argv.shift(); argv.shift();
				//log.info(argv);
				while(argv.length > 0) {
					let item = argv.shift();
					is_dash=0;
					// log.info(item);
					// if(rx_double_dash.test(item)){
					// 	test_col= 1;
					// 	is_dash = true;
					// }
					// if(rx_single_dash.test(item)) {
					// 	test_col = 0;
					// 	is_dash = true;
					// }

					// if(is_dash) {
					// 	param_found = false;
					// 	for(var param_item of params_data){
					// 		log.info(param_item[test_col]);
					// 		if(param_item[test_col]=== (test_col === 0)? item.match(rx_single_dash)[0] : item.match(rx_double_dash[0])){
					// 			log.info('d: ',param_item);
					// 			param_found = true;
					// 			break;
					// 		}
					// 	}
					// 	//if ! invalid parameter
					// 	if(!param_found) log.info(`invalid parameter ${item}`);
					// }

					if(rx_double_dash.test(item)){
						param_found = false;
						for(var param_item of params_data){
							if(param_item[1]===item.match(rx_double_dash)[0]){
								//log.info('dd: ',param_item);
								param_found = true;
								switch(param_item[2]){
									case 'y':
										//log.info('ha param');
										if(argv[0] && rx_no_dash.test(argv[0])){
											args[param_item[1].replace(rx_two_dashes,'')] = argv.shift();
										} else {
											log.info(`error, parameter ${item} needs value...`);
											//error needs param...
										}
										break;
									case 'n':
										//log.info('no param');
										args[param_item[1].replace(rx_two_dashes,'')] = true;
										break;
									case '?':
										//log.info('opt param');
										if(argv[0] && rx_no_dash.test(argv[0])){
											args[param_item[1].replace(rx_two_dashes,'')] = argv[0];
										}else{
											args[param_item[1].replace(rx_two_dashes,'')] = true;
										}
										break;
									default:

									break;
								}
								break;
							}
						}
						//if ! invalid parameter
						if(!param_found) log.info(`invalid parameter ${item}`);
					}else if(rx_single_dash.test(item)) {
						param_found= false;
						for(var param_item of params_data){
							if(param_item[0]===item.match(rx_single_dash)[0]){
								//log.info('sd: ',param_item);
								param_found = true;
								switch(param_item[2]){
									case 'y':
										//log.info('ha param');
										if(argv[0] && rx_no_dash.test(argv[0])){
											args[param_item[1].replace(rx_two_dashes,'')] = argv.shift();
										} else {
											log.info(`error, parameter ${item} needs value...`);
											//error needs param...
										}
										break;
									case 'n':
										//log.info('no param');
										args[param_item[1].replace(rx_two_dashes,'')] = true;
										break;
									case '?':
										//log.info('opt param');
										if(argv[0] && rx_no_dash.test(argv[0])){
											args[param_item[1].replace(rx_two_dashes,'')] = argv[0];
										}else{
											args[param_item[1].replace(rx_two_dashes,'')] = true;
										}
										break;
									default:

									break;
								}
								break;
							}
						}
						if(!param_found) log.info(`invalid parameter ${item}`);
					}else {
						//else{
						//normal argv...
						args.argv.push(item);
					}
				}
				log.info(args);
				return;
			}
			env.s.push(err.throw('invalid arguments. TOS should be a list'));
		}catch(e){
			env.s.push(err.throw(e));
		}
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
		env.set('is_string',{_type: 'TC_NATIVE_FUNC', _datum: this.is_string_func}, 'TC_WORD');
		env.set('is_list',{_type: 'TC_NATIVE_FUNC', _datum: this.is_list_func}, 'TC_WORD');
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
		env.set('included',{_type: 'TC_NATIVE_FUNC', _datum: this.included_func}, 'TC_WORD');
		env.set('a:@',{_type: 'TC_NATIVE_FUNC', _datum: this.array_at_func}, 'TC_WORD');
		env.set('a:!',{_type: 'TC_NATIVE_FUNC', _datum: this.array_set_at_func}, 'TC_WORD');
		env.set('m:@',{_type: 'TC_NATIVE_FUNC', _datum: this.object_at_func}, 'TC_WORD');
		env.set('m:!',{_type: 'TC_NATIVE_FUNC', _datum: this.object_set_at_func}, 'TC_WORD');
		env.set('a:length',{_type: 'TC_NATIVE_FUNC', _datum: this.array_length_func}, 'TC_WORD');
		env.set('a:push',{_type: 'TC_NATIVE_FUNC', _datum: this.array_push_func}, 'TC_WORD');
		env.set('a:pop',{_type: 'TC_NATIVE_FUNC', _datum: this.array_pop_func}, 'TC_WORD');
		env.set('m:keys',{_type: 'TC_NATIVE_FUNC', _datum: this.object_keys_func}, 'TC_WORD');
		env.set('m:values',{_type: 'TC_NATIVE_FUNC', _datum: this.object_values_func}, 'TC_WORD');
		env.set('s:split',{_type: 'TC_NATIVE_FUNC', _datum: this.string_split_func}, 'TC_WORD');
		env.set('s:join',{_type: 'TC_NATIVE_FUNC', _datum: this.string_join_func}, 'TC_WORD');
		env.set('j:stringify',{_type: 'TC_NATIVE_FUNC', _datum: this.json_stringify_func}, 'TC_WORD');
		env.set('j:parse',{_type: 'TC_NATIVE_FUNC', _datum: this.json_parse_func}, 'TC_WORD');
		env.set('s:@',{_type: 'TC_NATIVE_FUNC', _datum: this.string_at_func}, 'TC_WORD');
		env.set('s:!',{_type: 'TC_NATIVE_FUNC', _datum: this.string_set_at_func}, 'TC_WORD');
		env.set('=',{_type: 'TC_NATIVE_FUNC', _datum: this.equal_func}, 'TC_WORD');
		env.set('===',{_type: 'TC_NATIVE_FUNC', _datum: this.equal_func}, 'TC_WORD');
		env.set('==',{_type: 'TC_NATIVE_FUNC', _datum: this.eq_func}, 'TC_WORD');
		env.set('<',{_type: 'TC_NATIVE_FUNC', _datum: this.num_minor_func}, 'TC_WORD');
		env.set('>',{_type: 'TC_NATIVE_FUNC', _datum: this.num_major_func}, 'TC_WORD');
		env.set('<=',{_type: 'TC_NATIVE_FUNC', _datum: this.num_min_eq_func}, 'TC_WORD');
		env.set('>=',{_type: 'TC_NATIVE_FUNC', _datum: this.num_maj_eq_func}, 'TC_WORD');
		env.set('f:slurp',{_type: 'TC_NATIVE_FUNC', _datum: this.file_slurp_func}, 'TC_WORD');
		env.set('net:request',{_type: 'TC_NATIVE_FUNC', _datum: this.net_request_func}, 'TC_WORD');
		env.set('j:require-js',{_type: 'TC_NATIVE_FUNC', _datum: this.require_js_func}, 'TC_WORD');
		env.set('!!',{_type: 'TC_NATIVE_FUNC', _datum: this.funcjs_exec_func}, 'TC_WORD');
		env.set('G:delete',{_type: 'TC_NATIVE_FUNC', _datum: this.delete_dict_func}, 'TC_WORD');
		env.set('rx:test',{_type: 'TC_NATIVE_FUNC', _datum: this.regex_test_func}, 'TC_WORD');
		env.set('rx:exec',{_type: 'TC_NATIVE_FUNC', _datum: this.regex_exec_func}, 'TC_WORD');
		env.set('rx:match',{_type: 'TC_NATIVE_FUNC', _datum: this.regex_match_func}, 'TC_WORD');
		env.set('rx:search',{_type: 'TC_NATIVE_FUNC', _datum: this.regex_search_func}, 'TC_WORD');
		env.set('rx:replace',{_type: 'TC_NATIVE_FUNC', _datum: this.regex_replace_func}, 'TC_WORD');
		env.set('a:shift',{_type: 'TC_NATIVE_FUNC', _datum: this.array_shift_func}, 'TC_WORD');
		env.set('a:unshift',{_type: 'TC_NATIVE_FUNC', _datum: this.array_unshift_func}, 'TC_WORD');
		env.set('a:each',{_type: 'TC_NATIVE_FUNC', _datum: this.array_each_func}, 'TC_WORD');
		env.set('os:parse-args',{_type: 'TC_NATIVE_FUNC', _datum: this.parse_args_func}, 'TC_WORD');
	}
};

module.exports = new NativeLib();
