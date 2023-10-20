const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Offer = require("../models/Offer");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const isAuthenticated = require("../middlewares/isAuthenticated");

cloudinary.config({
  cloud_name: "dnbtkdwub",
  api_key: "397527211794692",
  api_secret: "kqdlInTjO5XkAR0yywOoG6GCG5A",
});

// fonction pour convertir un buffer en base64
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

const uid2 = require("uid2"); // package qui sert à créer des string aléatoires
const SHA256 = require("crypto-js/sha256"); // sert à encripter une string
const encBase64 = require("crypto-js/enc-base64"); // sert à transformer l'encryptage en string

// ROUTE POST POUR POSTER UNE ANNONCE

router.post(
  "/offer/publish",
  fileUpload(),
  isAuthenticated,
  async (req, res) => {
    try {
      // console.log(req.body.title);
      // console.log(req.body.description);
      // console.log(req.body.price), console.log(req.body.brand);
      // console.log(req.body.size);
      // console.log(req.files);
      console.log(req.user);

      const newOffer = new Offer({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          { brand: req.body.brand },
          { size: req.body.size },
          { condition: req.body.condition },
          { color: req.body.color },
          { city: req.body.city },
        ],
        product_image: req.files.picture,
        owner: req.user,
      });

      await newOffer.save();
      //   await newOffer.populate("owner", "account _id");
      // const newOfferPopulate = newOffer.populate("owner");
      // await newOfferPopulate.save();

      console.log(newOffer);
      // console.log(newOfferPopulate);

      convertToBase64(req.files.picture);
      const pictureToUpload = req.files.picture;
      // on envoie à Cloudinary un buffer converti en base64
      const result = await cloudinary.uploader.upload(
        convertToBase64(pictureToUpload)
      );
      return res.json(result);
      res.json("route pour poster une annonce");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ROUTE GET POUR CONSULTER LES OFFRES

router.get("/offers", async (req, res) => {
  try {
    const querys = req.query;
    console.log(req.query);

    const { title, priceMin, priceMax, sort, page } = req.query;
    console.log(title);
    console.log(priceMin);
    console.log(priceMax);
    console.log(sort);
    console.log(page);

    let defaultTitle = "";
    let defaultPriceMin = 0;
    let defaultPriceMax = 1000000;
    let defaultPage = 1;
    let defaultLimit = 3;
    let defaultSort = "";

    if (title) {
      defaultTitle = title;
    }

    if (priceMin) {
      defaultPriceMin = priceMin;
    }

    if (priceMax) {
      defaultPriceMax = priceMax;
    }

    if (page) {
      defaultPage = page;
    }

    let skip = (defaultPage - 1) * defaultLimit;
    console.log(skip);

    if (sort === "price-asc") {
      defaultSort = "asc";
    } else if (sort === "price-desc") {
      defaultSort = "desc";
    }

    const offers = await Offer.find({
      product_name: new RegExp(defaultTitle, "i"),
      product_price: { $gte: defaultPriceMin, $lte: defaultPriceMax },
    })
      .limit(defaultLimit)
      .skip(skip)
      .sort({ product_price: defaultSort })
      .select("product_name product_price product_details");

    // console.log(offers);
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ROUTE GET POUR RÉCUPÉRER LES DÉTAILS CONCERNANT UNE ANNONCE EN FONCTION DE SON ID

router.get("/offers/:id", async (req, res) => {
  try {
    console.log(req.params);
    const offerDetail = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );

    res.json(offerDetail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
