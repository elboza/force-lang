const log = require('bunny-logger');
const obj_utils = require('./obj_utils');

class Stack{
	constructor(){
		this._stack=[];
		this._rstack=[];
	}
	cloneJS(e) {
		return typeof(e) === 'object' ? JSON.parse(JSON.stringify(e)) : e;
	}
	push(e){
		this._stack.unshift(e);
	}
	pop(){
		return this._stack.shift();
	}
	rpush(e){
		this._rstack.unshift(e);
	}
	rpop(){
		return this._rstack.shift();
	}
	peek(){
		return this.cloneJS(this._stack[0]);
	}
	rpeek(){
		return this._rstack[0];
	}
	look_at(i){
		return this.cloneJS(this._stack[i]);
	}
	get_list(){
		return this._stack;
	}
	item_to_str(item){
		var str = '{';
		str += item._type;
		if(item._name) str += ' ' + item._name;
		try{
		switch(item._type){
			case 'TC_NUM':
			case 'TC_STR':
			case 'TC_BOOL':
				str += ' ' + item._datum;
				break;
			case 'TC_VAR':
				if(item._datum._type=='TC_JSON') str += ' ' + obj_utils.stringify(item._datum._datum);
				else str += ' ' + item._datum._datum;
				break;
			case 'TC_JSON':
				str += ' ' + obj_utils.stringify(item._datum);
				break;
			case 'TC_FUNC_JS':
				str += ' ' + obj_utils.stringify(item._datum);
				break;
			case 'TC_LAMBDA_FUNC':
				str += ' ' //+ JSON.stringify(item._datum._datum);
				break;
			case 'TC_ERR':
				str += ' ' + JSON.stringify(item._datum);
				break;
			case 'TC_PROMISE':
				str += ' ' + item._datum;
				break;
			default:
				break;
		}
		}catch(e) {
			str += ' ... ';
		}
		str += '}';
		return str;
	}
	print(){
		var pos=1;
		if(this._stack.length == 0){
			log.info('(empty)');
			return;
		}
		for(var item of this._stack){
			log.info(`${pos}: ${this.item_to_str(item)}`);
			pos++;
		}
	}
	print_debug(){
		log.info(this._stack);
	}
}

module.exports = Stack;