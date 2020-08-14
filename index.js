// --------------- dependencies & initialisations ---------------

const express = require('express');
const db = require('./modules/database');
const scrapper = require('./modules/scraper');
const app = express(); //.use(bodyParser.json());
const sourcesModule = require('./modules/sources');
const fs = require('fs');
const path = require('path');
const nanoid = require('nanoid');

// --------------- globals ---------------

// --------------- middlewares ---------------

// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// --------------- functions ---------------

// function routeAddNewItems(request, respone) {
//   respone.end('OK');
//   console.log(`${request.path} <== request.path`);
//   const sources = JSON.parse(fs.readFileSync(path.join(__dirname, './sources.json')));

//   for (const source of sources) {
//     scrapper
//       .getNewItems(source)
//       .then(newItems => {
//         console.count('Finished scrapping');
//         if (newItems.length === 0) {
//           console.log(`N0t adding anything for ${source.feed}`);
//         } else {
//           db.addMultiple(newItems);
//         }
//       })
//       .catch(cronError => {
//         console.log(`${cronError} <== cronError \n`);
//       });
//   }
// }

// --------------- GET requests ---------------

app.get('/', (request, response) => {
  response.end('LW Line');
});

// app.get('/addNewItems', routeAddNewItems);
app.get('/updateAllFeeds', scrapper.routeUpdateAllFeeds);
app.get('/deleteOldItems', (query, respone) => {
  // Gets hit at periodic intervals to delete old items
  respone.end('(•‿•)');
  db.deleteOldItems();
});

// Returns a Set of all topics
app.get('/feedTopics', sourcesModule.routeFeedTopics);

app.get('/getFeeds', sourcesModule.routeGetFeeds);

app.get('/feedForStories', sourcesModule.routeFeedForStories);

app.get('/singleItem', (request, response) => {
  let id = request.query.id;

  db.getItemByRef(id)
    .then(ret => {
      response.send({ status: 'OK', data: ret });
    })
    .catch(getSingleItemError => {
      console.error(getSingleItemError);
      console.info(`^getSingleItemError\n\n`);
      response.send({ status: 'ERROR', data: `DB Error 826` });
    });
});

// app.get('/previewSource', (request, respone) => {
//   let searchSource = request.query.source;
//   let after = { ref: request.query.afterRef, ts: request.query.afterTs };

//   const sources = JSON.parse(fs.readFileSync(path.join(__dirname, './sources.json')));

//   let selectedSource = sources.filter(source => source.feed === searchSource)[0];

//   db.getItems([searchSource], after)
//     .then(responseData => {
//       selectedSource = { ...selectedSource, items: responseData };

//       respone.send(selectedSource);
//     })
//     .catch(previewSourceDBError => {
//       console.log(`${previewSourceDBError} <= previewSourceDBError`);
//       respone.end('ERROR');
//     });
// });

app.get('/previewFeed', sourcesModule.routePreviewFeed);

app.get('/getItems', (request, response) => {
  // Gets hit from the front-end

  let subscriptions = JSON.parse(request.query.subscriptions);
  let after = [];
  console.log(`${request.query.after} <== req.query.after\n\n`);

  if (request.query.after !== undefined) {
    jsonAfter = JSON.parse(request.query.after);
    after = [jsonAfter.ts, jsonAfter.ref];
  }
  db.getFeedItems(subscriptions, { after: after })
    .then(responseData => {
      response.send({ status: 'OK', data: responseData });
    })
    .catch(error => {
      console.log(`${error} <== error\n\n`);

      response.send({ status: 'ERROR', data: '839' });
    });
});

app.get('/addFeedFromLink', scrapper.routeAddFeedFromLink);

app.listen(process.env.PORT, () => {
  // TODO make this same as the Glitch one and the remove

  console.log(`Running @ port ${process.env.PORT}`);
});

module.exports = app; // for testing

// This is to be able to host on Glitch
// https://glitch.com/~lw-line-backend
/*

 const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
 });

//*/
