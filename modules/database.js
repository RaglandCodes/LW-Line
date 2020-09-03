// --------------- dependencies & initialisations ----------

require('dotenv').config();

let faunadb = require('faunadb');
let q = faunadb.query;
let client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET
});

// --------------- functions ----------

function addNewFeed(newFeed) {
  newFeed = {
    ...newFeed,
    source: 'UN_KNOWN'
  };

  console.log(`${JSON.stringify(newFeed, null, 2)} <== newFeed in DB\n`);

  client
    .query(q.Create(q.Collection('feeds'), { data: newFeed }))
    .then(ret => {
      //console.log(`${JSON.stringify(ret, null, 2)} <== ret \n`);
    })
    .catch(e => {
      console.error(e);
    });
}
function addMultiple(newPosts) {
  // Convert date to Fauna date format

  // Put the right date format in the posts
  newPosts = newPosts.map(post => {
    return new Promise((resolve, reject) => {
      client
        .query(q.Time(post.date))
        .then(ret => {
          resolve({
            ...post,
            date: ret.value
          });
        })
        .catch(toDateError => {
          resolve('ERROR');
          console.log(`${toDateError} <== toDateError for ${newPosts[0]['feed']}\n\n`);
        });
    });
  });

  Promise.all(newPosts)
    .then(postsWithError => {
      console.log(`${postsWithError.length} <== postsWithError.length`);
      return postsWithError.filter(p => p !== 'ERROR');
    })
    .then(postsWithoutError => {
      console.log(`${postsWithoutError.length} <== postsWithoutError.length`);
      client.query(
        q.Map(
          postsWithoutError,
          q.Lambda(
            'post',
            q.Create(q.Collection('articles'), {
              data: q.Var('post')
            })
          )
        )
      );
    })
    .catch(addMultipleQueryError =>
      console.error(`${JSON.stringify(addMultipleQueryError)} <== addMultipleQueryError \n`)
    );
} // end of addMultiple

async function getItemByRef(id) {
  return client
    .query(q.Get(q.Ref(q.Collection('articles'), id)))
    .then(ret => ret.data)
    .catch(getItemByRefError => {
      throw new Error(`Couldn't get item by ref due to ${getItemByRefError}`);
    });
}

async function getTopicsFromFeeds() {
  return client
    .query(
      q.Map(
        q.Paginate(q.Match(q.Index('getFeedsIndex'))),
        q.Lambda('X', q.Select(['data', 'topics'], q.Get(q.Var('X'))))
      )
    )
    .then(ret => {
      return ret;
    })
    .catch(getFeedTopicsError => {
      throw new Error('ERROR  ' + getFeedTopicsError);
    });
}

async function* yieldAllFeeds() {
  let after = [];
  while (after) {
    let ret = await client
      .query(
        q.Map(
          q.Paginate(q.Match(q.Index('getFeedsIndex')), { size: 7, after: after }),
          q.Lambda('ref', q.Get(q.Var('ref')))
        )
      )
      .then(ret => {
        after = ret.after;
        return ret.data;
      })
      .catch(err => {
        console.error(err);
        console.info('^err^');
        return [];
      });

    yield ret;
  }
}

async function getSourceInfo(sourceName) {
  return client
    .query(
      q.Map(
        q.Paginate(q.Match(q.Index('getSourceByName'), sourceName), {
          size: 1
        }),
        q.Lambda(['ref'], q.Get(q.Var('ref')))
      )
    )
    .then(ret => {
      return ret;
    })
    .catch(e => {
      throw new Error('ERROR  ' + e + '871');
    });
}

async function getFeedInfo(feedName) {
  return client
    .query(
      q.Map(
        q.Paginate(q.Match(q.Index('getFeedByNameIndex'), feedName), {
          size: 1
        }),
        q.Lambda(['ref'], q.Get(q.Var('ref')))
      )
    )
    .then(ret => {
      return ret;
    })
    .catch(e => {
      throw new Error('ERROR  ' + e + '871');
    });
}

async function searchFeedsByFeedLink(feedLink) {
  return client
    .query(
      q.Map(
        q.Paginate(q.Match(q.Index('getFeedByLinkIndex'), feedLink), {
          size: 1
        }),
        q.Lambda(['ref'], q.Get(q.Var('ref')))
      )
    )
    .then(ret => {
      return ret;
    })
    .catch(e => {
      console.error(e);

      throw new Error('Database error');
    });
}
async function searchFeedsByTopic(topics) {
  let matchQueries = topics.map(topic => q.Match(q.Index('searchFeedsByTopics'), topic));

  return client
    .query(q.Map(q.Paginate(q.Union(matchQueries)), q.Lambda(['ref'], q.Get(q.Var('ref')))))
    .then(ret => {
      return ret;
    })
    .catch(searchFeedsByTopicError => {
      throw new Error('ERROR  ' + searchFeedsByTopicError);
    });
}

async function searchFeedsByName(searchQuery) {
  searchQuery = searchQuery.toLowerCase();

  return client
    .query(
      q.Map(
        q.Filter(
          q.Paginate(q.Match(q.Index('feedNameSearchIndex'))),
          q.Lambda(['name', 'ref'], q.ContainsStr(q.LowerCase(q.Var('name')), searchQuery))
        ),
        q.Lambda(['feed', 'ref'], q.Get(q.Var('ref')))
      )
    )
    .then(ret => {
      return ret;
    })
    .catch(err => {
      throw new Error(`ERROR couldn't search for ${searchQuery}`);
    });
}

async function getFeedItems(feedNames, { ...options } = {}) {
  const defaultOptions = {
    size: 19,
    after: []
  };

  options = {
    ...defaultOptions,
    ...options
  };

  if (options.after.length) {
    options.after = [options.after[0], q.Ref(q.Collection('articles'), options.after[1])];
  }

  let matchQueries = feedNames.map(feedName =>
    q.Match(q.Index('article_search_feed_sort_date'), feedName)
  );

  return client
    .query(
      q.Map(
        q.Paginate(q.Union(matchQueries), {
          size: options.size,
          after: options.after
          //after: after.ref ? [after.ts, q.Ref(q.Collection('articles'), after.ref)] : []
        }),
        q.Lambda(['feed', 'ref'], q.Get(q.Var('ref')))
      )
    )
    .then(ret => JSON.parse(JSON.stringify(ret)))
    .then(ret => {
      //console.log(`${JSON.stringify(ret)} <== getItems query ret\n\n`);

      //console.log(`${ret.data.length} <== ret.data.length\n\n ==> ${feedName}`);

      if (ret.data.length === 0) {
        throw new Error('ERROR');
        return;
      }

      //TODO nullish coalasence

      //If there's no after, put an empty string
      //TODO handle this in front end
      let afterRef = ret['after'] ? ret['after'][1]['@ref']['id'] : '';

      return {
        data: ret.data.map(item => ({
          id: item['ref']['@ref']['id'],
          title: item['data']['title'],
          source: item['data']['source'],
          date: item['data']['date'],
          topics: [...item['data']['topics']],
          link: item['data']['link'],
          image: item['data']['image'],
          description: item['data']['description'],
          contentSnippetParagraphs: item['data']['contentSnippetParagraphs'],
          metaDescription: item['data']['metaDescription'],
          ampURL: item['data']['ampURL']
        })),
        after: {
          ref: afterRef,
          ts: ret['after'] ? ret['after'][0] : ''
        }
      };
    })
    .catch(getItemsError => {
      throw new Error(`ERROR due to ${getItemsError}`);
    });
}
async function getItems(sources, after, options = {}) {
  //get the items based by source from the databse to show to the user

  let matchQueries = sources.map(source =>
    q.Match(q.Index('article_search_feed_sort_date'), source)
  );

  if (after.ref) {
    console.log('Got after');
  }

  return client
    .query(
      q.Map(
        q.Paginate(q.Union(matchQueries), {
          size: options.size ? options.size : 9, // TODO remove ternary
          after: after.ref ? [after.ts, q.Ref(q.Collection('articles'), after.ref)] : []
        }),
        q.Lambda(['feed', 'ref'], q.Get(q.Var('ref')))
      )
    )
    .then(ret => JSON.parse(JSON.stringify(ret)))
    .then(ret => {
      //console.log(`${JSON.stringify(ret)} <== getItems query ret\n\n`);

      //   console.log(`${ret.data.length} <== ret.data.length\n\n ==> ${sources}`);

      if (ret.data.length === 0) {
        throw new Error('ERROR');
        return;
      }

      //TODO nullish coalasence

      //If there's no after, put an empty string
      //TODO handle this in front end
      let afterRef = ret['after'] ? ret['after'][1]['@ref']['id'] : '';

      return {
        data: ret.data.map(item => ({
          id: item['ref']['@ref']['id'],
          title: item['data']['title'],
          source: item['data']['source'],
          date: item['data']['date'],
          topics: [...item['data']['topics']],
          link: item['data']['link'],
          image: item['data']['image'],
          description: item['data']['description'],
          metaDescription: item['data']['metaDescription'],
          ampURL: item['data']['ampURL']
        })),
        after: {
          ref: afterRef,
          ts: ret['after'] ? ret['after'][0] : ''
        }
      };
    })
    .catch(getItemsError => {
      throw new Error(`ERROR due to ${getItemsError} 892`);
    });
} // end of function getItems
async function getLastItemDate(feed) {
  //Get's the last added item's date so that only the new ones are added to the database

  return await client
    .query(
      q.Map(
        q.Paginate(q.Match(q.Index('article_search_feed_sort_date'), feed), {
          size: 1
        }),
        q.Lambda(['source', 'ref'], q.Get(q.Var('ref')))
      )
    )
    .then(ret => {
      if (ret['data'].length === 0) {
        // if no item from that source is found in database
        return new Date('December 17, 2000 03:24:00');
      } else {
        return ret['data'][0]['data']['date'];
      }
    })
    .catch(getLastItemError => {
      console.error(getLastItemError);
      console.warn(`Error for ${source}`);

      throw new Error(`Couldn't get last item date for ${source}`);
    });
  // if nothing for that source is found in the databse, return the current date
}

function deleteOldItems() {
  client
    .query(q.Paginate(q.Match(q.Index('article_sort_date')), { size: 377 }))
    .then(queryResult => {
      let fiveDaysAgo = new Date(new Date().setDate(new Date().getDate() - 0));
      let refsToDelete = queryResult.data
        .filter(item => new Date(item[0]) < fiveDaysAgo)
        .map(item => JSON.parse(JSON.stringify(item[1]))['@ref']['id']);
      return refsToDelete;
    })
    .then(refs => {
      return client.query(
        q.Map(refs, q.Lambda('ref', q.Delete(q.Ref(q.Collection('articles'), q.Var('ref')))))
      );
    })
    .then(deleteQueryRet => {
      console.info(`Deleted ${deleteQueryRet.length} items\n\n`);
    })
    .catch(e => {
      console.log(`${e} <== Delete pagination error\n\n`);
    });

  console.log('Deleting');
}

module.exports = {
  addMultiple: addMultiple,
  deleteOldItems: deleteOldItems,
  getLastItemDate: getLastItemDate,
  getItems: getItems,
  getItemByRef: getItemByRef,
  getTopicsFromFeeds: getTopicsFromFeeds,
  searchFeedsByTopic: searchFeedsByTopic,
  getFeedItems: getFeedItems,
  getFeedInfo: getFeedInfo,
  getSourceInfo: getSourceInfo,
  searchFeedsByName: searchFeedsByName,
  yieldAllFeeds: yieldAllFeeds,
  searchFeedsByFeedLink: searchFeedsByFeedLink,
  addNewFeed: addNewFeed
};
