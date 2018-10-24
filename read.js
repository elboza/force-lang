const log = require('bunny-logger');
var TokenStream = require('./token-stream');

class Read{
	tokenize(e){
		return new TokenStream(e.split(''));
	}
	is_delimiter(e){
		if(this.is_whitespace(e) || this.is_eof(e)) return true;
		return false;
	}
	is_whitespace(e){
		const ws = [' ','\n','\r','\t'];
		return ws.includes(e);
	}
	is_digit(e){
		if(this.is_eof(e)) return false;
		const num = e - '0';
		return e>=0 && e<=9 ? true : false ;
	}
	is_hex_digit(e){
		if(this.is_eof(e)) return false;
		const hex_letters = ['a','b,','c','d','e','f'];
		if(this.is_digit(e) || hex_letters.includes(e.toLowerCase())) return true;
		return false;
	}
	is_bin_digit(e){
		if(this.is_eof(e)) return false;
		return e == 0 || e == 1 ? true : false ;
	}
	is_num(e){
		if( (e.peek() == '+' && this.is_digit(e.lookahead(1))) || 
			(e.peek() == '-' ) && this.is_digit(e.lookahead(1))|| 
			this.is_digit(e.peek())
			){
			return true;
		}
		return false;
	}
	is_eof(e){
		return e===false;
	}
	eat_whitespaces(e){
		try{
			while(this.is_whitespace(e.peek())){
				e.advance();
			}
		}catch(e){

		}
	}
	is_string(e){
		return (e == '"')? true : false ;
	}
	eat_string(e){
		var str = '';
		try{
			if(this.is_string(e.peek())) e.advance();
			while(!this.is_string(e.peek())){
				if(e.peek()=='\\'){
					switch(e.lookahead(1)){
						case 'n':
							str += '\n';
							e.advance();e.advance();
							break;
						case 'r':
							str += '\r';
							e.advance();e.advance();
							break;
						case '\\':
							str += '\\';
							e.advance();e.advance();
							break;
						case '"':
							str += '"';
							e.advance();e.advance();
							break;
						default:
							str += e.advance();
							break;
					}
				}else
				str += e.advance();
			}
			e.advance();
		}catch(e){

		}
		return str;
	}
	eat_number(e){
		let sign = 1;
		var num=0;
		var fract=false;
		var fract_num=0;
		try{
			if(e.peek() == '-') {sign = -1;e.advance();}
			if(e.peek()=='0' && e.lookahead(1) == 'x') return sign*this.eat_hex(e);
			if(e.peek()=='0' && e.lookahead(1) == 'b') return sign*this.eat_bin(e);
			while(!this.is_delimiter(e.peek())){
				if(!fract && this.is_digit(e.peek())) num = num*10 + (e.advance()-'0');
				else if(fract && this.is_digit(e.peek())) fract_num = fract_num*10 + (e.advance()-'0');
				else if(e.peek()=='.'){fract=true;e.advance();}
				else {
					log.error('syntax error. invalid number');
					e.print_err();
					process.exit(1);
				}
			}
		}catch(e){

		}
		return fract ? sign*parseFloat(`${num}.${fract_num}`) : sign*num;
	}
	eat_hex(e){
		var str = '';
		try{
			if(e.peek()=='0' && e.lookahead(1) == 'x'){e.advance();e.advance();}
			while(!this.is_delimiter(e.peek())){
				if(this.is_hex_digit(e.peek())){
					str += e.advance();
				}
				else {
					log.error('syntax error. invalid number');
					e.print_err();
					process.exit(1);
				}
			}
		}catch(e){

		}
		return parseInt(str,16);
	}
	eat_bin(e){
		var str = '';
		try{
			if(e.peek()=='0' && e.lookahead(1) == 'b'){e.advance();e.advance();}
			while(!this.is_delimiter(e.peek())){
				if(this.is_bin_digit(e.peek())){
					str += e.advance();
				}
				else {
					log.error('syntax error. invalid number');
					e.print_err();
					process.exit(1);
				}
			}
		}catch(e){

		}
		return parseInt(str,2);
	}
	eat_comments(e){

	}
	eat_word(e){
		var str = '';
		try{
			while(!this.is_delimiter(e.peek())){
				str += e.advance();
			}
		}catch(e){

		}
		return str;
	}
	where(e){
		return {"file":e._filename, "line":e._line, "col":e._col};
	}
	read(e){
		try{
			this.eat_whitespaces(e);
			if(this.is_eof(e.peek())) return false;
			if(this.is_num(e)) return {"_type":"TC_NUM", "_where": this.where(e), "_datum": this.eat_number(e)};
			if(this.is_string(e.peek())) return {"_type":"TC_STR", "_where": this.where(e), "_datum": this.eat_string(e)};
			return {"_type":"TC_WORD", "_where": this.where(e), "_datum": this.eat_word(e)};
		}catch(e){
			return false;
		}
	}
};

module.exports = new Read();
