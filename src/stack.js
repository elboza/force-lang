const log = require('bunny-logger');
const obj_utils = require('./obj_utils');

class Stack{
	constructor(){
		this._stack=[];
	}
	push(e){
		this._stack.unshift(e);
	}
	pop(){
		return this._stack.shift();
	}
	peek(){
		return this._stack[0];
	}
	look_at(i){
		return this._stack[i];
	}
	item_to_str(item){
		var str = '{';
		str += item._type;
		if(item._name) str += ' ' + item._name;
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