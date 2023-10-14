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
