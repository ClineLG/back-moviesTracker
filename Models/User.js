const mongoose = require("mongoose");

// const MovieUser = new mongoose.Schema({
//   movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
//   comment: { type: String },
//   asset: { type: String },
// });

const User =
  mongoose.models.UserApp ||
  mongoose.model("UserApp", {
    email: { type: String, unique: true },
    username: { type: String, required: true },
    avatar: { type: Object },
    token: { type: String },
    hash: { type: String },
    salt: { type: String },
    fav: [
      {
        movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
        comment: { type: String },
        asset: { type: String },
      },
    ],
  });

module.exports = User;
//    fav: [
//   {
//     asset: [
//       { type: String },
//       {
//         movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
//         comment: { type: String },
//       },
//     ],
//   },
// ],
