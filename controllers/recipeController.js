const Recipes = require("../models/Recipes");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

if (!process.env.SUPABASE_URL) {
  throw new error("SupabaseURL miss");
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
  auth: { persistSession: false },
});

async function index(req, res) {
  try {
    const recipes = await Recipes.find().populate("author").sort({ createdAt: -1 });
    return res.json({ recipes });
  } catch (error) {
    return res.status(500).json({ message: "Error occurred in the request" });
  }
}

async function category(req, res) {
  const requestedCategory = req.params.category;
  console.log(req.params);
  let filteredRecipes;
  if (req.params.category === "None") {
    const categoryRecipes = await Recipes.find().populate("author").sort({ createdAt: -1 });

    filteredRecipes = categoryRecipes;
  } else {
    const categoryRecipes = await Recipes.find({ category: requestedCategory })
      .populate("author")
      .sort({ createdAt: -1 });

    filteredRecipes = categoryRecipes;
  }

  if (req.params.score && req.params.score !== "0") {
    const minScore = parseInt(req.params.score);

    filteredRecipes = filteredRecipes.filter((recipe) => {
      if (recipe.score.length > 0) {
        const totalScore = recipe.score.reduce((sum, score) => sum + score.score, 0);
        const avgScore = totalScore / recipe.score.length;

        return avgScore >= minScore;
      } else {
        return false;
      }
    });
  }
  if (req.params.votes && req.params.votes !== "0") {
    const minVotes = parseInt(req.params.votes);
    filteredRecipes = filteredRecipes.filter((recipe) => recipe.score.length >= minVotes);
  }
  return res.json(filteredRecipes);
}

async function show(req, res) {
  const recipe = await Recipes.findById(req.params.id);
  const populatedRecipe = await Recipes.populate(recipe, [
    {
      path: "author",
      select: "id firstname lastname username email avatar score",
    },
  ]);
  return res.json(populatedRecipe);
}

async function create(req, res) {}

async function store(req, res) {
  try {
    const form = formidable({
      multiples: true,
      keepExtensions: true,
    });

    const filesPromise = new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          reject(err);
        } else if (files.avatar) {
          const ext = path.extname(files.avatar.filepath);
          const newFileName = `image_${Date.now()}${ext}`;
          const avatarFileName = newFileName;

          const { data, error } = await supabase.storage
            .from("recipe")
            .upload(avatarFileName, fs.createReadStream(files.avatar.filepath), {
              cacheControl: "3600",
              upsert: false,
              contentType: files.avatar.mimetype,
              duplex: "half",
            });
          resolve({ fields, files, avatarFileName });
        } else {
          const avatarFileName = "nullRecipeAvatar.jpg";
          resolve({ fields, files, avatarFileName });
        }
      });
    });
    const { fields, files, avatarFileName } = await filesPromise;
    const { name, description, category } = fields;
    const ingredients = JSON.parse(fields.ingredients);
    const instructions = JSON.parse(fields.instructions);

    if (files.avatar && files.avatar.newFileName > 0) {
      avatar = files.avatar.newFileName;
    }

    const newRecipe = new Recipes({
      author: req.auth.id,
      name,
      description,
      category,
      ingredients,
      instructions,
      avatar: avatarFileName,
      score: [],
    });

    await newRecipe.save();
    await newRecipe.populate("author");

    const user = await User.findById(req.auth.id);
    user.recipes.push(newRecipe._id);
    await user.save();

    return res.json({
      newRecipe,
      user,
    });
  } catch (error) {
    console.log("Error en el registro: ", error);
    return res.status(500).json({ error: "Error en el registro" });
  }
}

async function edit(req, res) {}

async function update(req, res) {
  const recipeId = req.params.id;
  const { name, description, category } = req.body;
  const ingredients = JSON.parse(req.body.ingredients);
  const instructions = JSON.parse(req.body.instructions);

  try {
    const recipe = await Recipes.findById(recipeId);

    if (!recipe) {
      return res.status(404).send("Receta no encontrada");
    }

    if (recipe.author.toString() !== req.auth.id) {
      return res.status(403).send("No tienes permisos para actualizar esta receta");
    }
    recipe.name = name || recipe.name;
    recipe.description = description || recipe.description;
    recipe.category = category || recipe.category;
    recipe.ingredients = ingredients || recipe.ingredients;
    recipe.instructions = instructions || recipe.instructions;

    await recipe.save();

    res.status(200).send("Receta actualizada correctamente");
  } catch (error) {
    console.error("Error al actualizar la receta:", error);
    res.status(500).send("Error al actualizar la receta");
  }
}

async function rate(req, res) {
  const recipe = await Recipes.findById(req.params.id);
  if (!recipe) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  const newScore = req.body;
  const existingScoreIndex = recipe.score.findIndex((s) => s.userId === newScore.userId);

  if (existingScoreIndex !== -1) {
    recipe.score[existingScoreIndex] = newScore;
  } else {
    recipe.score.push(newScore);
  }
  await recipe.save();
  return res.json(recipe);
}

async function destroy(req, res) {
  try {
    const recipe = await Recipes.findById(req.params.id);
    if (!recipe) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (recipe.author.toString() !== req.auth.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Recipes.deleteOne({ _id: req.params.id });

    const user = await User.findById(req.auth.id);
    user.recipes.pull(req.params.id);
    await user.save();
    res.json(user);
  } catch (error) {
    console.log("recipeController-destroy", error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  index,
  category,
  show,
  create,
  store,
  edit,
  update,
  rate,
  destroy,
};
