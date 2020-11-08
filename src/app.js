const express = require('express');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const operatorRoute = require('./api/operators');
const rolsRoute = require('./api/rols');
const notificationsRoute = require('./api/notifications');
const usersRoute = require('./api/users');
const clientsRoute = require('./api/clients');
const zoneRoute = require('./api/zones');
const stateRoute = require('./api/states');
const dashBoardRoute = require('./api/dashboard');
const workFlowRoute = require('./api/workFlows');
const countriesRoute = require('./api/countries');
const formRoute = require('./api/forms');
const orderRoute = require('./api/orders');
const authervice = require('./services/auth');
const errorHandlerController = require('./services/errorController');
const AppError = require('./utils/appError');

dotenv.config({ path: './config.env' });

const app = express();
app.use(cors());
app.options('*', cors());
app.use(compression());
app.use(express.json());
app.use('/v1/users/', usersRoute);
app.use(authervice.getVerifyMiddleware);
app.use('/v1/operators/', operatorRoute);
app.use('/v1/roles/', rolsRoute);
app.use('/v1/countries/', countriesRoute);
app.use('/v1/notifications/', notificationsRoute);
app.use('/v1/customers/', clientsRoute);
app.use('/v1/zones/', zoneRoute);
app.use('/v1/states/', stateRoute);
app.use('/v1/dashBoard/', dashBoardRoute);
app.use('/v1/workFlow/', workFlowRoute);
app.use('/v1/forms/', formRoute);
app.use('/v1/orders/', orderRoute);
app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Can't find the resourse ${req.originalUrl} on the server`,
      404
    )
  );
});

app.use(errorHandlerController);

app.listen(process.env.APP_PORT, () => {
  console.log('Inicio esto en puerto ', process.env.APP_PORT);
});
