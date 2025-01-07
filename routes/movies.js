const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/movies/pop", async (req, res) => {
  try {
    const { page } = req.query;
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/popular?api_key=${
        process.env.TMDB_API_KEY
      }&language=fr&page=${page || 1}`
    );
    res.status(201).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.response);
  }
});

router.get("/movies/playing", async (req, res) => {
  try {
    const { page } = req.query;
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/now_playing?api_key=${
        process.env.TMDB_API_KEY
      }&language=fr&page=${page || 1}`
    );
    res.status(201).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.response);
  }
});

router.get("/movies/upComing", async (req, res) => {
  try {
    const { page } = req.query;
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/upcoming?api_key=${
        process.env.TMDB_API_KEY
      }&language=fr&page=${page || 1}`
    );
    res.status(201).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.response);
  }
});

router.get("/movies/categories", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}&language=fr`
    );
    res.status(201).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.response);
  }
});

router.get("/movies/categories/:id", async (req, res) => {
  const { id } = req.params;
  const { page, search } = req.query;
  if (!search) {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${
          process.env.TMDB_API_KEY
        }&language=fr&with_genres=${id}&page=${page || 1}`
      );
      res.status(201).json(response.data);
    } catch (error) {
      console.log(error);
      res.status(500).json(error.response);
    }
  } else {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/search/movie?api_key=${
          process.env.TMDB_API_KEY
        }&language=fr&&query=${search}&with_genres=${id}&page=${page || 1}`
      );
      res.status(201).json(response.data);
    } catch (error) {
      console.log(error);
      res.status(500).json(error.response);
    }
  }

  //https://image.tmdb.org/t/p/w500+poster_path
});

router.get("/movies/search", async (req, res) => {
  try {
    const { search, page } = req.query;
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${
        process.env.TMDB_API_KEY
      }&language=fr&query=${search}&page=${page || 1}`
    );
    res.status(201).json(response.data);

    //https://image.tmdb.org/t/p/w500+poster_path
  } catch (error) {
    console.log(error);
    res.status(500).json(error.response);
  }
});

router.get("/movies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&language=fr`
    );
    res.status(201).json(response.data);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
