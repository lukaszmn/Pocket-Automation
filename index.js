const arg = require('arg');
const fs = require('fs');
const GetPocket = require('node-getpocket');

const { printStats } = require('./stats');
const { readPocket } = require('./read');

const { auth } = require('./auth');

const args = arg({
	'--stats': Boolean,
	'--read': Boolean,
	'--app': String,
	'--arg': String,
	'--batch': Number,
	'--skip-tag': [String],
	'--auth': Boolean,
});

console.log();

if (args['--auth']) {

	auth();

} else if (args['--stats']) {

	const pocket = getPocket();
	printStats(pocket);

} else if (args['--read']) {

	let app = undefined;
	if (args['--app']) {
		if (args['--arg'])
			app = { app: [args['--app'], args['--arg'].trim()] };
		else
			app = { app: args['--app'] };
	}

	const options = {
		batch: args['--batch'],
		skipTags: args['--skip-tag'],
	};

	const pocket = getPocket();
	readPocket(pocket, options, app);

} else {
	console.log(`Pocket Reader. Arguments:

Authorize with Pocket:
	--auth

Show your Pocket statistics:
	--stats

Read your latest Pocket articles:
	--read
Options:
	--app <PATH TO WEB BROWSER> [--arg <BROWSER COMMAND-LINE ARGUMENTS]
	--batch <HOW MANY ARTICLES TO READ>
	--skip-tag <TAG TO SKIP> --skip-tag <ANOTHER TAG TO SKIP>

Note: add a space inside --arg, otherwise it may be parsed as another argument. For example:
	node index.js --read --app \"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe\" --arg \" --user-data-dir=P:\\Chrome\\User\` Data\"
`);
}

function getPocket() {
	if (!fs.existsSync('pocket.json')) {
		console.log('Please authorize first by running: pocket-reader --auth');
		process.exit();
	}
	const config = require('pocket.json');
	return new GetPocket(config);
}
