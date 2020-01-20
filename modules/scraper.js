// --------------- dependencies ----------

const Parser = require('rss-parser');
let parser = new Parser();
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
          console.log(`${item.source} <== Bad meta causing ${err} \n\n`);
        }
      }
    ); // end of fetch
  }); // end of return new promise
} // end of function getMeta

async function getNewItems(source) {
  let [newData, lastItemDate] = await Promise.all([
    parser.parseURL(source['rssLink']),
    db.getLastItem(source['title'])
  ]).catch(getNewItemsError => {
    console.log(`${getNewItemsError} <= getNewItemsError ${source}`);
    return [];
  });

  if (lastItemDate === '') {
    newData = newData.items;
  } else {
    newData = newData.items.filter(item => {
      return new Date(item.pubDate) > new Date(lastItemDate);
    });
  }

  let scrappedItems = newData.map(item => ({
    title: item.title,
    description: item.contentSnippet,
    topics: item.categories ? [...item.categories, ...source.topics] : [...source.topics],
    source: source.title,
    date: new Date(item.pubDate).toISOString(),
    link: item.link
  }));

  let scrappedItemsWithMetaData = await Promise.all(
    scrappedItems.map(item => getMeta(item))
  );

  return scrappedItemsWithMetaData;
} // end of function getNewItems

// --------------- exports ----------
module.exports = {
  getNewItems: getNewItems
};
