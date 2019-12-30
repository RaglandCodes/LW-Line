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
        console.count('Finished scrapping');
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

app.get('/getSources', (request, response) => {
  let searchTerm = request.query.searchTerm;
  const sources = JSON.parse(
    fs.readFileSync(path.join(__dirname, './sources.json'))
  );
  let results = sources.filter(
    source => source.title.indexOf(searchTerm) !== -1
  );

  response.send(results);
});

app.get('/singleItem', (request, response) => {});

app.get('/previewSource', (request, respone) => {});

app.get('/getItems', (request, response) => {
  // Gets hit from the front-end

  let subscriptions = request.query.subscriptions.split('AaNnDd');
  let after = { ref: request.query.afterRef, ts: request.query.afterTs };
  console.log(request.query.afterRef);
  console.log(request.query.afterTs);

  console.log(`${after} <== after\n\n`);

  //db.getItems(subscriptions);
  db.getItems(subscriptions, after).then(responseData => {
    response.send(responseData);
  });
});

app.listen(5151, () => {
  console.log('Running @ port 5151');
});

// This is to be able to remix on Glitch
// https://glitch.com/~lw-line
/*

 const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
 });

//*/
