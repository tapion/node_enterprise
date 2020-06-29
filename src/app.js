const express = require('express');
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

app.use(compression());
app.use(express.json());
app.use('/operators/', operatorRoute);
app.use('/auth/', authRoute);
app.use('/rols/', rolsRoute);
app.use('/notifications/', notificationsRoute);
app.use('/users/', usersRoute);
app.use('/clients/', clientsRoute);
app.use('/zones/', zoneRoute);
app.use('/states/', stateRoute);
app.use('/dashBoard/', dashBoardRoute);
app.use('/workFlow/', workFlowRoute);

app.listen(3000, () => {
  console.log('Inicio esto');
});
