const log = require('bunny-logger');
var TokenStream = require('./token-stream');
const read = require('./read');
const env = require('./env');
const NativeLib = require('./native_lib');
const loadfile = require('./load-file');


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
						default:
							this.s.push(y);
							//log.error(`unknown type ${y._datum._type} for ${y._name}`);
							//log.error(this.where_to_str(y));
							break;
					}
				}else{
					log.error(`word not found ${e._datum}`);
					log.error(this.where_to_str(e._where));
				}	
			}
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
		for(var item of e){
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
				if(x._datum == 'see'){
					var func_name = read.read(stream);
					NativeLib.see_func(func_name._datum);
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
