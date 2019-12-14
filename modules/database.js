// --------------- dependencies & initialisations ----------

require('dotenv').config();

let faunadb = require('faunadb');
let q = faunadb.query;
let client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET
});

// --------------- functions ----------

// function getFaunaDate(news_item) {
//   return new Promise((resolve, reject) => {
//     client.query(q.ToDate(news_item.date)).then(ret => {
//       resolve({
//         ...news_item,
//         date: ret.value
//       });
//     });
//   });
// }

function getLastItem(source) {
  //Get's the last added item so that only the new ones are added to the database
  //Returns the last title for the given source

  return new Promise((resolve, reject) => {
    client
      .query(
        q.Map(
          q.Paginate(q.Match(q.Index('article_sort_by_date2'), source), {
            size: 1
          }),
          q.Lambda(['source', 'ref'], q.Get(q.Var('ref')))
        )
      )
      .then(ret => {
        if (ret['data'].length === 0) {
          // if no item from that source is found in database
          resolve('');
          return;
        } else {
          resolve(ret['data'][0]['data']['title']);
          return;
        }
      })
      .catch(getLastItemError => {
        console.log(`${getLastItemError} <== getLastItemError \n`);
      });
  });
}

function addMultiple(newPosts) {
  // Convert date to Fauna date format
  newPosts = newPosts.map(post => {
    return new Promise((resolve, reject) => {
      client.query(q.ToDate(post.date)).then(ret => {
        resolve({
          ...post,
          date: ret.value
        });
      });
    });
  });

  Promise.all(newPosts).then(mpmpmp => {
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
  });
  //   client
  //     .query(
  //       q.Map(
  //         newPosts,
  //         q.Lambda(
  //           'post',
  //           //q.Date(q.Var('post').date)
  //           q.Create(q.Collection('posts'), {
  //             data: { date: q.Var('post').date }
  //             //data: q.Var('post')
  //           })
  //         )
  //       )
  //     )
  //     .then(addMultipleQueryResult =>
  //       console.log(
  //         `${JSON.stringify(addMultipleQueryResult)} <== queryResult \n`
  //       )
  //     )
  //     .catch(addMultipleQueryError =>
  //       console.log(
  //         `${JSON.stringify(addMultipleQueryError)} <== addMultipleQueryError \n`
  //       )
  //     );
}

function deleteOldItems() {
  console.log('Deleting');
}

module.exports = {
  addMultiple: addMultiple,
  deleteOldItems: deleteOldItems,
  getLastItem: getLastItem
};

// Map(
//   Paginate(Match(Index("all_letters"))),
//   Lambda("X", Get(Var("X")))
// )
