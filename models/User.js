const { mongoose } = require("../db");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
  {
    firstname: String,
    lastname: String,
    username: { type: String, require: true },
    password: { type: String, require: true },
    email: { type: String, require: true },
    avatar: String,
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdAt: Date,
    updatedAt: Date,
    recipes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
  },
  { timestamps: true },
);

userSchema.method.comparePassword = async function comparePassword(password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 8);
  next();
});

userSchema.pre("insertMany", async function (next, users) {
  for (const user of users) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.method.toJSON = function () {
  const user = this.toObject();
  user.id = user._id.toString();
  delete user.password;
  delete user._id;
  return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
