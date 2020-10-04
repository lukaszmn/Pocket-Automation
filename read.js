const { loadPocket } = require('./pocket');
const inquirer = require('inquirer');
const chalk = require('chalk');
const open = require('open');
const clipboardy = require('clipboardy');

async function readPocket(pocket, app) {
	const list = await loadPocket(pocket, 10, true);

	const list2 = list.map(convertItem).filter(item => item.active);

	let index = 0;
	let continue_ = true;
	while (continue_) {
		const item = list2[index];
		const itemNumber = `${index + 1} / ${list2.length}`;
		const action = await showItem(item, itemNumber);
		[ continue_, index ] = await process({action, item, index, length: list2.length, app});
	}
}


function convertItem(item) {
	if (item.status == 0) item.status = 'Normal';
	if (item.status == 1) item.status = 'Archived';
	if (item.status == 2) item.status = 'Deleted';

	const short = {
		id: item.item_id,
		url: item.resolved_url,
		status: item.status,
		title: item.resolved_title,
		tags: Object.keys(item.tags),
		date: item.date_added,
	};

	const display = {
		id: short.id,
		active: short.status === 'Normal',
		url: short.url,
		title: short.title,
		date: short.date.toISOString().substring(0, 7),
		tags: short.tags.join('  '),
	};

	return display;
}

async function showItem(item, itemNumber) {
	console.log(`
${item.date}                                      ${itemNumber}
${chalk.cyan(item.title)} | ${chalk.blue(item.url)}
${chalk.yellow(item.tags)}
`);

	const answers = await inquirer.prompt([{
		type: 'expand',
		name: 'choice',
		message: 'Action',
		choices: [
			{name: Action.CopyUrl, key: 'c'},
			{name: Action.Open, key: 'o'},
			{name: Action.OpenArchive, key: 'u'},
			{name: Action.Archive, key: 'a'},
			new inquirer.Separator(),
			{name: Action.Skip, key: 's'},
			{name: Action.Quit, key: 'q'},
		],
	}]);
	return answers.choice;
}

async function process({action, item, index, length, app}) {
	const next = () => {
		++index;
		if (index >= length) {
			console.log('All done');
			return [ false, index ];
		}
		return [ true, index ];
	};
console.log(app);
	const openUrl = () => open(item.url, app);

	const archive = () => {
		// TODO
	};

	switch (action) {
		case Action.Archive:
			archive();
			return next();

		case Action.CopyUrl:
			await clipboardy.write(item.url);
			return [ true, index ];

		case Action.Open:
			openUrl();
			return [ true, index ];

		case Action.OpenArchive:
			openUrl();
			archive();
			return next();

		case Action.Quit:
			return [ false, index ];

		case Action.Skip:
			return next();
	}
}

const Action = {
	CopyUrl: 'Copy URL',
	Open: 'Open',
	OpenArchive: 'Open & Archive',
	Archive: 'Archive',
	Skip: 'Skip',
	Quit: 'Quit',
};

exports.readPocket = readPocket;
