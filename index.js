const GetPocket = require('node-getpocket');

const printStats = require('./stats').printStats;

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

var pocket = new GetPocket(config);


console.log();

printStats(pocket);

console.log();

pocket.get({
	count: 1,
	state: 'all',
	detailType: 'complete',
	sort: 'newest',
}, function(err, resp) {
	if (err) {
		console.error(err);
	} else {
		// console.log(resp);
		const list = [];
		for (const id in resp.list) {
			const item = resp.list[id];
			list.push(item);
		}

		list
			// .filter(item => item.time_read > 0 && item.tags)
			.forEach(item => console.log(item));

		console.log(list[0].tags);
		const {
			item_id,
			time_added,
			time_read,
			time_updated,
			sort_id,
			resolved_title,
			resolved_url,
			given_title,
			is_article,
			status, // 0 = normal, 1 = archived, 2 = deleted
			tags,
		} = resp;
	}
});
