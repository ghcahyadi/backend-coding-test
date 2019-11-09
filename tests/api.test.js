
const request = require('supertest');

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');
const logger = require('../config/winston');

try {
  describe('API tests', () => {
    before((done) => {
      // eslint-disable-next-line consistent-return
      db.serialize((err) => {
        if (err) {
          return done(err);
        }

        buildSchemas(db);
        done();
      });
    });

    describe('GET /health', () => {
      it('should return health', (done) => {
        request(app)
          .get('/health')
          .expect('Content-Type', /text/)
          .expect(200, done);
      });
    });

    describe('GET /rides', () => {
      it('should get all rides', (done) => {
        request(app)
          .get('/rides')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200, done);
      });
    });

    describe('GET /rides/:id', () => {
      it('should get particular ride', (done) => {
        request(app)
          .get('/rides/1')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200, done);
      });
    });
  });
} catch (ex) {
  logger.error(`message - ${ex.message}, stack trace - ${ex.stack}`);
}
