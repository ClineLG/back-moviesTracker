const mongoose = require("mongoose");

const Movie = mongoose.model("Movie", {
  title_fr: String,
  original_title: String,
  release_date: String,
  Genre: String,
  overview: String,
  Poster: String,
});
module.exports = Movie;
