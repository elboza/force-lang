import { promisify } from 'util';
import fs from 'fs';
import log from 'bunny-logger';
import path from 'path';
import env from './env.js';

const fs_readFile = promisify(fs.readFile);

export default {
  load: async filename => {
    let x;
    try {
      x = await fs_readFile(filename, 'utf8');
    } catch (e) {
      throw `error loading ${filename} file`;
      // log.error(`error loading ${filename} file`);
      // process.exit(1);
    }
    return x;
  },
  loadsync: filename => {
    let x;
    try {
      x = fs.readFileSync(filename, 'utf8');
    } catch (e) {
      throw `error loading ${filename} file`;
      // log.error(`error loading ${filename} file`);
      // process.exit(1);
    }
    return x;
  },
  writesync: (filename, data) => {
    try {
      fs.writeFileSync(filename, data);
    } catch (e) {
      throw `error writing to ${filename} file`;
      // log.error(`error loading ${filename} file`);
      // process.exit(1);
    }
  },
  appendsync: (filename, data) => {
    try {
      fs.appendFileSync(filename, data);
    } catch (e) {
      throw `error writing to ${filename} file`;
      // log.error(`error loading ${filename} file`);
      // process.exit(1);
    }
  },
  existssync: filename => {
    try {
      return fs.existsSync(filename);
    } catch (e) {
      throw `error writing to ${filename} file`;
      // log.error(`error loading ${filename} file`);
      // process.exit(1);
    }
  },
  resolve_path: filename => {
    const bin = env.lookup('os:bin')._datum._datum;
    let xpath = bin == '' ? path.resolve(bin) : path.dirname(path.resolve(bin));
    xpath = filename.startsWith('/') ? filename : path.join(xpath, filename);
    return xpath;
  },
};
