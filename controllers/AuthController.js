const User = require("../models/User");
const bcrpyt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = (req, res, next) => {
  bcrpyt.hash(req.body.password, 10, function (err, hashedPass) {
    if (err) {
      res.json({
        error: err,
      });
    }
    const { name, email, password, password2, seller } = req.body;
    let errors = [];
    if (!name || !email || !password || !password2) {
      errors.push({ message: "Please fill all fields" });
    }

    if (password != password2) {
      errors.push({
        message: "Passwords do not match",
      });
    }

    if (password.length < 6 || password2.length < 6) {
      errors.push({ message: "Password should have atleast 6 characters." });
    }

    if (errors.length > 0) {
      res.render("register", {
        errors,
        isError: true,
      });
    } else {
      User.findOne({ email: email }).then((user) => {
        if (user) {
          errors.push({ message: "Email is already registered" });
          res.render("register", {
            errors,
            isError: true,
          });
        } else {
          let newUser = new User({
            name,
            email,
            password: hashedPass,
          });
          if (seller) {
            newUser.seller = true;
          }
          newUser
            .save()
            .then((user) => {
              req.flash("success_msg", "Welcome to the family!");
              res.redirect("/login");
            })
            .catch((error) => {
              res.json({
                message: "An error occured",
              });
            });
        }
      });
    }
  });
};

const login = (req, res, next) => {
  let username = req.body.email;
  let password = req.body.password;

  User.findOne({ $or: [{ email: username }] }).then((user) => {
    if (user) {
      bcrpyt.compare(password, user.password, function (err, result) {
        if (err) {
          res.json({
            error: err,
          });
        }
        if (result) {
          let token = jwt.sign({ _id: user._id }, "verySecretValue", {
            expiresIn: "1h",
          });
          if (user.seller) {
            res.redirect(`/dashboard/seller/${user._id}`);
          } else {
            res.redirect(`/dashboard/${user._id}`);
          }
        } else {
          req.flash("error_msg", "Password does not match");
          res.redirect("/login");
        }
      });
    } else {
      req.flash("error_msg", "User does not exist!");
      res.redirect("/login");
    }
  });
};

module.exports = {
  register,
  login,
};
