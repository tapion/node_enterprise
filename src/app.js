const express = require('express');
const cors = require('cors');
const compression = require('compression');
const operatorRoute = require('./api/operators');
const authRoute = require('./api/auth');
const rolsRoute = require('./api/rols');
const notificationsRoute = require('./api/notifications');
const usersRoute = require('./api/users');
const clientsRoute = require('./api/clients');
const zoneRoute = require('./api/zones');
const stateRoute = require('./api/states');
const dashBoardRoute = require('./api/dashboard');
const workFlowRoute = require('./api/workFlows');

const app = express();

app.use(cors());
app.options('*', cors());
app.use(compression());
app.use(express.json());
app.use('/v1/operators/', operatorRoute);
app.use('/v1/auth/', authRoute);
app.use('/v1/roles/', rolsRoute);
app.use('/v1/notifications/', notificationsRoute);
app.use('/v1/users/', usersRoute);
app.use('/v1/clients/', clientsRoute);
app.use('/v1/zones/', zoneRoute);
app.use('/v1/states/', stateRoute);
app.use('/v1/dashBoard/', dashBoardRoute);
app.use('/v1/workFlow/', workFlowRoute);

app.listen(3000, () => {
  console.log('Inicio esto');
});
