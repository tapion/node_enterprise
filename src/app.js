const express = require('express');
const compression = require('compression');
const operatorRoute = require('./api/operators');

const app = express();

app.use(compression());
app.use('/operators/', operatorRoute);

app.get('/', (req, res) => {
  res.status(200).json({
    saludo: 'hola Miguel',
  });
});

app.listen(3000, () => {
  console.log('Inicio esto');
});
