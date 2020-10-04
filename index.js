const arg = require('arg');
const GetPocket = require('node-getpocket');

const printStats = require('./stats').printStats;
const readPocket = require('./read').readPocket;

const config = require('./pocket.json');


/* authorization:
npm i express
npm i stdio
node_modules\node-getpocket\authorise.js --consumerkey "..."

DOCS: https://github.com/vicchi/node-getpocket

Add pocket.json file:
{
	"consumer_key": "YOUR KEY",
	"access_token": "YOUR TOKEN"
}
*/

const args = arg({
	'--stats': Boolean,
	'--read': Boolean,
	'--app': String,
	'--arg': String,
});

const pocket = new GetPocket(config);

console.log();

if (args['--stats']) {
	printStats(pocket);
} else if (args['--read']) {
	let app = undefined;
	if (args['--app']) {
		if (args['--arg'])
			app = { app: [args['--app'], args['--arg'].trim().replace(/'/g, '"')] };
		else
			app = { app: args['--app'] };
	}
	console.log(app);
	readPocket(pocket, app);
} else {
	console.log(`Usage:
	npm run stats
	npm run read [-- --app="chrome" [--arg=" --incognito"]]

Alternatively:
	node index.js -- --stats

Note: add a space inside --arg, otherwise it may be parsed as another argument.
For convenience, single quotes will be replaced with double quotes.`);
}
