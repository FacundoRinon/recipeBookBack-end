const { mongoose } = require("../db");
const Schema = mongoose.Schema;

const recipesSchema = new Schema(
  {
    name: String,
    description: {
      type: String,
      maxLength: 500,
    },
    avatar: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    ingredients: [
      {
        ingredient: String,
        cuantity: String,
      },
    ],
    instructions: String,
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    added: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    category: String,
    // comment: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "User"
    //   },
    // ],
  },
  { timestamps: true },
);

recipeSchemaSchema.methods.toJSON = function () {
  const recipes = this.toObject();
  recipes.id = recipes._id.toString();
  delete recipes._id;
  return recipes;
};

const Recipes = mongoose.model("Recipes", recipesSchema);

module.exports = Recipes;
