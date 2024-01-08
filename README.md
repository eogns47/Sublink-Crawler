# link-crawler

Dynamic web crawler that uses dynamic browser (Puppeteer) which fetches all links on a page and its children.

## How to use:

1. Clone the repo and run `npm install puppeteer yargs`
2. Create a file that lists scrapped targets on {root}/inputs/targets.txt
3. Create a file that lists unscrapped targets on {root}/inputs/blacklist.txt
4. Run `node index.js -t targets.txt -r results.txt -b blacklist.txt -d 1`


```
link-crawler
├─ Logger
│  └─ logger.js
├─ README.md
├─ babel.config.js
├─ inputs
│  └─ .gitkeep
├─ jest.config.js
├─ logs
│  └─ .gitkeep
├─ node_modules
├─ package-lock.json
├─ package.json
├─ results
│  └─ .gitkeep
├─ src
│  ├─ Config
│  │  └─ Extensions.js
│  ├─ IOView.js
│  ├─ LinkCrawler.js
│  ├─ LinkPreprocessor.js
│  ├─ index.js
│  └─ messageHandler.js
└─ yarn.lock

```