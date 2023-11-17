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

async function show(req, res) {
  const recipe = await Recipes.findById(req.params.id);
  const populatedRecipe = await Recipes.populate(recipe, [
    {
      path: "author",
      select: "id firstname lastname username email avatar",
    },
  ]);
  return res.json(recipe);
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
    const { name, description, category, instructions } = fields;
    const ingredients = JSON.parse(fields.ingredients);

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
  console.log(req.params.id);
  try {
    const id = req.params.id;
    const form = formidable({
      multiples: false,
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      let avatarFileName = null;
      if (files.avatar) {
        const ext = path.extname(files.avatar.name);
        avatarFileName = `image_${Date.now()}${ext}`;

        const { data, error } = await supabase.storage
          .from("recipe")
          .upload(avatarFileName, fs.createReadStream(files.avatar.path), {
            cacheControl: "3600",
            upsert: false,
            contentType: files.avatar.type,
            duplex: "half",
          });

        if (error) {
          return res.status(500).json({ error: error.message });
        }
      }

      const { name, category, description, ingredients, instructions } = fields;
      const values = {
        name,
        category,
        description,
        ingredients,
        instructions,
      };

      if (avatarFileName) {
        values.avatar = avatarFileName;
      }

      const updatedValues = {
        $set: values,
      };

      try {
        const response = await Recipes.findOneAndUpdate({ _id: id }, updatedValues, { new: true });
        return res.json({
          id: response._id,
          name: response.name,
          category: response.category,
          description: response.description,
          ingredients: response.ingredients,
          instructions: response.instructions,
          avatar: response.avatar,
        });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    });
  } catch (error) {
    console.log("rompio");
  }
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
  show,
  create,
  store,
  edit,
  update,
  destroy,
};
