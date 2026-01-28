import log from 'bunny-logger';
import env from './env.js';

class Error {
  constructor() {
    this.env_stack = [];
  }

  add_stack(e) {
    this.env_stack.push(e);
  }

  pop_stack() {
    this.env_stack.pop();
  }

  print_env_stack() {
    log.error('err stack trace ...');
    this.env_stack
      .reverse()
      .filter(e => e._where.file)
      .map(e => {
        log.error(`in '${e._datum}' ${this.where_to_str(e._where)}`);
      });
  }

  where_to_str(where) {
    let str = '';
    if (where.file) {
      str += `in ${where.file} `;
    }
    str += `at ${where.line},${where.col}`;
    return str;
  }

  throw(msg, code) {
    return this.new(msg, code);
  }

  new(msg, code) {
    return {
      _type: 'TC_ERR',
      _where: undefined,
      _datum: { msg, code },
    };
  }

  require_handle(info_str) {
    if (env.TOS() && env.TOS()._type == 'TC_ERR') {
      const x = env.s.pop();
      x._datum._msg += info_str;
      env.s.push(x);
      return true;
    }
    return false;
  }

  handle_repl() {
    if (this.require_handle()) {
      log.error(`ERR: ${env.s.pop()._datum.msg}`);
      this.print_env_stack();
    }
  }

  handle_standard() {
    if (this.require_handle()) {
      const e = env.s.pop();
      log.error(`ERR: ${e._datum.msg}`);
      this.print_env_stack();
      process.exit(e._datum.code ? e._datum.code : 1);
    }
  }
}

export default new Error();
