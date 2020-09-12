const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const flash = require("connect-flash");
const session = require("express-session");

app.engine(
  ".hbs",
  exphbs({
    defaultLayout: "main",
    extname: ".hbs",
    layoutsDir: path.join(__dirname, "views/layouts"),
  })
);

app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));

mongoose.connect("mongodb://localhost:27017/AppDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", (err) => {
  console.log(err);
});

db.once("open", () => {
  console.log("database conncected");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});
app.use(express.static(path.join(__dirname, "/public")));

const AuthRoute = require("./routes/auth");
const ProductRoute = require("./routes/products");

app.use("/", AuthRoute);
app.use("/", ProductRoute);
app.get("/", (req, res) => {
  res.render("welcome");
});

const server = app.listen(3001, (err) => {
  if (!err) {
    console.log("Server Connected");
  } else {
    console.log("Error Connection");
  }
});
