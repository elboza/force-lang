const log = require('bunny-logger');
const env = require('./env');

class Error {
	constructor(){

	}
	throw(msg, code){
		return this.new(msg, code);
	}
	new(msg, code){
		return {
			"_type" : "TC_ERR",
			"_where": undefined,
			"_datum": {"msg":msg,"code":code}
		}
	}
	require_handle(info_str){
		if(env.TOS() && env.TOS()._type == 'TC_ERR'){
			var x=env.s.pop();
			x._datum._msg += info_str;
			env.s.push(x);
			return true;
		}
		return false;
	}
	handle_repl(){
		if(this.require_handle()){
			log.error(`ERR: ${env.s.pop()._datum.msg}`);
		}
	}
	handle_standard(){
		if(this.require_handle()){
			const e = env.s.pop();
			log.error(`ERR: ${e._datum.msg}`);
			process.exit(e._datum.code ? e._datum.code : 1);
		}
	}
}

module.exports = new Error();