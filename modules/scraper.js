// --------------- dependencies ----------

const Parser = require('rss-parser');
let parser = new Parser();
const db = require('./database');
const fs = require('fs');
const path = require('path');

// --------------- functions ----------

async function getNewItems() {
  const sources = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../sources.json'))
  );

  for await (source of sources) {
    parser.parseURL(source['rssLink']).then(d => {
      console.log(`${JSON.stringify(d['items'][0]['title'])} <== d \n`);
    });

    db.getLastItem(source['title']).then(lastItem => {
      console.log(`${lastItem} <== l\n\n`);
      if (lastItem === '') {
        // Add all new items
      } else {
      }
    });
  }
}

// --------------- exports ----------
module.exports = {
  getNewItems: getNewItems
};
