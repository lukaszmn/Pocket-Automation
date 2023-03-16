# Pocket Automation

* View your Pocket statistics
* View your recent articles, open, archive or collect URLs

# Installation

1. Install NodeJS: https://nodejs.org/
1. Run: `npm install`.
1. Go to [Pocket Developer](https://getpocket.com/developer/apps/new) and create a new application. Select required permissions ("Retrieve" is required, "Modify" is required only if you want to archive items).
1. Run `node .\node_modules\node-getpocket\authorise.js --consumerkey "your key"`
1. Open the [address visible](http://127.0.0.1:8080) in the command line. Authorise with Pocket and copy the access token.
1. Create `pocket.json` file:
```json
{
	"consumer_key": "your API key",
	"access_token": "your access token"
}
```

# Running

## Statistics

```
node index.js --stats
- or -
npm run stats
```

You will see statistics of your Pocket data:

```
N = Normal, A = Archived, D = Deleted
Date range: 2013-12-05 - 2020-10-11
2013-12: N   0, A   3, D   0, READ   3
2014-01: N   0, A  21, D   0, READ  21
...
2020-08: N  92, A  14, D   0, READ  16
Total: 5786
N: 2338, A: 3448, D: 0
Favorited: N 10 / A 66 / D 0, Not: N 5776, A 5720, D 5786
With tags: N 665 / A 41 / D 0, Without: N 5121, A 5745, D 5786
```

First, you will see date range of your saved articles.

Next, counts:
* `N 92` means 92 articles were updated (probably added) in September 2020
* `A 14` means 14 articles were archived in that month
* `D 0` means 0 articles were deleted in that month
* `READ 16` means 16 articles were read in that month

At the end there is summary:

* `Total: 5786` - the total amount of items in your Pocket
* `N: 2338, A: 3448, D: 0` - in total, there are 2338 unread and 3448 archived items
* `Favorited / Not` and `With tags / Without` are similar stats for: items that were or were not favorited, and for items with tags or without any tags

## Reading

```
node index.js --read
- or -
npm run stats
```

Arguments:
* `--app` - path to the browser's executable if you don't want to use the default one
* `--arg` - optional arguments for the browser
* `--batch=20` - batch size, the amount of items retrieved (default 10)
* `--skip-tag="tag 1" --skip-tag="tag 2"` - items with these tags will not be displayed in this application

Application in this mode reads a batch of the latest items from your Pocket, and displays them one by one, providing information about: date, consecutive number, page name, URL, and tags.

For each item you have the following options (keyboard shortcut in the brackets):
* Copy URL (c) - copies the URL to the clipboard
* Open (o) - opens the link in a web browser (the default one or the one selected in the command line arguments)
* Open & Archive (u) - first opens the link in a web browser, then archives the Pocket item
* KB & Archive (k) - asks for a description and adds it along with the link to the `kb.txt` file, then archives the Pocket item
* Open, KB & Archive (b) - opens the link in a web browser, adds it to KB and archives the Pocket item
* Archive (a) - just archives the Pocket item
* Skip (s) - proceeds to the next Pocket item
* Quit (q) - exits the program
