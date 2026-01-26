import log from 'bunny-logger';
import TokenStream from './token-stream.js';
import read from './read.js';
import env from './env.js';
// const NativeLib = require('./native_lib');
import loadfile from './load-file.js';
import err from './error.js';

class Eval {
  constructor() {
    this.mode = 'interpret';
    this.s = env.s;
    this._load_lib = true;
    // if(this._load_lib) this.load_lib();
  }

  async load_lib() {
    const x = await loadfile.load(`${import.meta.dirname}/lib.j`);
    await this.eval(x);
  }

	//deprecated ??
  load_lib_sync() {
    const x = loadfile.loadsync(`${import.meta.dirname}/lib.j`);
    this.eval(x);
  }

  see_func(func_name) {
    const x = env.lookup(func_name);
    if (!x) {
      log.info('no word found...');
      return;
    }
    switch (x._datum._type) {
      case 'TC_NATIVE_FUNC':
        log.info(`: ${x._name}`);
        log.info('<native func> ;');
        break;
      case 'TC_COMP_FUNC':
        log.info(`: ${x._name}`);
        process.stdout.write(`  `);
        for (const n of x._datum._datum) {
          process.stdout.write(`${n._datum} `);
        }
        log.info('');
        break;
      default:
        log.info('not a word...');
        break;
    }
  }

  set_mode(x) {
    if (x === 'interpret' || x === 'compile') {
      this.mode = x;
    }
  }

  where_to_str(where) {
    let str = '';
    if (where.file) {
      str += `in ${where.file} `;
    }
    str += `at ${where.line},${where.col}`;
    return str;
  }

  eval_lambda(stream, list) {
    this.mode = 'compile';
    let y;
    const body = [];
    // var func_name = read.read(stream);
    let level = 0;
    const list_copy = list;
    if (list) {
      while ((y = list_copy.shift())) {
        if (y._datum == '(') {
          level++;
        }
        if (y._datum == ')') {
          if (level == 0) {
            this.mode = 'interpret';
            break;
          }
          level--;
        }
        body.push(y);
      }
    } else {
      while ((y = read.read(stream)) != false) {
        if (y._datum == '(') {
          level++;
        }
        if (y._datum == ')') {
          if (level == 0) {
            this.mode = 'interpret';
            break;
          }
          level--;
        }
        body.push(y);
      }
    }
    env.s.push({ _type: 'TC_LAMBDA_FUNC', _datum: body });
    return list_copy;
  }

  async eval_if(stream, list) {
    // log.info('if.:.');
    let y;
    let body = [];
    let else_body = [];
    let then_body = [];
    let level = 0;
    if (list) {
      // var list_copy=JSON.parse(JSON.stringify(list));
      var list_copy = list;
      while ((y = list_copy.shift())) {
        if (y._datum == 'if') {
          level++;
        }
        if (y._datum == 'then') {
          if (level == 0) {
            then_body = body;
            break;
          } else {
            level--;
          }
        }
        if (y._datum == 'else') {
          if (level == 0) {
            else_body = body;
            body = [];
            continue;
          }
        }
        body.push(y);
      }
    } else {
      while ((y = read.read(stream)) != false) {
        if (y._datum == 'if') {
          level++;
        }
        if (y._datum == 'then') {
          if (level == 0) {
            then_body = body;
            break;
          } else {
            level--;
          }
        }
        if (y._datum == 'else') {
          if (level == 0) {
            else_body = body;
            body = [];
            continue;
          }
        }
        body.push(y);
      }
    }
    // log.info({else_body});
    // log.info({then_body});
    if (env.is_true(env.s.pop())) {
      await this.eval_parsed(then_body);
    } else {
      await this.eval_parsed(else_body);
    }
    return list_copy;
  }

  async eval_while(stream, list) {
    // log.info('while.:.');
    let y;
    let body = [];
    let test_body = [];
    let while_body = [];
    let level = 0;
    const list_copy = list;
    if (list) {
      // 	//var list_copy=JSON.parse(JSON.stringify(list));
      // var list_copy=list;
      while ((y = list_copy.shift())) {
        if (y._datum == 'begin') {
          level++;
        }
        if (y._datum == 'repeat') {
          if (level == 0) {
            while_body = body;
            break;
          } else {
            level--;
          }
        }
        if (y._datum == 'while') {
          if (level == 0) {
            test_body = body;
            body = [];
            continue;
          }
        }
        body.push(y);
      }
    } else {
      while ((y = read.read(stream)) != false) {
        if (y._datum == 'begin') {
          level++;
        }
        if (y._datum == 'repeat') {
          if (level == 0) {
            while_body = body;
            break;
          } else {
            level--;
          }
        }
        if (y._datum == 'while') {
          if (level == 0) {
            test_body = body;
            body = [];
            continue;
          }
        }
        body.push(y);
      }
    }
    // log.info({test_body});
    // log.info({while_body});
    while (true) {
      await this.eval_parsed(test_body);
      if (!env.is_true(env.s.pop())) {
        break;
      }
      await this.eval_parsed(while_body);
    }
    return list_copy;
  }

  async eval_case(stream, list) {
    // log.info('case.:.');
    let y;
    let body = [];
    let test_body = [];
    let case_body = [];
    const case_list = [];
    let level = 0;
    const list_copy = list;
    if (list) {
      while ((y = list_copy.shift())) {
        if (y._datum == 'case') {
          level++;
        }
        if (y._datum == 'endcase') {
          if (level == 0) {
            break;
          } else {
            level--;
          }
        }
        if (y._datum == 'of') {
          if (level == 0) {
            test_body = body;
            body = [];
            continue;
          }
        }
        if (y._datum == 'endof') {
          if (level == 0) {
            case_body = body;
            body = [];
            case_list.push({ test_body, case_body });
            continue;
          }
        }
        body.push(y);
      }
    } else {
      while ((y = read.read(stream)) != false) {
        if (y._datum == 'case') {
          level++;
        }
        if (y._datum == 'endcase') {
          if (level == 0) {
            break;
          } else {
            level--;
          }
        }
        if (y._datum == 'of') {
          if (level == 0) {
            test_body = body;
            body = [];
            continue;
          }
        }
        if (y._datum == 'endof') {
          if (level == 0) {
            case_body = body;
            body = [];
            case_list.push({ test_body, case_body });
            continue;
          }
        }
        body.push(y);
      }
    }
    // log.info({case_list});
    // let x = env.s.pop();
    for (const item of case_list) {
      // log.info(item.test_body);
      await this.eval_parsed(item.test_body);
      const y = env.s.pop();
      if (env.is_true(y) /* || x._datum == y._datum */) {
        // log.info(item.case_body);//????
        await this.eval_parsed(item.case_body);
        break;
      }
    }
    return list_copy;
  }

  async eval_parsed_step(e) {
    let y;
    if (this.mode == 'interpret') {
      if (e._type == 'TC_NUM') {
        this.s.push(e);
      }
      if (e._type == 'TC_STR') {
        this.s.push(e);
      }
      if (e._type == 'TC_JSON') {
        this.s.push(e);
      }
      if (e._type == 'TC_BOOL') {
        this.s.push(e);
      }
      if (e._type == 'TC_WORD') {
        if ((y = env.lookup(e._datum))) {
          switch (y._datum._type) {
          case 'TC_NATIVE_FUNC':
            err.add_stack(e);
            await y._datum._datum.call();
            err.pop_stack();
            break;
          case 'TC_COMP_FUNC':
            err.add_stack(e);
            await this.eval_parsed(y._datum._datum);
            err.pop_stack();
            break;
          case 'TC_FUNC_JS':
            // await this.eval_parsed(y._datum._datum);
            log.info('js func...');
            break;
          default:
            this.s.push(y);
            // log.error(`unknown type ${y._datum._type} for ${y._name}`);
            // log.error(this.where_to_str(y));
            break;
          }
        } else {
          env.s.push(err.throw(`word not found '${e._datum}' ${this.where_to_str(e._where)}`));
        }
      }
      if (err.require_handle(` ${e._datum} ${this.where_to_str(e._where)}`)) {
        await this.eval('handle');
      }
    }
    if (this.mode == 'compile') {
      if (e._type == 'TC_WORD') {
        if (e._datum == ';') {
          this.mode = 'interpret';
        }
      }
    }
  }

  async eval_parsed(e) {
    let item;
    let list_copy = JSON.parse(JSON.stringify(e));
    // for(var item of e){
    while ((item = list_copy.shift())) {
      if (item._datum == '(') {
        list_copy = this.eval_lambda(null, list_copy);
        continue;
      }
      if (item._datum == 'if') {
        list_copy = await this.eval_if(null, list_copy);
        continue;
      }
      if (item._datum == 'begin') {
        list_copy = await this.eval_while(null, list_copy);
        continue;
      }
      if (item._datum == 'case') {
        list_copy = await this.eval_case(null, list_copy);
        continue;
      }
      if (item._datum == ';' || item._datum == 'exit') {
        break;
      }
      await this.eval_parsed_step(item);
    }
  }

  async eval(e, filename = null) {
    const stream = read.tokenize(e);
    let x;
    while ((x = read.read(stream, filename)) != false) {
      // log.info(x);
      if (x._type == 'TC_NOP') {
		  continue;
	  }
      if (x._type == 'TC_WORD') {
        if (x._datum == 'var') {
          const newvar = read.read(stream);
          env.set(newvar._datum, { _type: 'TC_NUM', _datum: 0 }, 'TC_VAR', newvar._where);
          continue;
        }
        if (x._datum == ':') {
          this.mode = 'compile';
          var y;
          const body = [];
          var func_name = read.read(stream);
          while ((y = read.read(stream)) != false) {
            body.push(y);
            if (y._datum == ';') {
              this.mode = 'interpret';
              break;
            }
          }
          env.set(func_name._datum, { _type: 'TC_COMP_FUNC', _datum: body }, 'TC_COMP_FUNC', func_name._where);
          continue;
        }
        if (x._datum == '(') {
          this.eval_lambda(stream);
          continue;
        }
        if (x._datum == 'see') {
          var func_name = read.read(stream);
          this.see_func(func_name._datum);
          continue;
        }
        if (x._datum == 'if') {
          await this.eval_if(stream);
          continue;
        }
        if (x._datum == 'begin') {
          await this.eval_while(stream);
          continue;
        }
        if (x._datum == 'case') {
          await this.eval_case(stream);
          continue;
        }
      }
      await this.eval_parsed_step(x);
    }
    // this.s.print();
    // env.print_debug();
  }
}

export default new Eval();
