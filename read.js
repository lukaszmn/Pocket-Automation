const loadPocket = require('./pocket').loadPocket;

async function readPocket(pocket) {
	const list = await loadPocket(pocket, 10, true);

	const list2 = list.map(convertItem).filter(item => item.active);

	for (const item of list2) {
		showItem(item);
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
		description: short.title + ' | ' + short.url,
		date: short.date.toISOString().substring(0, 7),
		tags: short.tags.join(' | '),
	};

	// console.log(display);
	return display;
}

function showItem(item) {
	console.log(`\n${item.date}\n${item.description}\n${item.tags}`);
}

exports.readPocket = readPocket;
