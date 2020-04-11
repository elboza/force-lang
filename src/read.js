const log = require('bunny-logger');
const JSON5 = require('json5');
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
		if(this.is_delimiter(e)) return false;
		const num = e - '0';
		return num>=0 && num<=9 ? true : false ;
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
	is_bool(e){
		if((e.peek() == 'T') || (e.peek() == 'F'))
			if(this.is_delimiter(e.lookahead(1))) return true;
		return false;
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
	is_string_single_quote(e){
		return (e == "'")? true : false ;
	}
	is_json(e){
		return (e === '{' || e === '[')? true : false ;
	}
	eat_line_comment(e){
		while(e.peek()!='\n' && e.peek()!='\r' && !this.is_eof(e.peek())){
			e.advance();
		}
		this.eat_whitespaces(e);
	}
	eat_comments(e){
		if(e.peek()=='#' && e.lookahead(1)=='!'){
			this.eat_line_comment(e);
		}
		if(e.peek()=='/' && e.lookahead(1)=='/'){
			this.eat_line_comment(e);
		}
		if(e.peek()=='\\'){
			this.eat_line_comment(e);
		}
		if(e.peek()=='-' && e.lookahead(1)=='-'){
			this.eat_line_comment(e);
		}
		if(e.peek()=='/' && e.lookahead(1)=='*'){
			while(e.peek()!='*' || e.lookahead(1)!='/'){
				if(this.is_eof(e.peek())) return;
				e.advance();
			}
			e.advance();
			e.advance();
		}
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
	eat_string_single_quote(e){
		var str = '';
		try{
			if(this.is_string_single_quote(e.peek())) e.advance();
			while(!this.is_string_single_quote(e.peek())){
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
				this.eat_comments(e);
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
				this.eat_comments(e);
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
				this.eat_comments(e);
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
	eat_bool(e){
		var str = '';
		try{
			while(!this.is_delimiter(e.peek())){
				this.eat_comments(e);
				str += e.advance();
			}
		}catch(e){

		}
		return str;
	}
	eat_word(e){
		var str = '';
		try{
			while(!this.is_delimiter(e.peek())){
				this.eat_comments(e);
				str += e.advance();
			}
		}catch(e){

		}
		return str;
	}
	eat_json(e){
		if(!this.is_json(e.peek())) return '{}';
		var opening_char, closing_char;
		if(e.peek() === '{'){
			opening_char = '{';
			closing_char = '}';
		}
		if(e.peek() === '['){
			opening_char = '[';
			closing_char = ']';
		}
		var str = '';
		var level = 0;
		var instring = 0;
		var json_line = e._line;
		var json_col = e._col;
		
		do{
			this.eat_comments(e);
			var x=e.advance();
			//if(x==='"' || x==="'") instring=instring++ mod 2
			if(x==='"' || x==="'"){
				let closing_str=x;
				let c,sstr='';
				while((c=e.advance()) != closing_str){
					sstr +=c;
				}
				x= `${closing_str}${sstr}${closing_str}`;
			}
			if(x===opening_char) level++;
			if(x===closing_char) level--;
			str += x;
		}while(e.peek()!==false && level !=0 /*&& x!==closing_char*/);
		//log.info(str);
		try{
			return JSON5.parse(str);
		}catch(err){
			log.error(`error in json obj at line ${json_line}, col ${json_col}`);
			if(e._filename) log.error(`in ${e._filename} file`);
			log.error(err);
		}
	}
	where(e){
		return {"file":e._filename, "line":e._line, "col":e._col};
	}
	read(e, filename=null){
		try{
			if(filename) {e.set_filename(filename);}
			this.eat_whitespaces(e);
			this.eat_comments(e);
			if(this.is_eof(e.peek())) return false;
			if(this.is_num(e)) return {"_type":"TC_NUM", "_where": this.where(e), "_datum": this.eat_number(e)};
			if(this.is_string(e.peek())) return {"_type":"TC_STR", "_where": this.where(e), "_datum": this.eat_string(e)};
			if(this.is_string_single_quote(e.peek())) return {"_type":"TC_STR", "_where": this.where(e), "_datum": this.eat_string_single_quote(e)};
			if(this.is_json(e.peek())) return {"_type":"TC_JSON", "_where": this.where(e), "_datum": this.eat_json(e)};
			if(this.is_bool(e)) return {"_type":"TC_BOOL", "_where": this.where(e), "_datum": this.eat_bool(e)};
			return {"_type":"TC_WORD", "_where": this.where(e), "_datum": this.eat_word(e)};
		}catch(e){
			return false;
		}
	}
};

module.exports = new Read();
