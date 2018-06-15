const mongoose = require('mongoose');
const fs = require('fs');
var models = {};

module.exports.setup = (modelsPath) => {
  mongoose.connect(process.env.MONGODB_URI);
  buildModels(modelsPath);
};

module.exports.models = models;

module.exports.model = (name) => {
  return models[name];
};

function buildModels(modelsPath){
  fs.readdirSync(modelsPath).forEach((name) => {
    const modelFile = require(`${modelsPath}/${name}`);
    
    models[modelFile.model] = mongoose.model(modelFile.model, modelFile.schema);

  });
}
