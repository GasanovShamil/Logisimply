let config = require("./config");
let express = require("express");
let path = require("path");
let favicon = require("serve-favicon");
let logger = require("morgan");
let cookieParser = require("cookie-parser");
let bodyParser = require("body-parser");
let cors = require("cors");
let swaggerJSDoc = require("swagger-jsdoc");

//let test = require("./routes/test");
let users = require("./routes/users");
let customers = require("./routes/customers");
let providers = require("./routes/providers");
let items = require("./routes/items");
let quotes = require("./routes/quotes");
let bills = require("./routes/bills");

let app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

let swaggerDefinition = {
    info: {
        title: "Logisimply API",
        version: "1.1.0",
        description: "Welcome to the Logisimply API documentation",
    },
    host: config.base_url,
    basePath: "/",
};

let options = {
    swaggerDefinition: swaggerDefinition,
    apis: ["./routes/*.js"]
};

let swaggerSpec = swaggerJSDoc(options);

app.use(cors());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "/dist")));
app.use(express.static(path.join(__dirname, "/public")));

// serve swagger
app.get("/swagger.json", function(req, res) {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

//app.use("/api/test", test);
app.use("/api/users", users);
app.use("/api/customers", customers);
app.use("/api/providers", providers);
app.use("/api/items", items);
app.use("/api/quotes", quotes);
app.use("/api/bills", bills);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, "dist/index.html"));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
});


module.exports = app;