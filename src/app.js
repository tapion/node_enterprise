const express = require('express');
const compression = require('compression');
const operatorRoute = require('./api/operators');
const authRoute = require('./api/auth');
const rolsRoute = require('./api/rols');
const notificationsRoute = require('./api/notifications');

const app = express();

app.use(compression());
app.use(express.json());
app.use('/operators/', operatorRoute);
app.use('/auth/', authRoute);
app.use('/rols/', rolsRoute);
app.use('/notifications/', notificationsRoute);

app.get('/', (req, res) => {
  res.status(200).json({
    saludo: 'hola Miguel',
  });
});

app.listen(3000, () => {
  console.log('Inicio esto');
});
