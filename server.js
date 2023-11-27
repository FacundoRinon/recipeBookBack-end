require("dotenv").config();
const express = require("express");
const cors = require("cors");
const methodOverride = require("method-override");
const path = require("path");

const sessions = require("./sessions");
const passport = require("./passport");
const routes = require("./routes");

const APP_PORT = process.env.APP_PORT || 3000;
const app = express();

const corsOptions = {
  origin: "https://recipebookproject.vercel.app/",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

routes(app);
sessions(app);
passport(app);

app.listen(APP_PORT, () => {
  console.log(`\n[Express] Servidor corriendo en el puerto ${APP_PORT}`);
  console.log(`[Express] Ingresar a http://localhost:${APP_PORT}.\n`);
});

process.on("SIGINT", function () {
  const { mongoose } = require("./db");
  mongoose.connection.close(function () {
    console.log("Mongoose default connection is disconnected due to application termination.\n");
    process.exit(0);
  });
});
