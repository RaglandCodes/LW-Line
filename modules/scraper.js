// --------------- dependencies ----------

const Parser = require('rss-parser');
let parser = new Parser();
const db = require('./database');
const fs = require('fs');
const path = require('path');

// --------------- functions ----------

function getNewItems(source) {
  return new Promise((resolve, reject) => {
    parser
      .parseURL(source['rssLink'])
      .then(rssData => {
        let scrappedItems = rssData.items.map(item => ({
          title: item.title,
          description: item.contentSnippet,
          topics: item.categories
            ? [...item.categories, ...source.topics]
            : [...source.topics],
          source: source.title,
          date: new Date(item.pubDate).toISOString(),
          link: item.link
        }));
        db.getLastItem(source.title).then(lastItemDate => {
          if (lastItemDate === '') {
            // Return all items
            console.log(`Returning all items for ${source.title}`);

            resolve(scrappedItems);
            return;
          } else {
            console.log('Returning some items');
            // Return only items published after last item

            let newItems = scrappedItems.filter(
              item => new Date(item.date) > new Date(lastItemDate)
              // newer date is bigger
            );

            console.log(
              `Scraped ${newItems.length} new items for ${source.title}\n`
            );

            resolve(newItems);
            return;
          }
        });
      })
      .catch(rssParseError => {
        console.error(`${rssParseError} <== rssParseError \n`);
      });
  });
} // end of function getNewItems

// --------------- exports ----------
module.exports = {
  getNewItems: getNewItems
};
