// --------------- dependencies ----------

const express = require('express');
const db = require('./modules/database');
const scrapper = require('./modules/scraper');
const app = express(); //.use(bodyParser.json());

const fs = require('fs');
const path = require('path');

// --------------- GET requests ----------

app.get('/', (query, response) => response.end('LW Line'));

app.get('/addNewItems', (query, respone) => {
  // Gets hit at periodic intervals to add new items
  respone.end('K');

  const sources = JSON.parse(
    fs.readFileSync(path.join(__dirname, './sources.json'))
  );

  for (const source of sources) {
    scrapper
      .getNewItems(source)
      .then(newItems => {
        if (newItems.length === 0) {
          console.log(`N0t adding anything for ${source.title}`);
        } else {
          db.addMultiple(newItems);
        }
      })
      .catch(cronError => {
        console.log(`${cronError} <== cronError \n`);
      });
  }
});

app.get('/deleteOldItems', (query, respone) => {
  // Gets hit at periodic intervals to delete old items
  respone.end('❌❎❌');
});

app.listen(5151, () => {
  console.log('Running @ port 5151');
});
