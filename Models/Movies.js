const mongoose = require("mongoose");

const Movie = mongoose.model("Movie", {
  title: String,
  original_title: String,
  release_date: String,
  genre: Array,
  runtime: String,
  overview: String,
  budget: String,
  revenue: String,
  production_companies: Array,
  poster: String,
  tagline: String,
});
module.exports = Movie;
