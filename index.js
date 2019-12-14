// --------------- dependencies ----------

const express = require('express');
const db = require('./modules/database');
const scrapper = require('./modules/scraper');
const app = express(); //.use(bodyParser.json());

// --------------- functions ----------
let muliplePosts = [
  {
    title: 'ss2 title1',
    description: 'this is the first description',
    date: '2008-11-11',
    source: 'The Guardian'
  },
  {
    title: 'spread check22 title 2 India',
    description: 'this is the first description',
    date: '2008-11-10',
    source: 'The Hindu'
  },
  {
    title: 'spreack chec2222 title33',
    description: 'this is the first description',
    date: '2015-01-05',
    source: 'The Guardian'
  }
];

//db.addMultiple(muliplePosts);

// db.getLastItem('The Guardian').then(a => {
//   console.log(`${JSON.stringify(a)} <== a \n`);
// });

function updatePosts() {}

//scrapper.getNewItems();
//updatePosts();
// --------------- GET requests ----------

app.get('/', (query, response) => response.end('G0T'));

app.get('/cron', (query, respone) => {});

app.listen(5151, () => {
  console.log('Running @ port 5151');
});
