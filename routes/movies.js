const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/movies/pop", async (req, res) => {
  try {
    const { page } = req.query;
    console.log("PAGE", page, req.query);
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/popular?language=fr&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB}`,
        },
      }
    );
    res.status(201).json(response.data);
  } catch (error) {
    console.log(error.response);
    res.status(500).json(error.response.data);
  }
});

router.get("/movies/playing", async (req, res) => {
  try {
    const { page } = req.query;
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/now_playing?&language=fr&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB}`,
        },
      }
    );
    res.status(201).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.response.data);
  }
});

router.get("/movies/upComing", async (req, res) => {
  try {
    const { page } = req.query;
    const date = new Date();
    const monthNow = date.getMonth() + 1;
    const yearNow = date.getFullYear();
    const dayNow = date.getDate();
    const month = dayNow > 15 ? (monthNow !== 12 ? monthNow + 1 : 1) : monthNow;
    const day = dayNow < 15 ? 15 : "01";
    const year = dayNow > 15 && monthNow === 12 ? yearNow + 1 : yearNow;
    const dateToSend = `${year}-${month < 10 ? "0" + month : month}-${day}`;

    const response = await axios.get(
      `https://api.themoviedb.org/3/discover/movie?language=fr-FR&primary_release_date.gte=${dateToSend}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB}`,
        },
      }
    );
    res.status(201).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.response.data);
  }
});

router.get("/movies/categories", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/genre/movie/list?language=fr`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB}`,
        },
      }
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
        `https://api.themoviedb.org/3/discover/movie?language=fr&with_genres=${id}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TMDB}`,
          },
        }
      );
      res.status(201).json(response.data);
    } catch (error) {
      console.log(error);
      res.status(500).json(error.response);
    }
  } else {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/search/movie?language=fr&with_genres=${id}&query=${search}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TMDB}`,
          },
        }
      );
      res.status(201).json(response.data);
    } catch (error) {
      console.log(error);
      res.status(500).json(error.response);
    }
  }
});

router.get("/movies/search", async (req, res) => {
  try {
    const { search, page } = req.query;
    console.log(req.query);

    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?language=fr&query=${search}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB}`,
        },
      }
    );
    res.status(201).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.response);
  }
});

router.get("/movies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}?language=fr`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB}`,
        },
      }
    );
    res.status(201).json(response.data);
  } catch (error) {
    console.log(error.response);
  }
});

module.exports = router;
