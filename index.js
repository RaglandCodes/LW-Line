// --------------- dependencies & initialisations ---------------

const express = require('express');
const db = require('./modules/database');
const scrapper = require('./modules/scraper');
const app = express(); //.use(bodyParser.json());
const sourcesModule = require('./modules/sources');

// --------------- middlewares ---------------

// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// --------------- GET requests ---------------

app.get('/', (request, response) => {
  response.end('LW Line');
});

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

app.get('/previewFeed', sourcesModule.routePreviewFeed);

app.get('/getItems', (request, response) => {
  let subscriptions = JSON.parse(request.query.subscriptions);
  let after = [];
  console.log(`${request.query.after} <== req.query.after\n\n`);

  if (request.query.after !== undefined) {
    jsonAfter = JSON.parse(request.query.after);
    after = [jsonAfter.ts, jsonAfter.ref];
  }
  db.getFeedItems(subscriptions, { after: after })
    .then(responseData => {
      let responseDataWithoutRepetition = {
        ...responseData,
        data: scrapper.removeRepeatingItems(responseData.data)
      };

      response.send({ status: 'OK', data: responseDataWithoutRepetition });
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
