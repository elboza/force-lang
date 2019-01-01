const {promisify} = require('util');
const fs = require('fs');

const fs_readFile = promisify(fs.readFile);

module.exports = {
	load: async filename => {
		var x;
		try{
			x = await fs_readFile(filename, 'utf8');
		}catch(e){
			log.error(`error loading ${filename} file`);
			process.exit(1);
		}
		return x;
	}
}