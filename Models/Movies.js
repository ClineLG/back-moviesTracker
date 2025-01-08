const mongoose = require("mongoose");

const Movie = mongoose.model("Movie", {
  title_fr: String,
  original_title: String,
  release_date: String,
  Genre: String,
  runtime: String,
  overview: String,
  budget: String,
  revenue: String,
  production_companies: String,
  Poster: String,
});
module.exports = Movie;
