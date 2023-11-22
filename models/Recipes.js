const { mongoose } = require("../db");
const Schema = mongoose.Schema;

const recipeSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
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
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: String,
          required: true,
        },
      },
    ],
    instructions: [
      {
        type: String,
      },
    ],
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
    score: [
      {
        userId: {
          type: String,
          required: true,
        },
        score: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

recipeSchema.methods.toJSON = function () {
  const recipes = this.toObject();
  recipes.id = recipes._id.toString();
  delete recipes._id;
  return recipes;
};

const Recipes = mongoose.model("Recipes", recipeSchema);

module.exports = Recipes;
