const log = require('bunny-logger');
const Stack = require('./stack');

class dict_obj{
	constructor(){
		this._type = null;
		this._name = null;
		this._datum = null;
		this._where = null;
	}
}
class Env{
	constructor(){
		this._use_ns = false;
		this._dict = [];
		this._dict_ns = {};

		this.s = new Stack();
	}
	print_stack(){
		this.s.print();
	}
	TOS(){
		return this.s.peek();
	}
	TOS2(){
		return this.s.look_at(1);
	}
	is_bool(e){
		if(e && e._type=='TC_BOOL') return true;
		return false;
	}
	is_true(e){
		if(e && e._type=='TC_BOOL' && e._datum=='T') return true;
		return false;
	}
	is_false(e){
		if(e && e._type=='TC_BOOL' && e._datum=='F') return true;
		return false;
	}
	is_num(e){
		if(e && e._type=='TC_NUM') return true;
		return false;
	}
	is_string(e){
		if(e && e._type=='TC_STR') return true;
		return false;
	}
	is_json(e){
		if(e && e._type=='TC_JSON') return true;
		return false;
	}
	is_obj(e){
		if(e && e._type=='TC_JSON' && !this.is_list(e)) return true;
		return false;
	}
	is_list(e){
		if(e && e._type=='TC_JSON' && e._datum instanceof Array) return true;
		return false;
	}
	true_obj(){
		return {"_type":"TC_BOOL","_datum": 'T'};
	}
	false_obj(){
		return {"_type":"TC_BOOL","_datum": 'F'};
	}
	adj_bool_val(e){
		if(e===true) return 'T';
		if(e===false) return 'F';
		return e;
	}
	guess_type(e){
		switch(typeof(e)){
			case 'number':
				return 'TC_NUM';
				break;
			case 'string':
				return 'TC_STR';
				break;
			case 'object':
				if(e instanceof Promise) return 'TC_PROMISE';
				return 'TC_JSON';
				break;
			case 'boolean':
				return 'TC_BOOL';
				break;
			case 'function':
				return 'TC_FUNC_JS';
				break;
			default:
				return 'TC_UNDEF';
				break;
		}
	}
	get_bool_val(e){
		if(this.is_bool(e)){
			if(this.is_true(e)) return true;
			if(this.is_false(e)) return false;
		}
	}
	set_bool_val(e){
		if(e===true) return this.true_obj();
		if(e===false) return this.false_obj();
	}
	lookup_ns(name){

	}
	lookup_norm(name, type){
		for(var item of this._dict){
			//if(type && item._type == type)
			if(item._name == name) return item;
		}
		return false;
	}
	lookup(name, type){
		return this.lookup_norm(name, type);
	}
	delete_norm(name){
		let index = this._dict.map(function(e) { return e._name; }).indexOf(name);
		//log.info(index);
		//log.info(this._dict[index]);
		if(index > 0) {
			this._dict.splice(index,1);
		} else {
			throw("word not found.");
		}
	}
	delete(name){
		return this.delete_norm(name);
	}
	set_ns(name, val){

	}
	set_norm(name, val, type, where){
		var x;
		if(x=this.lookup(name)){
			x._datum = val;
		}else{
			this.add_norm(name, val, type, where);
		}
	}
	add_norm(name, val, type, where){
		var x;
		x=new dict_obj();
			x._type = type;
			x._name = name;
			x._datum = val;
			x._where = where;
			this._dict.unshift(x);
	}
	set(name, val, type, where){
		this.add_norm(name, val, type, where);
		//this.set_norm(name, val, type, where);
	}
	print_debug(){
		//log.info(this._dict);
		this._dict.forEach(item => {
			log.info(`${item._type} ${item._name} ${item._datum._type}`);
		});
	}
};

module.exports = new Env();
