// --------------- dependencies & initialisations ----------

const express = require('express');
const db = require('./modules/database');
const scrapper = require('./modules/scraper');
const app = express(); //.use(bodyParser.json());

const fs = require('fs');
const path = require('path');

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

// const sources = JSON.parse(
//   fs.readFileSync(path.join(__dirname, './sources.json'))
// );

// console.log(`${sources.length} <== sources.length\n\n`);
// --------------- GET requests ----------

app.get('/', (request, response) => {
  response.end('LW Line');
});

app.get('/addNewItems', (query, respone) => {
  // Gets hit at periodic intervals to add new items
  respone.end('K');

  const sources = JSON.parse(
    fs.readFileSync(path.join(__dirname, './sources.json'))
  );

  console.log(`${sources.length} <== sources.length\n\n`);

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
  respone.end('|DD|');
  db.deleteOldItems();
});

app.get('/getItems', (request, response) => {
  // Gets hit from the front-end

  let subscriptions = request.query.subscriptions.split('AaNnDd');
  console.log(`${subscriptions} <== subscriptions\n\n`);
  //db.getItems(subscriptions);
  db.getItems(subscriptions).then(responseData => {
    response.send(responseData);
  });
});

app.listen(5151, () => {
  console.log('Running @ port 5151');
});
