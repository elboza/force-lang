'use strict';

const log = require('bunny-logger');

class TokenStream{
  constructor(tokens, filename){
    if(!Array.isArray(tokens)){
      throw new TypeError('tokens must be passed to TokenStream as an array.');
    }
    this._tokens = tokens;
    this._line = 1;
    this._col = 1;
    this._filename = filename;
  }
  set_filename(name){
    this._filename = name;
  }
  lookahead(index) {
    if (this._tokens.length <= index) {
      throw new Error('Cannot read past the end of a stream');
    }
    return this._tokens[index];
  }
  peek() {
    if (this._tokens.length === 0) {
      throw new Error('Cannot read past the end of a stream');
    }
    return this._tokens[0];
  }
  advance() {
    if (this._tokens.length === 0) {
      throw new Error('Cannot read past the end of a stream');
    }
    this._col++;
    try{
      if(this.peek()=='\n'){
        this._col=1;
        this._line++;
      }
    }catch(e){
      //eof
      this._col--;
    }
    return this._tokens.shift();
  }
  defer(token) {
    this._col--;
    try{
      if(this.peek()=='\n'){
        this._col = 1;
        this._line--;
      }
    }catch(e){

    }
    this._tokens.unshift(token);
  }
  print(){
    if(this._filename) log.info(`in file ${this._filename}`);
    log.info(`at line ${this._line} , col ${this._col}`);
  }
  print_err(){
    if(this._filename) log.error(`in file ${this._filename}`);
    log.error(`at line ${this._line} , col ${this._col}`);
  }
};

module.exports = TokenStream;

