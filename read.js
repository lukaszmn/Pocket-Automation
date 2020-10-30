const { loadPocket } = require('./pocket');
const inquirer = require('inquirer');
const chalk = require('chalk');
const open = require('open');
const clipboardy = require('clipboardy');
const fs = require('fs').promises;

const DEFAULT_ITEMS_AT_ONCE = 10;
const KB_PATH = 'kb.txt';

/**
 * @param {object} pocket Pocket object
 * @param {object} options Options
 * @param {number} options.batch Batch size
 * @param {string[]} options.skipTags List of tags that should be skipped
 * @param {object} app Browser
 * @param {string | string[]} app.app Path to exe and (in second array's element) its arguments
 */
async function readPocket(pocket, options, app) {
	options.batch = options.batch || DEFAULT_ITEMS_AT_ONCE;
	options.skipTags = options.skipTags || [];

	const list = [];
	let offset = 0;
	while (list.length < options.batch) {
		const rawPartialList = await loadPocket(pocket, {
			count: options.batch,
			offset,
			getUnread: true,
			getArchived: false,
			sortNewestFirst: true,
		});

		if (rawPartialList.length === 0)
			break;

		const cleanedPartialList = rawPartialList.map(convertItem)
			.filter(item => item.active)
			.filter(item => !options.skipTags.some(tag => item.tagsArr.includes(tag)));

		const remainingCount = Math.min(cleanedPartialList.length, options.batch - list.length);
		const remainingItems = cleanedPartialList.slice(0, remainingCount);
		list.push(...remainingItems);
		offset += options.batch;
	}

	if (list.length === options.batch)
		console.log(`Processing the first ${options.batch} items.`);
	else
		console.log(`Processing the final ${list.length} items (requested ${options.batch}).`);

	let index = 0;
	let continue_ = true;
	while (continue_) {
		const item = list[index];
		const itemNumber = `${index + 1} / ${list.length}`;
		const action = await showItem(item, itemNumber);
		[ continue_, index ] = await process({action, item, index, length: list.length, app, pocket});
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
		tags: Object.keys(item.tags || {}),
		date: item.date_added,
	};

	const display = {
		id: short.id,
		active: short.status === 'Normal',
		url: short.url,
		title: short.title,
		date: short.date.toISOString().substring(0, 7),
		tags: short.tags.join('  '),
		tagsArr: short.tags,
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
		pageSize: 9,
		choices: [
			{name: Action.CopyUrl, key: 'c'},
			{name: Action.Open, key: 'o'},
			{name: Action.OpenArchive, key: 'u'},
			{name: Action.KBArchive, key: 'k'},
			{name: Action.OpenKBArchive, key: 'b'},
			{name: Action.Archive, key: 'a'},
			new inquirer.Separator(),
			{name: Action.Skip, key: 's'},
			{name: Action.Quit, key: 'q'},
		],
	}]);
	return answers.choice;
}

async function process({action, item, index, length, app, pocket}) {
	const next = () => {
		++index;
		if (index >= length) {
			console.log('All done');
			return [ false, index ];
		}
		return [ true, index ];
	};

	const openUrl = () => open(item.url, app);

	const archive = async () => {
		return new Promise((resolve, reject) => {
			const callback = (err, res) => {
				if (err) reject(err);
				resolve(res);
			};
			pocket.archive({item_id: item.id}, callback);
		});
	};

	const kb = async () => {
		const answer = await inquirer.prompt([{
			type: 'input',
			name: 'tags',
			message: 'Provide KB tags:',
		}]);
		const s = `${answer.tags}\r\n\t${item.url}\r\n\r\n`;
		await fs.appendFile(KB_PATH, s, 'utf-8');
		console.log('The entry was added to the clipboard and to the "kb.txt" file.');
		await clipboardy.write(s);
	}

	switch (action) {
		case Action.Archive:
			await archive();
			return next();

		case Action.CopyUrl:
			await clipboardy.write(item.url);
			return [ true, index ];

		case Action.Open:
			openUrl();
			return [ true, index ];

		case Action.OpenArchive:
			openUrl();
			await archive();
			return next();

		case Action.KBArchive:
			await kb();
			await archive();
			return next();

		case Action.OpenKBArchive:
			openUrl();
			await kb();
			await archive();
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
	KBArchive: 'KB & Archive',
	OpenKBArchive: 'Open, KB & Archive',
	Archive: 'Archive',
	Skip: 'Skip',
	Quit: 'Quit',
};

exports.readPocket = readPocket;
