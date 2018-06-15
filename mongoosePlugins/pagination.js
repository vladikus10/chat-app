const async = require('async');
const meta = require('../helpers/metaData');

function findAndCountTotal(query, projection = null, options) {
  return new Promise((resolve, reject) => {

    async.parallel([(done) => {
      let q = this.find(query, projection);

      for (let opt in options) {

        if (opt === 'populate') {
          for (let pop of options[opt]) {
            q.populate(pop);
          }
        }

        else q[opt](options[opt]);
      }

      q.exec().then(result => {
        done(null, result);
      }, error => {
        done(error);
      });

    }, (done) => {

      this.count(query).exec().then(result => {
        done(null, result);
      }, error => {
        done(error);
      });

    }], (error, [docs, count]) => {
      if (error) return reject(error);

      let response = {};
      /*let docs = [];

      for (let doc of docs) {
        docs.push(doc.toObject(options.toObject || {}));
      }*/

      response[this.collection.name] = docs;
      response._meta = meta(count);

      resolve(response);
    });
  });
}

module.exports = (schema) => {
  schema.statics.findAndCountTotal = findAndCountTotal;
};