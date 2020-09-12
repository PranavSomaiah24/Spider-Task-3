const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const User = require("../models/User");
// const User = require("../models/User");

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// router.get("/dashboard/:id",(req,res)=>{
//   User.findById(req.params.id).then((user)=>{
//    if(user){

//    }
//   })
// })
// router.get("/dashboard/seller/:id")
module.exports = router;
