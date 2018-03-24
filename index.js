const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const morgan = require('morgan');

const accessLogStream = fs.createWriteStream(
  path.resolve(__dirname, 'access.log'),
  {flags: 'a'},
);

const USER_HEADER = 'x-user-id';
const users = {};
const app = express();
app.disable('x-powered-by');
app.set('port', process.env.PORT || 8081);
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

const addCustomerHandler = (req, res, next) => {
  const user = req.headers[USER_HEADER];
  const customer = req.body.customer;
  if (!customer) {
    res.status(403).json({
      error: 'Request body should contain "customer" object.',
    });
  }
  if (customer.id === undefined) {
    customer.id = uuid.v4();
  }
  const customers = users[user] || {};
  customers[customer.id] = customer;
  users[user] = customers;
  res.status(200).json({customer});
  next();
};

const listCustomersHandler = (req, res, next) => {
  const user = req.headers[USER_HEADER];
  const customers = Object.values(users[user] || {}) || [];
  res.status(200).json({
    customers,
  });
  next();
};

const showCustomerHandler = (req, res, next) => {
  const user = req.headers[USER_HEADER];
  const customerId = req.params.id;
  const customers = users[user] || {};
  const customer = customers[customerId];
  if (customer === undefined) {
    res.status(403).json({
      error: `Customer with ID ${customerId} not found.`,
    });
  } else {
    res.status(200).json({
      customer,
    });
  }
  next();
};

const updateCustomerHandler = (req, res, next) => {
  const user = req.headers[USER_HEADER];
  const customer = req.body.customer;
  if (!customer) {
    res.status(403).json({
      error: 'Invalid request body.',
    });
    return;
  }
  const customerId = req.params.id;
  if (customerId === undefined) {
    res.status(400).json({
      error: `Customer with ID ${customerId} not found.`,
    });
    return;
  }
  const customers = users[user] || {};
  const updatedKeys = [];
  Object.keys(customer).forEach(key => {
    customers[customerId][key] = customer[key];
    updatedKeys.push(key);
  });

  users[user] = customers;

  res.status(200).json({customer: users[user][customerId], updatedKeys});
  next();
};

const deleteCustomerHandler = (req, res, next) => {
  const user = req.headers[USER_HEADER];
  const customerId = req.params.id;
  if (!customerId) {
    res.status(403).json({
      error: '',
    });
    return;
  }
  const customer = users[user][customerId];
  if (!customer) {
    res.status(403).json({
      error: 'No such customer.',
    });
    return;
  }
  users[user][customerId] = undefined;
  res.status(200).json({
    message: `Customer ${customerId} deleted.`,
  });
  next();
};

const commonMiddleware = (req, res, next) => {
  const user = req.headers[USER_HEADER];
  if (user === undefined) {
    res.status(403).json({
      error: 'Specify "X-User-ID" header with your ID',
    });
    return;
  } else {
    if (!users[user]) {
      users[user] = {};
    }
  }
  next();
};

const allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-user-id, Access-Control-Allow-Origin',
  );
  if ('OPTIONS' == req.method) {
    res.send(204);
  } else {
    next();
  }
};

app.use(allowCrossDomain);
app.use(commonMiddleware);
app.use(morgan('combined', {stream: accessLogStream}));
app.post('/add', addCustomerHandler);
app.get('/customers', listCustomersHandler);
app.get('/customer/:id', showCustomerHandler);
app.put('/update/:id', updateCustomerHandler);
app.delete('/delete/:id', deleteCustomerHandler);
app.listen(app.get('port'), () => null);
