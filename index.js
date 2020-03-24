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
  respone.end('¯_(ツ)_/¯');

  const sources = JSON.parse(fs.readFileSync(path.join(__dirname, './sources.json')));

  console.log(`${sources.length} <== sources.length\n\n`);

  for (const source of sources) {
    scrapper
      .getNewItems(source)
      .then(newItems => {
        console.count('Finished scrapping');
        if (newItems.length === 0) {
          console.log(`N0t adding anything for ${source.feed}`);
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
  respone.end('(•‿•)');
  db.deleteOldItems();
});

app.get('/sourceTopics', (request, response) => {
  const sources = JSON.parse(fs.readFileSync(path.join(__dirname, './sources.json')));
  let topics = [
    ...new Set(sources.map(source => source.topics).reduce((a, c) => [...a, ...c]))
  ];

  //topics is array of the topics in the sources.json file

  response.send(topics);
});
app.get('/getSources', (request, response) => {
  let searchTerm = request.query.searchTerm;
  let searchTopics = request.query.searchTopics;
  const sources = JSON.parse(fs.readFileSync(path.join(__dirname, './sources.json')));

  if (searchTerm) {
    const sources = JSON.parse(fs.readFileSync(path.join(__dirname, './sources.json')));

    let results = sources.filter(
      source => source.title.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
    );
    console.log(`${JSON.stringify(results, null, 2)} <= results`);

    response.send(results);
  } else if (searchTopics) {
    searchTopics = searchTopics.split('AaNnDd');
    let searchResult = sources.filter(source => {
      return source.topics.filter(topic => searchTopics.includes(topic)).length;
    });

    response.send(searchResult);
  } else {
    response.end('ERROR');
  }
});

app.get('/singleItem', (request, response) => {
  let id = request.query.id;

  db.getItemByRef(id)
    .then(ret => {
      response.send(ret);
    })
    .catch(getSingleItemError => {
      response.send('ERROR');
      console.log(`${getSingleItemError} <= getSingleItemError`);
    });
});

app.get('/previewSource', (request, respone) => {
  let searchSource = request.query.source;
  let after = { ref: request.query.afterRef, ts: request.query.afterTs };

  const sources = JSON.parse(fs.readFileSync(path.join(__dirname, './sources.json')));

  let selectedSource = sources.filter(source => source.feed === searchSource)[0];

  db.getItems([searchSource], after)
    .then(responseData => {
      selectedSource = { ...selectedSource, items: responseData };

      respone.send(selectedSource);
    })
    .catch(previewSourceDBError => {
      console.log(`${previewSourceDBError} <= previewSourceDBError`);
      respone.end('ERROR');
    });
});

app.get('/getItems', (request, response) => {
  // Gets hit from the front-end

  let subscriptions = request.query.subscriptions.split('AaNnDd');
  let after = { ref: request.query.afterRef, ts: request.query.afterTs };
  //console.log(`${JSON.stringify(after, null, 2)} <= after`);

  db.getItems(subscriptions, after)
    .then(responseData => {
      response.send(responseData);
    })
    .catch(error => {
      response.end('ERROR');
    });
});

app.listen(5151, () => {
  console.log('Running @ port 5151');
});

// This is to be able to remix on Glitch
// https://glitch.com/~lw-line-backend
/*

 const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
 });

//*/
