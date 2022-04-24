import express from "express";
import TUAA, { LimitedUser } from "tuaa-api";
import { resolve } from "path";
import moment from "moment";

const app = express();
const tuaa = new TUAA();

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  const seasons = await tuaa.v2.metadata.all();
  const currentSeasonIndex = parseInt(req.query.season?.toString?.() || "1");

  res.render("home", {
    seasonCount: seasons.length,
    currentSeasonIndex,
    episodes: seasons[currentSeasonIndex],
    moment,
  });
});

app.get("/watch/:video", async (req, res) => {
  const userInfo: IUserInfo = JSON.parse(req.cookies?.user ?? "{}");

  const watchCode = req.params.video;
  const episode = await tuaa.v2.metadata.episode(watchCode);
  const comments = await tuaa.v2.comments.get(watchCode, 0, 1000);
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
    videoUrl,
    comments,
    userInfo,
    moment,
  });
});

app.get("*", (req, res) => {
  res.sendFile(resolve(`${__dirname}/../errors/404.html`));
});

app.listen(4269, () => {
  console.log("Started");
});

interface IUserInfo {
  loginKey: string;
  user: LimitedUser;
}
