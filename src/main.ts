import express from "express";
import TUAA from "tuaa-api";

const app = express();
const tuaa = new TUAA();

app.set("view engine", "ejs");

app.get("/", async(req, res) => {
  const seasons = await tuaa.v2.metadata.all();
  const currentSeasonIndex = parseInt(req.query.season?.toString?.() || "1");

  res.render("home", {
    seasonCount: seasons.length,
    currentSeasonIndex,
    episodes: seasons[currentSeasonIndex]
  });
});

app.listen(4269);
