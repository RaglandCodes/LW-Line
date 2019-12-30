// --------------- dependencies & initialisations ----------

require('dotenv').config();

let faunadb = require('faunadb');
let q = faunadb.query;
let client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET
});

const fs = require('fs');
const path = require('path');

// --------------- functions ----------

function getItems(sources, after) {
  //get the items from the databse to show to the user

  return new Promise((resolve, reject) => {
    let matchQueries = sources.map(source =>
      q.Match(q.Index('article_sort_by_date_search_by_source'), source)
    );

    if (after.ref) {
      console.log('Got after');
    }
    client
      .query(
        q.Map(
          q.Paginate(q.Union(matchQueries), {
            size: 9,
            after: after.ref
              ? [after.ts, q.Ref(q.Collection('posts'), after.ref)]
              : []
          }),
          q.Lambda(['source', 'ref'], q.Get(q.Var('ref')))
        )
      )
      .then(ret => JSON.parse(JSON.stringify(ret)))
      .then(ret => {
        //console.log(`${JSON.stringify(ret)} <== getItems query ret\n\n`);
        fs.writeFileSync(
          path.join(__dirname, './aa.json'),
          JSON.stringify(ret)
        );
        console.log(`${ret.data.length} <== ret.data.length\n\n`);

        if (ret.data.length === 0) {
          resolve('ERROR');
          return;
        }
        let afterRef = ret['after'][1]['@ref']['id'];
        resolve({
          data: ret.data.map(item => ({
            id: item['ref']['@ref']['id'],
            title: item['data']['title'],
            source: item['data']['source'],
            topics: [...item['data']['topics']],
            link: item['data']['link'],
            image: item['data']['image'],
            description: item['data']['description'],
            metaDescription: item['data']['metaDescription'],
            ampURL: item['data']['ampURL']
          })),
          after: {
            ref: afterRef,
            ts: ret['after'][0]
          }
        });
        return;
      })
      .catch(error => {
        console.error(`${error} <== getItems\n\n`);
        resolve('ERROR');
        return;
      });
  }); // end of return Promise
} // end of function getItems

function getLastItem(source) {
  //Get's the last added item so that only the new ones are added to the database
  //Returns the last title for the given source

  return new Promise((resolve, reject) => {
    client
      .query(
        q.Map(
          q.Paginate(
            q.Match(q.Index('article_sort_by_date_search_by_source'), source),
            {
              size: 1
            }
          ),
          q.Lambda(['source', 'ref'], q.Get(q.Var('ref')))
        )
      )
      .then(ret => {
        if (ret['data'].length === 0) {
          // if no item from that source is found in database
          resolve('');
          return;
        } else {
          resolve(ret['data'][0]['data']['date']);
          // console.log(
          //   `${ret['data'][0]['data']['date']} <== Last date for ${source} \n\n`
          // );
          return;
        }
      })
      .catch(getLastItemError => {
        console.error(`${getLastItemError} <== getLastItemError \n`);
      });
  });
}

function addMultiple(newPosts) {
  // Convert date to Fauna date format

  //console.log("Adding multiple");

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
          console.log(`${toDateError} <== toDateError\n\n`);
        });
    });
  });

  Promise.all(newPosts)
    .then(mpmpmp => {
      client.query(
        q.Map(
          mpmpmp,
          q.Lambda(
            'post',
            q.Create(q.Collection('posts'), {
              data: q.Var('post')
            })
          )
        )
      );
    })
    // .then(addMultipleQueryResult =>
    //   console.log(`${addMultipleQueryResult} <== addMultipleQueryResult \n`)
    // )
    .catch(addMultipleQueryError =>
      console.error(
        `${JSON.stringify(addMultipleQueryError)} <== addMultipleQueryError \n`
      )
    );
}

function deleteOldItems() {
  //Paginate(Match(Index('articles_sort_by_date')), {size: 5})
  client
    .query(q.Paginate(q.Match(q.Index('articles_sort_by_date')), { size: 77 }))
    .then(queryResult => {
      let fiveDaysAgo = new Date(new Date().setDate(new Date().getDate() - 0));
      let refsToDelete = queryResult.data
        .filter(item => new Date(item[0]) < fiveDaysAgo)
        .map(item => JSON.parse(JSON.stringify(item[1]))['@ref']['id']);

      //console.log(`${JSON.stringify(refsToDelete)} <== refsToDelete\n\n`);
      return refsToDelete;
    })
    .then(refs => {
      return client.query(
        q.Map(
          refs,
          q.Lambda('ref', q.Delete(q.Ref(q.Collection('posts'), q.Var('ref'))))
        )
      );
    })
    .then(deleteQueryRet => {
      console.log(`Deleted ${deleteQueryRet.length} items\n\n`);
    })
    .catch(e => {
      console.log(`${e} <== Delete pagination error\n\n`);
    });

  console.log('Deleting');
}

module.exports = {
  addMultiple: addMultiple,
  deleteOldItems: deleteOldItems,
  getLastItem: getLastItem,
  getItems: getItems
};
