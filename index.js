const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');


dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(cors());
app.options('*', cors());

const logger = (req, res, next) => {
    console.log(`Logged  ${req.url}  ${req.method} -- ${new Date()}`)
    next();
}
app.use(logger);

var routesApi = require('./api/routes/index');
app.use('/api', routesApi);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// catch unauthorised errors
app.use(function (err, req, res, next) {
    res.status(err.status || 400);
    var message = err.message;
    if (err.errno == 1062) {
        message = 'The same record already exists.'
    }
    res.json({
        "message": message,
        "error": {}
    });
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

const port = process.env.PORT || "8000";
app.listen(port, () => {
    console.log(`listining on localhost:${port}`);
})