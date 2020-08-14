// --------------- dependencies ----------

const Parser = require('rss-parser');
//let parser = new Parser();
const db = require('./database');
const fs = require('fs');
const path = require('path');
const metafetch = require('metafetch');

// --------------- functions ----------

function getMeta(item) {
  return new Promise((resolve, reject) => {
    metafetch.fetch(
      item.link,
      {
        flags: {
          language: false,
          title: false,
          links: false,
          charset: false,
          headers: false,
          siteName: false,
          type: false,
          meta: false,
          uri: false
        }
      },
      (err, meta) => {
        if (err == null) {
          resolve({
            ...item,
            ampURL: meta.ampURL,
            metaDescription: meta.description,
            image: meta.image
          });
        } else {
          resolve({
            ...item
          });
          console.warn(`${item.feed} <== Bad meta causing ${err} \n\n`);
        }
      }
    ); // end of fetch
  }); // end of return new promise
} // end of function getMeta

async function routeAddFeedFromLink(request, response) {
  let feedLink = request.query.feedLink;
  let userId = request.query.userId;

  if (!userId || userId === 'admin') {
    response.send({
      status: 'ERROR',
      body: 'Bad auth'
    });
    return;
  }

  let existingFeed = await db.searchFeedsByFeedLink(feedLink).catch(e => {
    response.send({
      status: 'ERROR',
      body: 'DB Error'
    });

    return;
  });

  if (existingFeed.data.length) {
    // TODO check if created by admin
    response.send({
      status: 'ERROR',
      body: 'Already Exists'
    });
    return;
  }

  let parser = new Parser();
  let feedData = await parser.parseURL(feedLink).catch(feedDataError => {
    console.error(feedDataError);
    response.send({
      status: 'ERROR',
      body: `Couldn't scrape that feed`
    });
    return;
  });

  let newFeed = {
    name: feedData.title,
    feedLink: feedLink,
    siteLink: feedData.feedUrl,
    about: feedData.link,
    createdBy: [userId],
    topics: [],
    image: feedData.image
  };

  let feedItems = feedData.items.map(item => ({
    title: item.title,
    contentSnippet: item.contentSnippet,
    topics: item.categories ? [...item.categories] : [],
    feed: newFeed.name,
    date: new Date(item.pubDate).toISOString(),
    link: item.link
  }));

  if (feedItems.length === 0) {
    response.send({
      status: 'ERROR',
      body: `Couldn't scrape that feed`
    });
    return;
  }

  let feedItemsWithMetaData = await Promise.all(feedItems.map(item => getMeta(item)));

  // db.addMultiple(feedItemsWithMetaData);

  response.send(newFeed);
}

async function getDataFromLink(feedLink) {
  console.log('noooo');
  // let parser = new Parser();
  // let feedData;
  // console.log(`${feedLink} <== feedLink`);
  // feedData = await parser.parseURL(feedLink).catch(feedDataError => {
  //   console.log(`${feedDataError} <== feedDataError`);
  //   return [];
  // });
  // return feedData;
}

async function routeUpdateAllFeeds(request, response) {
  response.end('OK');

  let feedsGenerator = db.yieldAllFeeds();

  for await (let feeds of feedsGenerator) {
    if (feeds !== undefined) {
      feeds = feeds.map(feed => feed.data);
      //console.log(`${JSON.stringify(feeds, null, 2)} <== feeds \n`);

      for await (const feed of feeds) {
        getNewItems(feed)
          .then(newItems => {
            console.count('Finished scrapping');
            if (newItems.length === 0) {
              console.log(`N0t adding anything for ${feed.name}`);
            } else {
              db.addMultiple(newItems);
            }
          })
          .catch(cronError => {
            console.log(`${cronError} <== cronError \n`);
          });
      }
    } else {
      console.log('mistake happened');
    }
  }
  console.log('over');
}

async function getNewItems(feed) {
  let parser = new Parser();
  let [newData, lastItemDate] = await Promise.all([
    parser.parseURL(feed.feedLink),
    db.getLastItemDate(feed.name)
  ]).catch(getNewItemsError => {
    console.error(getNewItemsError);
    console.warn(`Error in ${feed.name}`);
    return [];
  });

  if (!newData) {
    console.log('New data was falsy for' + feed.name);
    console.log(`${newData} <== falsy newData`);

    return [];
  }
  newData = newData.items.filter(item => {
    return new Date(item.pubDate) > new Date(lastItemDate);
  });

  console.log(`${newData.length} <== newData.length ==> ${feed.name}`);

  let scrappedItems = newData.map(item => ({
    title: item.title,
    contentSnippet: item.contentSnippet,
    topics: item.categories ? [...item.categories, ...feed.topics] : [...feed.topics],
    source: feed.source,
    feed: feed.name,
    date: new Date(item.pubDate).toISOString(),
    link: item.link
  }));

  let scrappedItemsWithMetaData = await Promise.all(scrappedItems.map(item => getMeta(item)));

  //   return [];

  return scrappedItemsWithMetaData;
} // end of function getNewItems

module.exports = {
  getNewItems: getNewItems,
  getDataFromLink: getDataFromLink,
  routeUpdateAllFeeds: routeUpdateAllFeeds,
  routeAddFeedFromLink: routeAddFeedFromLink
};
