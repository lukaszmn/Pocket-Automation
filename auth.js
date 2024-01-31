const inquirer = require('inquirer');
const GetPocket = require('node-getpocket');
const express = require('express');
const fs = require('fs');

async function auth() {
	const consumerKey = await askForKey();
	if (!consumerKey) {
		console.log('No key provided, terminating.');
		return;
	}

	try {
		const config = await authorize(consumerKey);
		const json = JSON.stringify(config, null, 2);
		fs.writeFileSync('pocket.json', json);
		console.log('Saved authorization keys to pocket.json. You can now run the application.');
	} catch {
		console.log('Terminating.');
	}

	process.exit();
}

async function askForKey() {
	console.log(`Open page:
	https://getpocket.com/developer/apps/new
and create a new application.
Select required permissions ("Retrieve" is required, "Modify" is required only if you want to archive items).
Once you've completed registration, copy your consumer key.`);

	const res = await inquirer.prompt([{
		type: 'input',
		name: 'key',
		message: 'Enter it here:',
	}]);
	return res.key;
}

function authorize(consumerKey) {
	const port = 8080;

	return new Promise((resolve, reject) => {
		const cfg = {
			consumer_key: consumerKey,
			request_token: '',
			access_token: '',
			user_name: '',
			redirect_uri: `http://localhost:${port}/redirect`
		};

		const pocket = new GetPocket(cfg);
		const app = express();

		app.get('/', function(req, res) {
			const params = {
				redirect_uri: cfg.redirect_uri
			};
			app.locals.res = res;
			console.log('Asking GetPocket for request token ...');
			pocket.getRequestToken(params, function(err, resp, body) {
				if (err) {
					const msg = 'Failed to get request token: ' + err;
					console.log(msg);
					app.locals.res.send('<p>' + msg + '</p>');
					reject();
				} else if (resp.statusCode !== 200) {
					const msg = 'Oops, Pocket said ' + resp.headers.status + ', ' + resp.headers['x-error'];
					console.log(msg);
					app.locals.res.send('<p>' + msg + '</p>');
					reject();
				} else {
					const json = JSON.parse(body);
					cfg.request_token = json.code;
					console.log('Received request token: ' + cfg.request_token);

					const url = pocket.getAuthorizeURL(cfg);
					console.log('Redirecting to ' + url + ' for authentication');
					app.locals.res.redirect(url);
				}
			});
		});

		app.get('/redirect', function(req, res) {
			console.log('Asking GetPocket for access token ...');

			app.locals.res = res;
			const params = {
				request_token: cfg.request_token
			};

			pocket.getAccessToken(params, function access_token_handler(err, resp, body) {
				if (err) {
					const msg = 'Failed to get access token: ' + err;
					console.log(msg);
					app.locals.res.send('<p>' + msg + '</p>');
					reject();
				} else if (resp.statusCode !== 200) {
					const msg = 'Oops, Pocket said ' + resp.headers.status + ', ' + resp.headers['x-error'];
					console.log(msg);
					app.locals.res.send('<p>' + msg + '</p>');
					reject();
				} else {
					const json = JSON.parse(body);
					cfg.access_token = json.access_token;
					cfg.user_name = json.username;
					console.log('Received access token: ' + cfg.access_token + ' for user ' + cfg.user_name);
					const config = {
						consumer_key: cfg.consumer_key,
						access_token: cfg.access_token
					};
					app.locals.res.send('<p>Pocket says "yes"</p>');
					resolve(config);
				}
			});
		});

		const server = app.listen(port, 'localhost', function() {
			console.log('Open page: http://localhost:%s', server.address().port);
		});
	});
}

exports.auth = auth;
