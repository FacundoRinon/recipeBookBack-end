require("dotenv").config();

async function runAllSeeders() {
  await require("./userSeeder")();

  console.log("[Database] ¡Los datos de prueba fueron insertados!");
  process.exit();
}

runAllSeeders();
