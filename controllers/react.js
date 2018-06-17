const path = require('path');

module.exports.sendApp = (req, res, next) => {
    res.sendFile(path.resolve(global.appRoot, 'index.html'));
};
