// --------------- dependencies & initialisations ----------

// const fs = require('fs');
// const path = require('path');
const db = require('./database');

const sources = [
  {
    name: 'The Verge',
    about:
      'The Verge is an ambitious multimedia effort to examine how technology will change life in the future for a massive mainstream audience.'
  },
  {
    name: 'BBC',
    about: 'The BBC is the world’s leading public service broadcaster'
  },
  {
    name: 'Ars Technica',
    about:
      "a publication devoted to technology that would cater to what he called 'alpha geeks': technologists and IT professionals. "
  },
  {
    name: 'The Next Web',
    about: 'Sharing, inventing and advancing tech developments'
  },
  {
    name: 'Aeon',
    about:
      'Aeon is a magazine of ideas and culture. Publishing in-depth essays, incisive articles, and a mix of original and curated videos'
  },
  { name: 'WIRED', about: 'WIRED is where tomorrow is realised' },
  {
    name: 'Futurism',
    about: 'Bringing you the world, the news, products, and narratives of tomorrow, today.'
  },
  {
    name: 'freeCodeCamp',
    about: 'A nonprofit community that helps you learn to code by building projects.'
  },
  {
    name: 'Smashing Magazine',
    about:
      'Smashing Magazine delivers reliable, useful, but most importantly practical articles to web designers and developers.'
  },
  {
    name: 'TechCrunch',
    about:
      'Breaking technology news, analysis, and opinions from TechCrunch. Your number one guide for all things tech.'
  },
  {
    name: 'Fast Company',
    about:
      'World’s leading business media brand, with an editorial focus on innovation in technology, leadership, world changing ideas, creativity, and design'
  },
  { name: 'Adobe 99U', about: 'A Creative Career Resource' },
  {
    name: 'The Atlantic',
    about: 'Ideas that enlighten, challenge, and delight.'
  },
  {
    name: 'The Week [UK]',
    about: 'All you need to know about every thing that matters'
  },
  {
    name: 'CNET',
    about:
      "CNET is the world's leader in tech product reviews, news, prices, videos, forums, how-tos and more."
  },
  {
    name: 'Vox',
    about:
      'General interest news site for the 21st century. Its mission is simple: Explain the news.'
  },
  {
    name: 'The Economist',
    about: 'News and analysis with a global perspective'
  },

  { name: 'Vice', about: 'The Definitive Guide To An Uncertain World' },
  {
    name: 'MIT Technology Review',
    about:
      'MIT Technology Review is first to report on important new technologies that will affect your organization, your career, your life.'
  },
  {
    name: 'The Wall Street Journal',
    about: 'Coverage of breaking news and current headlines from the US and around the world'
  },
  {
    name: 'Surface',
    about:
      'Surface covers the worlds of architecture, art, design, fashion, and travel, with a focus on how these fields shape and are shaped by contemporary culture. '
  },
  {
    name: 'ProPublica',
    about:
      'An independent, non-profit newsroom that produces investigative journalism in the public interest.'
  },
  { name: 'Slate', about: 'A daily magazine on the web' },
  {
    name: 'BuzzFeed',
    about: 'All the trending buzz you’ll want to share with your friends'
  },
  {
    name: 'Quanta Magazine',
    about: 'Illuminating basic science and math research through public service journalism.'
  },
  {
    name: 'Knowable Magazine',
    about:
      'Knowable Magazine explores the real-world significance of scholarly work through a journalistic lens.'
  },
  {
    name: 'The Intercept',
    about:
      'The Intercept is an award-winning news organization dedicated to holding the powerful accountable through fearless, adversarial journalism.'
  },
  {
    name: 'Longreads',
    about:
      'Longreads is dedicated to helping people find and share the best storytelling in the world; featuring in-depth investigative reporting, interviews and profiles, podcasts, essays and criticism.'
  },
  {
    name: 'The New Yorker',
    about:
      'The New Yorker stands apart for its commitment to truth and accuracy, for the quality of its prose, and for its insistence on exciting and moving every reader..'
  }
];

const feeds = [
  {
    feed: 'The Verge',
    source: 'The Verge',
    rssLink: 'https://www.theverge.com/rss/index.xml',
    siteLink: 'https://www.theverge.com/',
    topics: ['tech']
  },
  {
    feed: 'BBC News - World',
    source: 'BBC',
    rssLink: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    siteLink: 'https://www.bbc.com/',
    topics: ['news']
  },
  {
    feed: 'BBC News - Tech',
    source: 'BBC',
    rssLink: 'http://feeds.bbci.co.uk/news/technology/rss.xml',
    siteLink: 'https://www.bbc.com/news/technology',
    topics: ['news', 'tech']
  },
  {
    source: 'Ars Technica',
    feed: 'Ars Technica',
    rssLink: 'http://feeds.arstechnica.com/arstechnica/index',
    siteLink: 'https://arstechnica.com',
    type: 'text',
    topics: ['tech']
  },
  {
    source: 'The Next Web',
    feed: 'The Next Web',
    rssLink: 'http://feeds.feedburner.com/thenextweb',
    siteLink: 'https://thenextweb.com/',
    type: 'text',
    topics: ['tech']
  },
  {
    source: 'Aeon',
    feed: 'Aeon',
    topics: ['magazine', 'culture'],
    siteLink: 'https://aeon.co/',
    rssLink: 'https://aeon.co/feed.rss'
  },
  {
    source: 'WIRED',
    feed: 'WIRED',
    topics: ['magazine'],
    siteLink: 'https://www.wired.com/',
    rssLink: 'https://www.wired.com/feed/rss'
  },
  {
    source: 'Futurism',
    feed: 'Futurism',
    topics: ['sciene', 'tech'],
    siteLink: 'https://futurism.com/',
    rssLink: 'https://futurism.com/feed'
  },
  {
    source: 'freeCodeCamp',
    feed: 'freeCodeCamp',
    topics: ['coding'],
    siteLink: 'https://www.freecodecamp.org/news/',
    rssLink: 'https://www.freecodecamp.org/news/rss/'
  },
  {
    source: 'Smashing Magazine',
    feed: 'Smashing Magazine',
    topics: ['coding', 'design', 'web_design'],
    siteLink: 'https://www.smashingmagazine.com/',
    rssLink: 'https://www.smashingmagazine.com/feed'
  },
  {
    source: 'TechCrunch',
    feed: 'TechCrunch',
    topics: ['news', 'tech'],
    siteLink: 'https://techcrunch.com/',
    rssLink: 'http://feeds.feedburner.com/TechCrunch/'
  },
  {
    source: 'Fast Company',
    feed: 'Fast Company',
    topics: [],
    siteLink: 'https://www.fastcompany.com',
    rssLink: 'http://feeds.feedburner.com/fastcompany/headlines'
  },
  {
    source: 'Adobe 99U',
    feed: 'Adobe 99U',
    topics: ['design'],
    siteLink: 'https://99u.adobe.com/',
    rssLink: 'http://feeds.feedburner.com/The99Percent'
  },
  {
    source: 'The Atlantic',
    feed: 'The Atlantic World',
    topics: [],
    siteLink: 'https://www.theatlantic.com/world/',
    rssLink: 'https://www.theatlantic.com/feed/all/'
  },
  {
    source: 'The Week [UK]',
    feed: 'The Week [UK]',
    topics: ['news'],
    siteLink: 'https://theweek.com/',
    rssLink: 'https://theweek.com/rss.xml'
  },
  {
    source: 'CNET',
    feed: 'CNET',
    topics: ['news', 'tech'],
    siteLink: 'https://www.cnet.com/',
    rssLink: 'https://www.cnet.com/rss/all/'
  },
  {
    source: 'Vox',
    feed: 'Vox',
    topics: ['news'],
    siteLink: 'https://www.vox.com/',
    rssLink: 'https://www.vox.com/rss/index.xml'
  },
  {
    source: 'The Economist',
    feed: 'The Economist Briefing',
    topics: ['news'],
    siteLink: 'https://www.economist.com/briefing/rss.xml',
    rssLink: 'https://www.economist.com/briefing/rss.xml'
  },
  {
    source: 'The Economist',
    feed: 'The Economist - Asia',
    topics: ['news', 'locale:Asia'],
    siteLink: 'https://www.economist.com/asia/',
    rssLink: 'https://www.economist.com/asia/rss.xml'
  },
  {
    source: 'The Economist',
    feed: 'The Economist - Europe',
    topics: ['news', 'locale:Europe'],
    siteLink: 'https://www.economist.com/europe/',
    rssLink: 'https://www.economist.com/europe/rss.xml'
  },
  {
    source: 'The Economist',
    feed: 'The Economist - Science and technology',
    topics: ['news', 'sciene', 'technology'],
    siteLink: 'https://www.economist.com/asia/',
    rssLink: 'https://www.economist.com/science-and-technology/rss.xml'
  },
  {
    source: 'Vice',
    feed: 'Vice',
    topics: ['news'],
    siteLink: 'https://www.vice.com/en_us',
    rssLink: 'https://www.vice.com/en_us/rss'
  },
  {
    source: 'MIT Technology Review',
    feed: 'MIT Technology Review',
    topics: ['news', 'tech'],
    siteLink: 'https://www.technologyreview.com/',
    rssLink: 'https://www.technologyreview.com/stories.rss'
  },
  {
    source: 'The Wall Street Journal',
    feed: 'The Wall Street Journal World',
    topics: ['news'],
    siteLink: 'https://www.wsj.com/',
    rssLink: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml'
  },
  {
    source: 'Surface',
    feed: 'Surface',
    topics: ['art', 'design'],
    siteLink: 'https://www.surfacemag.com/',
    rssLink: 'https://www.surfacemag.com/feed/'
  },
  {
    source: 'ProPublica',
    feed: 'ProPublica',
    topics: ['investigative journalism', 'news'],
    siteLink: 'https://www.propublica.org/',
    rssLink: 'http://feeds.propublica.org/propublica/main'
  },
  {
    source: 'Slate',
    feed: 'Slate',
    topics: ['magazine'],
    siteLink: 'https://slate.com/',
    rssLink: 'https://slate.com/feeds/all.rss'
  },
  {
    source: 'BuzzFeed',
    feed: 'BuzzFeed - Food',
    topics: ['food'],
    siteLink: 'https://www.buzzfeed.com/food',
    rssLink: 'https://www.buzzfeed.com/food.xml'
  },
  {
    source: 'Quanta Magazine',
    feed: 'Quanta Magazine',
    topics: ['science', 'magazine'],
    siteLink: 'https://www.quantamagazine.org/',
    rssLink: 'https://api.quantamagazine.org/feed/'
  },
  {
    source: 'Knowable Magazine',
    feed: 'Knowable Magazine',
    topics: ['science', 'magazine'],
    siteLink: 'https://www.knowablemagazine.org/',
    rssLink: 'https://www.knowablemagazine.org/rss'
  },
  {
    source: 'The Intercept',
    feed: 'The Intercept',
    topics: ['news'],
    siteLink: 'https://theintercept.com/',
    rssLink: 'https://theintercept.com/feed/?rss'
  },
  {
    source: 'Longreads',
    feed: 'Longreads',
    topics: [],
    siteLink: 'https://longreads.com/',
    rssLink: 'https://longreads.com/feed/'
  },
  {
    source: 'The New Yorker',
    feed: 'The New Yorker - News',
    topics: ['news'],
    siteLink: 'https://www.newyorker.com/news',
    rssLink: 'https://www.newyorker.com/feed/news'
  },
  {
    source: 'The New Yorker',
    feed: 'The New Yorker - Radio Hour',
    topics: ['podcast'],
    siteLink: 'https://www.newyorker.com/podcast/the-new-yorker-radio-hour',
    rssLink: 'http://feeds.wnyc.org/newyorkerradiohour'
  },
  {
    source: 'The New Yorker',
    feed: 'The New Yorker - Culture',
    topics: ['culture'],
    siteLink: 'https://www.newyorker.com/culture',
    rssLink: 'https://www.newyorker.com/feed/culture'
  }
];

// --------------- Functions ----------

// If we have this feed in sources file, return true.
// This is used when user wants to add their own feed

// function checkIfFeedExists(feedLink) {
//   // const sources = JSON.parse(
//   //   fs.readFileSync(path.join(__dirname, '../sources.json'))
//   // );
//   // let existingSource = sources.filter(source => source['rssLink'] === feedLink);

//   let existingFeed = feeds.filter(feed => feed['rssLink'] === feedLink);

//   return existingFeed.length !== 0;
// }

async function routeFeedForStories(request, response) {
  let respondeData = await Promise.all(
    feeds.map(async feed => {
      let latestItem = await db.getItems([feed.feed], {}, { size: 1 });
      latestItem = latestItem.data[0];

      return { ...feed, latestItem };
    })
  );
  response.send(respondeData);
}

async function routeFeedTopics(request, response) {
  let allTopics = await db.getTopicsFromFeeds().catch(getTopicsFromFeedsError => {
    console.log(`${getTopicsFromFeedsError} <== getTopicsFromFeeds\n\n`);
    response.send({
      status: 'ERROR',
      data: []
    });
    return;
  });

  if (allTopics) {
    allTopics = allTopics.data.flat();
    allTopics = [...new Set(allTopics)];

    response.send({
      status: 'OK',
      data: allTopics
    });
    return;
  }

  response.send({
    status: 'ERROR',
    data: 'Unforseen error 380'
  });
}

async function routePreviewFeed(request, response) {
  // returns feedItems and more information of source (if source is there)

  let feed = request.query.feed;
  // TODO what happens for invalid feed name

  let [feedInfo, feedItems] = await Promise.all([
    db.getFeedInfo(feed),
    db.getFeedItems([feed])
  ]).catch(e => {
    console.log(`${e} <== e\n\n`);

    response.send({
      status: 'ERROR',
      data: 'DB Error 930'
    });
    return;
  });

  after = feedItems.after;
  feedItems = feedItems.data;
  feedInfo = feedInfo.data[0].data;

  sourceName = feedInfo.source;
  let sourceInfo = await db.getSourceInfo(sourceName);
  sourceInfo = sourceInfo.data[0].data;

  response.send({
    status: 'OK',
    data: { sourceInfo: sourceInfo, feed: { items: feedItems, after: after } }
  });
}

async function routeGetFeeds(request, response) {
  let searchTerm = request.query.searchTerm;
  let searchTopics = [];
  if (request.query.searchTopics) {
    searchTopics = JSON.parse(request.query.searchTopics);
  }

  if (searchTopics.length > 0) {
    let feeds = await db.searchFeedsByTopic(searchTopics).catch(e => {
      response.send({
        status: 'ERROR',
        data: 'Database Error 182'
      });
      return;
    });

    feeds = feeds.data.map(feed => feed.data);

    response.send({
      status: 'OK',
      data: feeds
    });
  } else if (searchTerm) {
    if (searchTerm.length < 2) {
      response.send({
        status: 'ERROR',
        data: 'Query too short'
      });
      return;
    }

    let feeds = await db.searchFeedsByName(searchTerm).catch(e => {
      console.error(e);

      response.send({
        status: 'ERROR',
        data: 'DB erros 739'
      });
      return;
    });

    feeds = feeds.data;
    if (feeds.length === 0) {
      response.send({
        status: 'ERROR',
        data: 'Nothing found'
      });
      return;
    }

    feeds = feeds.map(feed => feed.data);

    response.send({
      status: 'OK',
      data: feeds
    });
  } else {
    response.send({
      status: 'ERROR',
      data: 'Bad rrequest 016'
    });
  }
}

module.exports = {
  // checkIfFeedExists: checkIfFeedExists,
  routeFeedForStories: routeFeedForStories,
  routeFeedTopics: routeFeedTopics,
  routeGetFeeds: routeGetFeeds,
  routePreviewFeed: routePreviewFeed
};
