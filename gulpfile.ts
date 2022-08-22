import gulp, { src, series } from "gulp";
import dartSass from "sass";
import gulpSass from "gulp-sass";

import hackmdConfig from "./hackmd.config";
import { getNotesMapByPermalink } from "./lib/noteHelper";
import gulpPlugin from "./lib/gulpPlugin";

const sass = gulpSass(dartSass);
const { api, workspaceTeamPath } = hackmdConfig;

export async function buildStyles() {
  const notesByPermalink = await getNotesMapByPermalink(api, workspaceTeamPath);

  return src("src/**/style.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulpPlugin({ api, notesByPermalink, teamPath: workspaceTeamPath }));
}

export async function checkConfig() {
  const teams = await api.getTeams();

  if (!teams.find((team) => team.path === workspaceTeamPath)) {
    throw new Error(`Team with path ${workspaceTeamPath} not found`);
  }
}

gulp.task("build", series(checkConfig, buildStyles));
