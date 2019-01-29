const {promisify} = require('util');
const fs = require('fs');
const log = require('bunny-logger');
const path = require('path');
const env = require('./env');

const fs_readFile = promisify(fs.readFile);

module.exports = {
	load: async filename => {
		var x;
		try{
			x = await fs_readFile(filename, 'utf8');
		}catch(e){
			throw(`error loading ${filename} file`);
			//log.error(`error loading ${filename} file`);
			//process.exit(1);
		}
		return x;
	},
	loadsync: filename => {
		var x;
		try {
			x = fs.readFileSync(filename, 'utf8');
		}catch(e){
			throw(`error loading ${filename} file`);
			//log.error(`error loading ${filename} file`);
			//process.exit(1);
		}
		return x;
	},
	resolve_path: filename => {
		const bin = env.lookup('os:bin')._datum._datum;
		let xpath = (bin=='')? path.resolve(bin) : path.dirname(path.resolve(bin));
		xpath= path.join(xpath, filename);
		return xpath;
	}
}