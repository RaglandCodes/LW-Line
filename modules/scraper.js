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
          images: false,
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
        //fs.writeFileSync(path.join(__dirname, "./try.json"), JSON.stringify(meta))
        if (err == null) {
          //console.log('Good metas');

          resolve({
            ...item,
            metaData: {
              ampURL: meta.ampURL,
              description: meta.description,
              image: meta.image
            }
          });
        } else {
          resolve({
            ...item
          });
          //console.log(`${err} 👈 error in meta. Not adding meta data`);
          // console.log(`${item.source} <== Bad meta source \n\n`);
        }
      }
    ); // end of fetch
  }); // end of return new promise
} // end of function getMeta

function getNewItems(source) {
  return new Promise((resolve, reject) => {
    Promise.all([
      parser.parseURL(source['rssLink']),
      db.getLastItem(source['title'])
    ])
      .then(([newData, lastItemDate]) => {
        if (lastItemDate === '') {
          newData = newData.items;
        } else {
          newData = newData.items.filter(
            item => new Date(item.date) > new Date(lastItemDate)
          );
        }

        let scrappedItems = newData.map(item => ({
          title: item.title,
          description: item.contentSnippet,
          topics: item.categories
            ? [...item.categories, ...source.topics]
            : [...source.topics],
          source: source.title,
          date: new Date(item.pubDate).toISOString(),
          link: item.link
        }));

        return scrappedItems;
      })
      .then(withoutMetaData => {
        withoutMetaData = withoutMetaData.map(item => getMeta(item));
        Promise.all(withoutMetaData).then(withMetaData => {
          resolve(withMetaData);
        });
      })
      .catch(ae => console.log(`${ae} <== ae\n\n`));
  });

  // return new Promise((resolve, reject) => {
  //   parser
  //     .parseURL(source['rssLink'])
  //     .then(rssData => {
  //       let scrappedItems = rssData.items.map(item => ({
  //         title: item.title,
  //         description: item.contentSnippet,
  //         topics: item.categories
  //           ? [...item.categories, ...source.topics]
  //           : [...source.topics],
  //         source: source.title,
  //         date: new Date(item.pubDate).toISOString(),
  //         link: item.link
  //       }));

  //       db.getLastItem(source.title).then(lastItemDate => {
  //         if (lastItemDate === '') {
  //           // Return all items
  //           console.log(`Returning all items for ${source.title}`);

  //           resolve(scrappedItems);
  //           return;

  //           return scrappedItems;
  //         } else {
  //           console.log('Returning some items');
  //           // Return only items published after last item

  //           let newItems = scrappedItems.filter(
  //             item => new Date(item.date) > new Date(lastItemDate)
  //             // newer date is bigger (I guess)
  //           );
  //           console.log(
  //             `Scraped ${newItems.length} new items for ${source.title}\n`
  //           );

  //           resolve(newItems);
  //           return;

  //           // return newItems;
  //         }
  //       });
  //     })
  //     .catch(rssParseError => {
  //       console.error(`${rssParseError} <== rssParseError \n`);
  //       resolve([]);
  //       return;
  //     });
  // });
} // end of function getNewItems

// --------------- exports ----------
module.exports = {
  getNewItems: getNewItems
};
