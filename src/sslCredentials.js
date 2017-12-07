const path = require('path');
const { readFileSync } = require('fs');

module.exports = {
  key: readFileSync(path.join(__dirname, '../sslcert/server.key'), 'utf8'),
  cert: readFileSync(path.join(__dirname, '../sslcert/server.crt'), 'utf8'),
};
