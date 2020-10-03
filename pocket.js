const ora = require('ora');

async function loadPocket(pocket, count, sortNewestFirst) {
	return new Promise((resolve, reject) => {

		const spinner = ora('Loading').start();

		pocket.get({
			count,
			state: 'all',
			detailType: 'complete',
		}, function(err, resp) {
			if (err) {
				spinner.fail();
				reject(err);
			} else {
				spinner.succeed();
				const list = convertToList(resp, sortNewestFirst);
				resolve(list);
			}
		});

	});
}

function convertToList(resp, sortNewestFirst) {
	const list = [];

	for (const id in resp.list) {
		const item = resp.list[id];
		item.date_added = new Date(item.time_added * 1000);
		item.date_updated = new Date(item.time_updated * 1000);
		item.date_read = item.time_read === '0' ? null : new Date(item.time_read * 1000);
		list.push(item);
	}

	if (sortNewestFirst)
		list.sort((a, b) => b.time_added - a.time_added);
	else
		list.sort((a, b) => a.time_added - b.time_added);

	return list;
}

exports.loadPocket = loadPocket;
