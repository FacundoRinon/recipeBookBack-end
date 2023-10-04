const { mongoose } = require("../db");
const Schema = mongoose.Schema;

const recipesSchema = new Schema(
  {
    content: {
      type: String,
      maxLength: 500,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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
