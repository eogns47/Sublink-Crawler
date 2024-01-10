# 🔎Dynamic link crawler

🚀You Can find All Urls from base url!🚀 <br>
Dynamic web crawler that uses dynamic browser (Puppeteer) which fetches all links on a page and its children. <br>

## 💡How to use:

1. Clone the repo and run `npm install puppeteer yargs`
2. Create a file that lists scrapped targets on {root}/inputs/targets.txt
3. Create a file that lists unscrapped targets on {root}/inputs/blacklist.txt
4. Run `node index.js -t targets.txt -r results.txt -b blacklist.txt -d 1`

5. Install Unit test tool `npm install --save-dev jest`
6. Create a file that lists scrapped targets on {root}/inputs/targets.txt
7. Create a file that lists unscrapped targets on {root}/inputs/blacklist.txt
8. Run `node index.js -t targets.txt -r results.txt -b blacklist.txt -d 1`

Options: <br>
`--version` Show version number [boolean] <br>
`-t` Input file path [required] <br>
`-u` Targets array list <br>
`-r` Output file path <br>
`-d` Crawling depth <br>
`-b` Blacklist file path to prevent an url for being crawled (hard match)<br>
`--full` Use full url for crawling instead of its base<br>
`-v` Verbosity level [boolean]<br>
`--base` Must include the base url to except external links when crawling [boolean]<br>
<br>
`-h, --help  Show help` [boolean]<br>

## 🛠️Tech Stack:

![link crawler Architecture drawio (1)](https://github.com/eogns47/Sublink-Crawler/assets/102205852/3df0b92d-749b-4935-adb9-fa01326d1615)

## 🌲File Structure

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
