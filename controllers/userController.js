const User = require("../models/User");
const jwt = require("jsonwebtoken");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");

async function index(req, res) {
  const users = await User.find().sort({ createdAt: -1 });

  return res.json({
    users,
  });
}

async function show(req, res) {}

async function create(req, res) {}

async function store(req, res) {
  const usernameExist = await User.findOne({ username: req.body.username });
  const emailExist = await User.findOne({ email: req.body.email });
  if (req.body.password === req.body.password2) {
    if (usernameExist || emailExist) {
      return res.json("Username or email already exist");
    } else {
      const user = await new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        avatar: "nullAvatar.png",
        following: [],
        followers: [],
        recipes: [],
      });
      await user.save();
      const newUser = true;
      const token = jwt.sign(
        {
          id: user._id,
        },
        process.env.SESSION_SECRET,
      );
      return res.json({
        token,
        newUser,
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        following: user.following,
        followers: user.followers,
        recipes: user.recipes,
      });
    }
  } else {
    return res.json("Passwords do not match");
  }
}

async function edit(req, res) {}

async function update(req, res) {}

async function destroy(req, res) {}

module.exports = {
  index,
  show,
  create,
  store,
  edit,
  update,
  destroy,
};
