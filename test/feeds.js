process.env.NODE_ENV = 'test';

let server = require('../index');
let chai = require('chai');
let should = chai.should();
let chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe('setting custom user feed', function () {
  it('should respond with an error when trying to add with admin username', function (done) {
    chai
      .request(server)
      .get('/addFeedFromLink')
      .query({ feedLink: 'https://www.technologyreview.com/stories.rss', userId: 'admin' })
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('status').eql('ERROR');
        res.body.should.have.property('body').eql('Bad auth');
        done();
      });
  });

  it('should respond with an error when trying to add an already existing feed', function (done) {
    chai
      .request(server)
      .get('/addFeedFromLink')
      .query({ feedLink: 'https://www.wired.com/feed/rss', userId: 'random' })
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('status').eql('ERROR');
        res.body.should.have.property('body').eql('Already Exists');
        done();
      });
  });
});
