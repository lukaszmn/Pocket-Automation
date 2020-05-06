function printStats(pocket) {

	pocket.get({
		count: 100000,
		state: 'all',
		detailType: 'complete',
	}, function(err, resp) {
		if (err) {
			console.error(err);
		} else {
			printStatsData(resp);
		}
	});

}


function printStatsData(resp) {
	const list = convertToList(resp);

	console.log('N = Normal, A = Archived, D = Deleted');
	printDateStats(list);
	printBasicStats(list);
}


function convertToList(resp) {
	const list = [];

	for (const id in resp.list) {
		const item = resp.list[id];
		item.date_added = new Date(item.time_added * 1000);
		item.date_updated = new Date(item.time_updated * 1000);
		item.date_read = item.time_read === '0' ? null : new Date(item.time_read * 1000);
		list.push(item);
	}

	// sort from oldest to newest
	list.sort((a, b) => a.time_added - b.time_added);

	return list;
}


function printBasicStats(list) {
	const count = (fn) => list.filter(fn).length;
	const len = list.length;

	console.log(`Total: ${len}`);

	const normal = count(item => item.status == 0);
	const archived = count(item => item.status == 1);
	const deleted = count(item => item.status == 2);
	if (normal !== len - archived - deleted)
		console.error('Invalid count');
	console.log(`N: ${len - archived - deleted}, A: ${archived}, D: ${deleted}`);

	const n_fav = count(item => item.status === '0' && item.favorite === '1');
	const a_fav = count(item => item.status === '1' && item.favorite === '1');
	const d_fav = count(item => item.status === '2' && item.favorite === '1');
	console.log(`Favorited: N ${n_fav} / A ${a_fav} / D ${d_fav}, Not: N ${len - n_fav}, A ${len - a_fav}, D ${len - d_fav}`);

	const n_tags = count(item => item.status === '0' && item.tags);
	const a_tags = count(item => item.status === '1' && item.tags);
	const d_tags = count(item => item.status === '2' && item.tags);
	console.log(`With tags: N ${n_tags} / A ${a_tags} / D ${d_tags}, Without: N ${len - n_tags}, A ${len - a_tags}, D ${len - d_tags}`);
}


function printDateStats(list) {
	const printMonthStats = (year, month) => {
		const firstDay = new Date(year, month - 1, 1);
		const lastDay = new Date(year, month, 1);
		const sublistAdded = list.filter(item => firstDay <= item.date_updated && item.date_updated < lastDay);
		const sublistRead = list.filter(item => firstDay <= item.date_read && item.date_read < lastDay);

		const countAdded = (fn) => sublistAdded.filter(fn).length;

		const archived = countAdded(item => item.status == 1);
		const deleted = countAdded(item => item.status == 2);
		const normal = sublistAdded.length - archived - deleted;

		const read = sublistRead.length;

		const format = n => ('  ' + n).slice(-3);
		console.log(
			`${year}-${month < 10 ? '0' + month : month}: ` +
			`N ${format(normal)}, A ${format(archived)}, D ${format(deleted)}, READ ${format(read)}`
		);
	}

	const dateFrom = list[0].date_added; 
	const dateTo = list[list.length - 1].date_updated;
	console.log('Date range: ' +
		dateFrom.toISOString().substring(0, 10) + ' - ' +
		dateTo.toISOString().substring(0, 10)
	);

	const yearFrom = dateFrom.getFullYear();
	const monthFrom = dateFrom.getMonth() + 1;
	const yearTo = dateTo.getFullYear();
	const monthTo = dateTo.getMonth() + 1;

	let year = yearFrom, month = monthFrom;
	while (year < yearTo || month <= monthTo) {
		printMonthStats(year, month);
		if (++month > 12) {
			month = 1;
			++year;
		}
	}
    
}


exports.printStats = printStats;
