const express = require('express');
const { httpPort, httpsPort } = require('../config');
const sslCredentials = require('./sslCredentials');
const api = require('./api');

const app = express();
const httpServer = require('http').createServer(app);
const httpsServer = require('https').createServer(sslCredentials, app);

app.use(require('morgan')('tiny'));
app.use(require('body-parser').json());
app.use('/api', api);

httpServer.listen(httpPort);
httpsServer.listen(httpsPort);

console.log(`Listening on port ${httpsPort}`);
