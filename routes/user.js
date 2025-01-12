const express = require("express");

const router = express.Router();

const User = require("../Models/User");

const Movies = require("../Models/Movies");

const MovieUser = require("../Models/User");

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
      Fav: newUser.Fav,
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
      return res.status(404).json({ message: "Email address unknown" });
    }
    const { salt, token, hash, _id, username, avatar, Fav } = userDetails;

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
      Fav: Fav,
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

router.delete("/delete", isAuthenticated, async (req, res) => {
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
        title,
        original_title,
        release_date,
        genres,
        overview,
        poster,
        runtime,
        tagline,
        revenue,
        budget,
        production_companies,
      },
      comment,
      asset,
    } = req.body;

    let id = "";
    const movieInDb = await Movies.findOne({ original_title: original_title });
    if (movieInDb) {
      id = movieInDb._id;
    } else {
      const newMovie = new Movie({
        title: title,
        original_title: original_title,
        release_date: release_date,
        genres: genres,
        overview: overview,
        poster: poster,
        runtime: runtime,
        tagline: tagline,
        revenue: revenue,
        budget: budget,
        production_companies: production_companies,
      });
      await newMovie.save();
      id = newMovie._id;
    }
    const user = await User.findById(req.body.user).select("-hash -salt");

    user.fav.push({ movie: id, comment: comment, asset: asset });

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/fav", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.body.user)
      .populate([{ path: "fav", populate: "movie", strictPopulate: false }])
      .select("fav");

    const tab = [];
    if (user.fav.length < 1) {
      res.status(201).json({ message: "pas de collections commencée" });
    } else {
      for (let i = 0; i < user.fav.length; i++) {
        tab.push(user.fav[i].asset);
      }
      tabAsset = [...new Set(tab)];
      const objSort = { results: [], count: tabAsset.length };

      for (let i = 0; i < tabAsset.length; i++) {
        const tabSort = [];
        const objasset = { name: tabAsset[i], movies: [] };
        for (let j = 0; j < user.fav.length; j++) {
          if (user.fav[j].asset === tabAsset[i]) {
            tabSort.push(user.fav[j]);
          }
        }
        objasset.movies.push(tabSort);
        objSort.results.push(objasset);
      }

      //là : {a:[{},{},...],b:[{},{},...],c:[{},{},...]}
      //ideal : {length:3,result:[{name:a[{},{}...]},{b:[{},{}...]},c:{[{},{}...]}]}

      res.status(201).json(objSort);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/favAsset", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.body.user)
      .populate("fav")
      .select("fav");
    const tab = [];
    if (user.fav.length < 1) {
      res.status(201).json(["A regarder plus tard"]);
    } else {
      for (let i = 0; i < user.fav.length; i++) {
        tab.push(user.fav[i].asset);
      }
      tabToSend = [...new Set(tab)];
      res.status(201).json(tabToSend);
      console.log(tabToSend);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/collection/details/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(500).json({ message: "ID needeed" });
    }

    // console.log(id);
    const user = await User.findById(req.body.user)
      .populate([{ path: "fav", populate: "movie", strictPopulate: false }])
      .select("fav");
    const objToSend = {};
    for (let i = 0; i < user.fav.length; i++) {
      console.log("UserId", user.fav[i]._id.toString());
      console.log("id", id);

      if (user.fav[i]._id.toString() === id) {
        objToSend.result = user.fav[i];
        objToSend.index = i;
      }
    }
    // console.log("fav", favToSend);
    if (!objToSend.result) {
      res.status(401).json({ message: "no result found" });
    } else {
      res.status(201).json(objToSend);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.put("/collection/details/:index", isAuthenticated, async (req, res) => {
  try {
    const { index } = req.params;
    if (!index) {
      res.status(500).json({ message: "ID needeed" });
    }
    const { asset, comment } = req.body;
    const user = await User.findById(req.body.user)
      .populate([{ path: "fav", populate: "movie", strictPopulate: false }])
      .select("fav");
    // console.log("User", user);
    if (asset) {
      user.fav[index].asset = asset;
    }
    if (comment) {
      user.fav[index].comment = comment;
    }
    await user.save();
    res.status(201).json(user.fav[index]);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.delete(
  "/collection/details/:index",
  isAuthenticated,
  async (req, res) => {
    try {
      const { index } = req.params;
      if (!index) {
        res.status(500).json({ message: "ID needeed" });
      }
      const user = await User.findById(req.body.user)
        .populate([{ path: "fav", populate: "movie", strictPopulate: false }])
        .select("fav");

      user.fav.splice(index, 1);

      await user.save();
      res.status(201).json(user.fav);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);

router.delete("/collection/:name", isAuthenticated, async (req, res) => {
  try {
    const { name } = req.params;
    if (!name) {
      res.status(500).json({ message: "ID needeed" });
    }
    const user = await User.findById(req.body.user)
      .populate([{ path: "fav", populate: "movie", strictPopulate: false }])
      .select("fav");

    const tab = [];

    for (let i = 0; i < user.fav.length; i++) {
      if (user.fav[i].asset !== name) {
        tab.push(user.fav[i]);
      }
    }
    user.fav = tab;
    await user.save();
    res.status(201).json(user.fav);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/details", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.body.user).select("-hash -salt");
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});
module.exports = router;
