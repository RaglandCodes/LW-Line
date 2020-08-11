process.env.NODE_ENV = 'test';

let server = require('../index');
let chai = require('chai');
let should = chai.should();
let chaiHttp = require('chai-http');
const { expect } = require('chai');

chai.use(chaiHttp);

describe('/GET feedTopics', function () {
  it('should return an array of all available topics', function (done) {
    chai
      .request(server)
      .get('/feedTopics')
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('status').eql('OK');
        res.body.data.should.be
          .an('array')
          .that.include.members(['tech', 'news', 'magazine', 'culture']); // put newly added topics here
        done();
      });
  });
});
