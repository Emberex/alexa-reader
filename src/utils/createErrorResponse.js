const createResponse = require('./createResponse');

module.exports = function errorResponse(error) {
  return createResponse({}, {
    title: 'Error',
    speech: `Error: ${error.message}`
  });
}
