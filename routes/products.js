const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const User = require("../models/User");

router.get("/dashboard/:id", (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (user) {
        Product.find()
          .populate("owner", "name")
          .then((prods) => {
            const context = {
              prodDocuments: prods.map((prod) => {
                if (prod.quantity > 0) {
                  return {
                    id: prod._id,
                    name: prod.name,
                    description: prod.description,
                    imageurl: prod.imageurl,
                    price: prod.price,
                    quantity: prod.quantity,
                    ownername: prod.owner.name,
                    ownerid: user._id,
                  };
                } else {
                  return undefined;
                }
              }),
            };
            res.render(`dashboardbuyer`, {
              products: context.prodDocuments,
              userID: user._id,
            });
          });
      } else {
        res.send({ message: "User not found" });
      }
    })
    .catch((err) => {
      res.json(err);
    });
});
router.get("/add-to-cart/:userid/:prodid", (req, res) => {
  User.findById(req.params.userid).then((user) => {
    if (user) {
      user.cart.push(req.params.prodid);
      Product.findById(req.params.prodid)
        .then((prod) => {
          prod.quantity = prod.quantity - 1;
          prod.buyers.push(req.params.userid);
          prod.save();
        })
        .catch((err) => {
          res.json(err);
        });
      user
        .save()
        .then((user) => {
          res.redirect(`/dashboard/${req.params.userid}`);
        })
        .catch((err) => {
          res.json(err);
        });
    }
  });
});

router.get("/seller/sales/:id", (req, res) => {
  User.findById(req.params.id)
    .populate("products")
    .then((user) => {
      if (user.seller) {
        let context1;
        const context = {
          prodDocuments: user.products.map((prod) => {
            prod.populate("buyers").then((prod) => {
              context1 = {
                prodDocuments: prod.buyers.map((user) => {
                  return {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                  };
                }),
              };
              res.json(context1);
            });
            return {
              context1,
            };
          }),
        };
      } else {
        res.send({ message: "User Not found" });
      }
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/cart/:id", (req, res) => {
  User.findById(req.params.id)
    .populate("cart")
    .then((user) => {
      const context = {
        prodDocuments: user.cart.map((prod) => {
          return {
            id: prod._id,
            name: prod.name,
            description: prod.description,
            imageurl: prod.imageurl,
            price: prod.price,
            quantity: prod.quantity,
            ownername: prod.owner.name,
            ownerid: user._id,
          };
        }),
      };
      res.render("cart", {
        products: context.prodDocuments,
        userID: user._id,
      });
    })
    .catch((err) => {
      res.json(err);
    });
});
router.get("/dashboard/seller/:id", (req, res) => {
  User.findById(req.params.id)
    .populate("products")
    .then((user) => {
      const context = {
        prodDocuments: user.products.map((prod) => {
          return {
            id: prod._id,
            name: prod.name,
            description: prod.description,
            imageurl: prod.imageurl,
            price: prod.price,
            quantity: prod.quantity,
            owner: prod.owner,
          };
        }),
      };
      res.render(`dashboard`, {
        products: context.prodDocuments,
        userName: user.name,
        userID: user._id,
      });
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/seller/add/:id", (req, res) => {
  User.findById(req.params.id).then((user) => {
    if (user.seller) {
      res.render("add", {
        userID: user._id,
      });
    }
  });
});

router.post("/seller/add/:id", (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (user.seller) {
        const { name, description, imageurl, price, quantity } = req.body;
        let newProduct = new Product({
          name: name,
          description: description,
          imageurl: imageurl,
          price: price,
          quantity: quantity,
          owner: user._id,
        });
        newProduct
          .save()
          .then((prod) => {
            res.redirect(`/dashboard/seller/${user._id}`);
          })
          .catch((err) => {
            res.json(err);
          });
      } else {
        res.send({ message: "Seller Not found" });
      }
    })
    .catch((err) => {
      res.json({ message: "error occured" });
    });
});

router.get("/seller/update/:userid/:prodid", (req, res) => {
  User.findById(req.params.userid)
    .then((user) => {
      Product.findById(req.params.prodid)
        .then((prod) => {
          if (prod) {
            res.render("update", {
              userID: user._id,
              prodid: prod._id,
              name: prod.name,
              description: prod.description,
              imageurl: prod.imageurl,
              price: prod.price,
              quantity: prod.quantity,
            });
          } else {
            res.send({ message: "error occured" });
          }
        })
        .catch((err) => {
          res.json(err);
        });
    })
    .catch((err) => {
      res.json(err);
    });
});
router.post("/seller/update/:userid/:prodid", (req, res) => {
  Product.findById(req.params.prodid)
    .then((prod) => {
      const { name, description, imageurl, price, quantity } = req.body;
      prod.name = name;
      prod.description = description;
      prod.imageurl = imageurl;
      prod.price = price;
      prod.quantity = quantity;
      prod
        .save()
        .then((prod) => {
          res.redirect(`/dashboard/seller/${req.params.userid}`);
        })
        .catch((err) => {
          res.json(err);
        });
    })
    .catch((err) => {
      res.json(err);
    });
});
module.exports = router;
