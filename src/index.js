const bodyParser = require('body-parser');
const express = require('express');
const logger = require('morgan');
const app = express();
const Reckoner = require('./reckoner');
const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler,
} = require('./handlers.js');

app.set('port', process.env.PORT || 8080);

app.enable('verbose errors');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(poweredByHandler);

app.post('/start', (request, response) => {
  return response.status(200).json({});
});

app.post('/move', (request, response) => {
  console.log(`${request.body.turn} : ${request.body.game}`);
  const reckoner = new Reckoner(request.body);
  const data = {
    move: reckoner.move,
  };

  return response.status(200).json(data);
});

app.post('/end', (request, response) => {
  return response.json({});
});

app.get('/', (request, response) => {
  return response.status(200).json({
    apiversion: '1',
    author: 'logankuzyk',
    color: '#803A4B',
    head: 'default',
    tail: 'sharp',
  });
});

app.use('*', fallbackHandler);
app.use(notFoundHandler);
app.use(genericErrorHandler);

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'));
});
