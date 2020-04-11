const log = require('bunny-logger');
var TokenStream = require('./token-stream');
const read = require('./read');
const env = require('./env');
//const NativeLib = require('./native_lib');
const loadfile = require('./load-file');
const err = require('./error');


class Eval{

	constructor(){
		this.mode = 'interpret';
		this.s = env.s;
		this._load_lib = true;
		//if(this._load_lib) this.load_lib();
	}

	async load_lib(){
		var x = await loadfile.load(__dirname + '/lib.j');
		this.eval(x);
	}

	load_lib_sync(){
		var x = loadfile.loadsync(__dirname + '/lib.j');
		this.eval(x);
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

	set_mode(x){
		if(x === 'interpret' || x === 'compile'){
			this.mode = x;
		}
	}

	where_to_str(where){
		var str = '';
		if(where.file) str += 'in ' + where.file +' ';
		str += 'at ' + where.line +','+ where.col;
		return str;
	}
	eval_if(stream, list){
		//log.info('if.:.');
		var y;
		var body = [];
		var else_body = [];
		var then_body = [];
		var level=0;
		if(list){
			//var list_copy=JSON.parse(JSON.stringify(list));
			var list_copy=list;
			while(y=list_copy.shift()){
				if(y._datum=='if') {level++;}
				if(y._datum=='then') { if(level==0){then_body = body; break;}else{level--;}}
				if(y._datum=='else') { if(level==0) {else_body = body; body = []; continue;}}
				body.push(y);
			}
		} else {
			while((y=read.read(stream))!=false){
				if(y._datum=='if') {level++;}
				if(y._datum=='then') { if(level==0){then_body = body; break;}else{level--;}}
				if(y._datum=='else') { if(level==0) {else_body = body; body = []; continue;}}
				body.push(y);
			}
		}
		//log.info({else_body});
		//log.info({then_body});
		if(env.is_true(env.s.pop())){
			this.eval_parsed(then_body);
		} else {
			this.eval_parsed(else_body);
		}
		return list_copy;
	}
	eval_while(stream, list){
		//log.info('while.:.');
		var y;
		var body = [];
		var test_body = [];
		var while_body = [];
		var level=0;
		var list_copy=list;
		if(list){
		// 	//var list_copy=JSON.parse(JSON.stringify(list));
			// var list_copy=list;
			while(y=list_copy.shift()){
				if(y._datum=='begin') {level++;}
				if(y._datum=='repeat') { if(level==0){while_body = body; break;}else{level--;}}
				if(y._datum=='while') { if(level==0) {test_body = body; body = []; continue;}}
				body.push(y);
			}
		} else {
			while((y=read.read(stream))!=false){
				if(y._datum=='begin') {level++;}
				if(y._datum=='repeat') { if(level==0){while_body = body; break;}else{level--;}}
				if(y._datum=='while') { if(level==0) {test_body = body; body = []; continue;}}
				body.push(y);
			}
		}
		//log.info({test_body});
		//log.info({while_body});
		while(true){
			this.eval_parsed(test_body);
			if(!env.is_true(env.s.pop())) break;
			this.eval_parsed(while_body);
		}
		return list_copy;
	}
	eval_case(stream, list){
		//log.info('case.:.');
		var y;
		var body = [];
		var test_body = [];
		var case_body = [];
		var case_list = [];
		var level=0;
		var list_copy=list;
		if(list){
			while(y=list_copy.shift()){
				if(y._datum=='case') {level++;}
				if(y._datum=='endcase') { if(level==0){break;}else{level--;}}
				if(y._datum=='of') { if(level==0) {test_body = body; body = []; continue;}}
				if(y._datum=='endof') { if(level==0) {case_body = body; body = []; case_list.push({test_body, case_body});continue;}}
				body.push(y);
			}
		} else {
			while((y=read.read(stream))!=false){
				if(y._datum=='case') {level++;}
				if(y._datum=='endcase') { if(level==0){break;}else{level--;}}
				if(y._datum=='of') { if(level==0) {test_body = body; body = []; continue;}}
				if(y._datum=='endof') { if(level==0) {case_body = body; body = []; case_list.push({test_body, case_body});continue;}}
				body.push(y);
			}
		}
		//log.info({case_list});
		//let x = env.s.pop();
		for(var item of case_list){
			//log.info(item.test_body);
			this.eval_parsed(item.test_body);
			let y = env.s.pop();
			if(env.is_true(y) /*|| x._datum == y._datum*/){
				//log.info(item.case_body);//????
				this.eval_parsed(item.case_body);
				break;
			}
		}
		return list_copy;
	}
	eval_parsed_step(e){
		var y;
		if(this.mode == 'interpret'){
			if(e._type == 'TC_NUM') this.s.push(e);
			if(e._type == 'TC_STR') this.s.push(e);
			if(e._type == 'TC_JSON') this.s.push(e);
			if(e._type == 'TC_BOOL') this.s.push(e);
			if(e._type == 'TC_WORD'){
				if(y=env.lookup(e._datum)){
					switch(y._datum._type){
						case 'TC_NATIVE_FUNC':
							y._datum._datum.call();
							break;
						case 'TC_COMP_FUNC':
							this.eval_parsed(y._datum._datum);
							break;
						case 'TC_FUNC_JS':
							//this.eval_parsed(y._datum._datum);
							log.info('js func...');
							break;
						default:
							this.s.push(y);
							//log.error(`unknown type ${y._datum._type} for ${y._name}`);
							//log.error(this.where_to_str(y));
							break;
					}
				}else{
					env.s.push(err.throw(`word not found '${e._datum}' ${this.where_to_str(e._where)}`));
				}	
			}
			if(err.require_handle(` ${e._datum} ${this.where_to_str(e._where)}`)) this.eval('handle');;
		}
		if(this.mode == 'compile'){
			if(e._type == 'TC_WORD'){
				if(e._datum == ';'){
					this.mode = 'interpret';
					return;
				}
			}
		}
	}
	eval_parsed(e){
		var item;
		var list_copy=JSON.parse(JSON.stringify(e));
		//for(var item of e){
		while(item=list_copy.shift()){
			if(item._datum == 'if'){
					//log.info('if.:.');
					list_copy=this.eval_if(null,list_copy);
					continue;
				}
				if(item._datum == 'begin'){
					list_copy=this.eval_while(null,list_copy);
					continue;
				}
				if(item._datum == 'case'){
					list_copy=this.eval_case(null,list_copy);
					continue;
				}
			if(item._datum == ';' || item._datum == 'exit') break;
			this.eval_parsed_step(item);
		}
	}
	eval(e){
		var stream = read.tokenize(e);
		var x;
		while((x=read.read(stream))!=false){
			//log.info(x);
			if(x._type == 'TC_WORD'){
				if(x._datum == 'var'){
					var newvar = read.read(stream);
					env.set(newvar._datum, {_type: 'TC_NUM', _datum: 0}, 'TC_VAR', newvar._where);
					continue;
				}
				if(x._datum == ':'){
					this.mode = 'compile';
					var y;
					var body = [];
					var func_name = read.read(stream);
					while((y=read.read(stream))!=false){
						body.push(y);
						if(y._datum==';') {this.mode = 'interpret'; break;}
					}
					env.set(func_name._datum, {_type: 'TC_COMP_FUNC', _datum: body}, 'TC_COMP_FUNC', func_name._where);
					continue;
				}
				if(x._datum == '('){
					this.mode = 'compile';
					var y;
					var body = [];
					//var func_name = read.read(stream);
					var level=0;
					while((y=read.read(stream))!=false){
						if(y._datum=='(') level++;
						if(y._datum==')') {
							if(level==0) {
								this.mode = 'interpret'; break;
							}
							level--;
						}
						body.push(y);
					}
					//env.set(func_name._datum, {_type: 'TC_LAMBDA_FUNC', _datum: body}, 'TC_LAMBDA_FUNC', func_name._where);
					env.s.push({_type: 'TC_LAMBDA_FUNC', _datum: body})
					continue;
				}
				if(x._datum == 'see'){
					var func_name = read.read(stream);
					this.see_func(func_name._datum);
					continue;
				}
				if(x._datum == 'if'){
					this.eval_if(stream);
					continue;
				}
				if(x._datum == 'begin'){
					this.eval_while(stream);
					continue;
				}
				if(x._datum == 'case'){
					this.eval_case(stream);
					continue;
				}
			}
			this.eval_parsed_step(x);
		}
		//this.s.print();
		//env.print_debug();
	}
};

module.exports = new Eval();
