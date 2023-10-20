require("dotenv").config(); // Permet d'activer les variables d'environnement qui se trouvent dans le fichier `.env`

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const uid2 = require("uid2"); // package qui sert à créer des string aléatoires
const SHA256 = require("crypto-js/sha256"); // sert à encripter une string
const encBase64 = require("crypto-js/enc-base64"); // sert à transformer l'encryptage en string
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "This route doesn't exist" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
