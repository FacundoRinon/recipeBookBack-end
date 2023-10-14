const User = require("../models/User");
const Recipes = require("../models/Recipes");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");

async function login(req, res) {
  try {
    const username = await User.findOne({ username: req.body.username });
    const email = await User.findOne({ email: req.body.username });
    let user;

    if (username) {
      user = username;
    } else if (email) {
      user = email;
    }

    if (!user) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const populatedUser = await User.populate(user, [
      {
        path: "recipes",
        populate: {
          path: "author",
          model: "User",
          select: "id firstname lastname username email avatar",
        },
        options: { sort: { createdAt: -1 } },
      },
      {
        path: "cookingBook",
        populate: {
          path: "author",
          model: "User",
          select: "id firstname lastname username email avatar",
        },
        options: { sort: { createdAt: -1 } },
      },
    ]);

    if (!(await bcrypt.compare(req.body.password, populatedUser.password))) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign({ id: populatedUser._id }, process.env.SESSION_SECRET);
    return res.json({
      token,
      id: populatedUser._id,
      firstname: populatedUser.firstname,
      lastname: populatedUser.lastname,
      username: populatedUser.username,
      email: populatedUser.email,
      avatar: populatedUser.avatar,
      following: populatedUser.following,
      followers: populatedUser.followers,
      recipes: populatedUser.recipes,
      cookingBook: populatedUser.cookingBook,
    });
  } catch (error) {
    console.error("Error en el login:", error);
    return res.status(500).json({ error: "Error en el login" });
  }
}

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
        cookingBook: [],
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
        cookingBook: user.cookingBook,
      });
    }
  } else {
    return res.json("Passwords do not match");
  }
}

async function edit(req, res) {}

async function update(req, res) {}

async function follows(req, res) {
  try {
    const followed = await User.findById(req.params.id);
    const user = await User.findById(req.auth.id);
    if (followed.followers.includes(req.auth.id)) {
      followed.followers.pull(req.auth.id);
      user.following.pull(req.params.id);
    } else {
      followed.followers.push(req.auth.id);
      user.following.push(req.params.id);
    }
    await followed.save();
    await user.save();
    res.status(200).json({ message: "toggle follow successfull" });
  } catch (error) {
    console.log("recipeController-follows", error);
  }
}

async function addToBook(req, res) {
  try {
    const recipe = await Recipes.findById(req.params.id);
    const user = await User.findById(req.auth.id);

    if (user.cookingBook.includes(recipe._id)) {
      user.cookingBook.pull(recipe._id);
      recipe.added.pull(user._id);
    } else {
      user.cookingBook.push(recipe._id);
      recipe.added.push(user._id);
    }
    await user.save();
    await recipe.save();
  } catch (error) {
    console.log("error in userController - addtoBook", error);
  }
}

async function destroy(req, res) {}

module.exports = {
  login,
  index,
  show,
  create,
  store,
  edit,
  update,
  follows,
  addToBook,
  destroy,
};
