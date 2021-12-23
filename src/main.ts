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

app.get("/watch/:video", async(req, res) => {
  const watchCode = req.params.video;
  const episode = await tuaa.v2.metadata.episode(watchCode);
  let resolution: string;
  let videoUrl: string;

  if (episode.sources) {
    var videoHighestRes: string;

    let lastHighestRes = 0;
    let lastHighestResIndex: number;
    for (let i = 0; i < episode.sources.length; i++) {
      if (episode.sources[i].size > lastHighestRes) {
        lastHighestRes = episode.sources[i].size;
        lastHighestResIndex = i;
      }
    }
  
    videoHighestRes = lastHighestRes.toString();
  
    resolution = <string>req.query.res ?? videoHighestRes;
  
    let resolutionExists = false;
    for (var i = 0; i < episode.sources.length; i++) {
      if (resolution === episode.sources[i].size.toString()) {
        resolutionExists = true;
        break;
      }
    }
  
    if (!resolutionExists) {
      resolution = videoHighestRes;
    }

    //Find video url for wanted resolution
    for (var i = 0; i < episode.sources.length; i++) {
      if (resolution === episode.sources[i].size.toString()) {
        videoUrl = episode.sources[i].src;
        break;
      }
    }
  } else {
    resolution = "noresolutions";
    videoUrl = episode.video;
  }

  res.render("watch", {
    episode,
    resolution,
    videoUrl
  });
});

app.listen(4269);
