const bodyParser = require('body-parser');
const express = require('express');
const logger = require('morgan');
const fs = require('fs');
const app = express();
const OddOphidian = require('./oddOphidian');
const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler,
} = require('./handlers.js');

app.set('port', process.env.PORT || 5000);

app.enable('verbose errors');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(poweredByHandler);

app.post('/start', (request, response) => {
  return response.status(200).json({});
});

app.post('/move', (request, response) => {
  fs.appendFile(__dirname + './tests/request.json', request.body, (err) => {
    if (err) throw err;
    console.log('Saved!');
  });
  const oddOphidian = new OddOphidian(request.body);
  const data = {
    move: oddOphidian.move,
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
    color: '#61FF7E',
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
