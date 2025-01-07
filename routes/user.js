const express = require("express");

const router = express.Router();

const User = require("../Models/User");

const Movies = require("../Models/Movies");

const uid2 = require("uid2");

const SHA256 = require("crypto-js/sha256");

const fileUpload = require("express-fileupload");

const encBase64 = require("crypto-js/enc-base64");

const cloudinary = require("cloudinary").v2;

const isAuthenticated = require("../middleware/isAuthenticated");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const convertToBase64 = require("../utils/convertTobase64");
const Movie = require("../Models/Movies");

router.post("/signup", fileUpload(), async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: "Parametters missing" });
    }

    const isUserExist = await User.findOne({ email: email });
    if (isUserExist) {
      return res.status(400).json({ message: "email already used" });
    }
    const salt = uid2(24);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(34);

    const newUser = new User({
      email: email,
      username: username,
      token: token,
      hash: hash,
      salt: salt,
    });

    if (req.files) {
      const convertedImage = convertToBase64(req.files.image);
      const image = await cloudinary.uploader.upload(convertedImage, {
        folder: `MoviesTrack/user/${newUser._id}`,
      });
      newUser.avatar = {
        secure_url: image.secure_url,
        public_id: image.public_id,
      };
    }
    await newUser.save();

    res.status(200).json({
      _id: newUser._id,
      token: newUser.token,
      username: newUser.username,
      avatar: newUser.avatar,
      email: email,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log(req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Parametters missing" });
    }

    const userDetails = await User.findOne({ email: email });

    if (!userDetails) {
      return res.status(404).json({ error: "Email address unknown" });
    }
    const { salt, token, hash, _id, username, avatar } = userDetails;

    const hashTest = SHA256(password + salt).toString(encBase64);

    if (hashTest !== hash) {
      return res.status(404).json({ message: "wrong parameters" });
    }

    res.status(200).json({
      _id: _id,
      token: token,
      username: username,
      avatar: avatar,
      email: email,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.put("/update", isAuthenticated, fileUpload(), async (req, res) => {
  try {
    const { password, username, email } = req.body;
    const user = await User.findById(req.body.user);

    if (req.files) {
      const convertedImage = convertToBase64(req.files.image);
      const image = await cloudinary.uploader.upload(convertedImage, {
        folder: `Rememeber/user/${user._id}`,
      });
      user.avatar = {
        secure_url: image.secure_url,
        public_id: image.public_id,
      };
    }
    if (password) {
      const newhash = SHA256(password + user.salt).toString(encBase64);
      user.hash = newhash;
    }
    if (username) {
      user.username = username;
    }
    if (email) {
      const isEmailExist = await User.findOne({ email: email });
      if (isEmailExist) {
        return res.status(401).json({ message: "email already used" });
      } else {
        user.email = email;
      }
    }
    await user.save();
    res.status(201).json({
      _id: user._id,
      token: user.token,
      username: user.username,
      avatar: user.avatar,
      email: user.email,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.delete("/deleteUser", isAuthenticated, async (req, res) => {
  try {
    const userToDelete = await User.findByIdAndDelete(req.body.user);
    res.status(201).json({ message: "profile deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.put("/addMovie", isAuthenticated, async (req, res) => {
  try {
    const {
      movie: {
        title_fr,
        original_title,
        release_date,
        genre,
        overview,
        poster,
      },
      list,
      comment,
      asset,
    } = req.body;

    let id = "";
    const movieInDb = await Movies.findOne({ original_title: original_title });
    if (movieInDb) {
      id = movieInDb._id;
    } else {
      const newMovie = new Movie({
        title_fr: title_fr,
        original_title: original_title,
        release_date: release_date,
        Genre: genre,
        overview: overview,
        Poster: poster,
      });
      await newMovie.save();
      id = newMovie._id;
    }
    const user = await User.findById(req.body.user);

    user[list].push({ movie: id, comment: comment, asset: asset });

    if (list === "Seen") {
      const tab = [];
      for (let i = 0; i < user.toSee; i++) {
        if (user.toSee[i].movie !== id) {
          tab.push(user.toSee[i]);
        }
      }
      user.toSee = tab;
    }

    await user.save();
  } catch (error) {
    console.log(error);
  }
});

router.get("/getUserList", isAuthenticated, async (req, res) => {
  try {
    const { list } = req.body; //    toSee, Seen, Fav

    const user = await User.findById(req.body.user).populate(list);
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
