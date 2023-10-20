const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

const uid2 = require("uid2"); // package qui sert à créer des string aléatoires
const SHA256 = require("crypto-js/sha256"); // sert à encripter une string
const encBase64 = require("crypto-js/enc-base64"); // sert à transformer l'encryptage en string

const User = require("../models/User");

// ROUTE POST POUR CRÉER UN UTILISATEUR

router.post("/user/signup", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  // si le username n'est pas renseigné

  if (!req.body.username) {
    res.status(404).json("The username was not filled");
  }

  // si l'email existe déjà
  else if (user) {
    res.status(404).json({ message: "This email already exists" });
  } else {
    // on génère un salt
    const salt = uid2(16);
    console.log(" salt ===> ", salt);

    // on génère un has
    const hash = SHA256(req.body.password + salt).toString(encBase64);
    console.log("hash ==> ", hash);
    console.log("password ==>", req.body.password);

    // on génère un token
    const token = uid2(64);
    console.log("token ==> ", token);

    // on créer un nouveau User

    const newUser = new User({
      email: req.body.email,
      account: {
        username: req.body.username,
      },
      newsletter: req.body.newsletter,
      token: token,
      hash: hash,
      salt: salt,
    });

    await newUser.save();

    const user = await User.findOne({ "account.username": req.body.username });

    console.log(req.body.username);

    console.log(user);
    //   console.log(typeof user);

    res.json({
      _id: user._id,
      token: user.token,
      account: user.account,
    });
  }
});

// ROUTE POST POUR LOGIN

router.post("/user/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  //   console.log(user);

  //   console.log(req.body.password);

  const hash2 = SHA256(req.body.password + user.salt).toString(encBase64);
  console.log(hash2);

  if (hash2 !== user.hash) {
    res.json({ message: "Wrong password" });
  } else {
    res.json({
      _id: user._id,
      token: user.token,
      account: user.account,
    });
  }
});

module.exports = router;
