var config = require('./config.json');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var swaggerJSDoc = require('swagger-jsdoc');

var users = require('./routes/users');
var customers = require('./routes/customers');
var providers = require('./routes/providers');
var items = require('./routes/items');

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


var swaggerDefinition = {
    info: {
        title: 'Logisimply API',
        version: '1.0.1',
        description: 'Welcome to the Logisimply API documentation',
    },
    host: config.base_url,
    basePath: '/',
};

var options = {
    swaggerDefinition: swaggerDefinition,
    apis: ['./routes/*.js']
};

var swaggerSpec = swaggerJSDoc(options);

app.use(cors());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '/dist')));
app.use(express.static(path.join(__dirname, '/public')));

app.use('/api/users', users);
app.use('/api/customers', customers);
app.use('/api/providers', providers);
app.use('/api/items', items);

// serve swagger
app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Catch all other routes and return the index file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;