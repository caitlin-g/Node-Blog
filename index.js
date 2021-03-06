const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const helmet = require("helmet");

const port = 9000;

const userDb = require("./data/helpers/userDb.js");
const postDb = require("./data/helpers/postDb.js");

const server = express();

//=============== MIDDLEWARE =============== //

const allCaps = (req, res, next) => {
  Object.assign(req.body, { name: req.body.name.toUpperCase() });
  next();
};

server.use(logger("tiny"), cors(), helmet(), express.json());

//=============== USER ENDPOINTS =============== //

//Get all users
server.get("/api/users", (req, res) => {
  userDb
    .get()
    .then(users => {
      res.json(users);
    })
    .catch(err =>
      res.status(500).json({
        error: "The users information could not be retrieved."
      })
    );
});

//Get posts of a specific user
server.get("/api/users/:id/posts", (req, res) => {
  userDb
    .getUserPosts(req.params.id)
    .then(user => {
      if (user.length > 0) {
        res.json(user);
      } else
        res.status(404).json({
          message: "The user with the specified ID does not exist."
        });
    })
    .catch(err =>
      res
        .status(500)
        .json({ error: "The user information could not be retrieved." })
    );
});

//Add a new User
server.post("/api/users", allCaps, (req, res) => {
  const newUser = req.body;
  if (newUser.name.length > 128) {
    return res.status(411).json({
      message: " The username must be under 129 characters."
    });
  }
  userDb
    .insert(newUser)
    .then(user => {
      res.status(201).json({ user, message: `User was added successfully!` });
    })
    .catch(err => {
      res.status(500).json({
        error: "There was an error while saving the user to the database."
      });
    });
});

//delete a user
server.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  userDb
    .remove(id)
    .then(user => {
      if (user.length < 1) {
        res.status(404).json({
          message: "The user with the specified ID does not exist."
        });
      } else {
        res
          .status(200)
          .json({ user, message: "The user was deleted successfully!" });
      }
    })
    .catch(err =>
      res.status(500).json({
        error: "The user could not be removed."
      })
    );
});

//Update a user
server.put("/api/users/:id", allCaps, (req, res) => {
  const { id } = req.params;
  const newUser = req.body;
  userDb
    .update(id, newUser)
    .then(user => {
      if (user.length < 1) {
        res.status(404).json({
          message: "The user with the specified ID does not exist."
        });
      } else {
        res
          .status(200)
          .json({ user, message: "The user was successfully updated!" });
      }
    })
    .catch(err =>
      res.status(500).json({
        error: "The user information could not be modified.."
      })
    );
});

//=============== POST ENDPOINTS =============== //

//Get all posts
server.get("/api/posts", (req, res) => {
  postDb
    .get()
    .then(post => {
      res.json(post);
    })
    .catch(err =>
      res.status(500).json({
        error: "The post information could not be retrieved."
      })
    );
});

//Add a new post
server.post("/api/posts/", (req, res) => {
  const { text, userId } = req.body;
  const newPost = { text, userId };
  if (!text || !userId) {
    return res.status(400).json({ error: "Please provide text to your post." });
  }
  postDb
    .insert(newPost)
    .then(post => {
      res.status(201).json(post);
    })
    .catch(err => {
      res.status(500).json({
        error: "There was an error saving your post."
      });
    });
});

//Delete a post
server.delete("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  postDb
    .remove(id)
    .then(post => {
      if (post.length < 1) {
        res.status(404).json({
          message: "The post with that ID does not exist."
        });
      } else {
        res.status(200).json(post);
      }
    })
    .catch(err =>
      res.status(500).json({
        error: "The post could not be removed."
      })
    );
});

//Update a post
server.put("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  const { text, userId } = req.body;
  const newPost = { text, userId };
  if (!text || !userId) {
    return res
      .status(400)
      .json({ error: "Please provide a userId and text for the post." });
  }
  postDb
    .update(id, newPost)
    .then(post => {
      if (post.length < 1) {
        res.status(404).json({
          message: "The post with the specified ID does not exist."
        });
      } else {
        res.status(200).json(post);
      }
    })
    .catch(err =>
      res.status(500).json({
        error: "The post information could not be modified.."
      })
    );
});

// call server.listen w/ a port of your choosing
server.listen(port, () => {
  console.log(`\n === API running on port ${port} ===\n`);
});
