process.env.NODE_ENV = 'test';

let server = require('../index');
let chai = require('chai');
let should = chai.should();
let chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe('/GET getFeeds', function () {
  it('should return an error when searching with a single letter query', function (done) {
    chai
      .request(server)
      .get('/getFeeds/?searchTerm=a') // TODO use query the chai syntax
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('status').eql('ERROR');

        done();
      });
  });

  it('should return an error when a feed can not be found', function (done) {
    chai
      .request(server)
      .get('/getFeeds/?searchTerm=8u89yuhyg')
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('status').eql('ERROR');
        res.body.should.have.property('data').eql('Nothing found');
        done();
      });
  });
});
