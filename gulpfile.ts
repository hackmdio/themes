import gulp, { src, series, watch } from "gulp";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import postcss from "gulp-postcss";

import hackmdConfig from "./hackmd.config";
import { getNotesMapByPermalink } from "./lib/noteHelper";
import gulpPlugin from "./lib/gulpPlugin";
import { renderThemeTable } from "./lib/themeTable";

const sass = gulpSass(dartSass);
const { api, workspaceTeamPath } = hackmdConfig;

export async function buildStyles() {
  const notesByPermalink = await getNotesMapByPermalink(api, workspaceTeamPath);

  return src("src/**/style.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss())
    .pipe(gulpPlugin({ api, notesByPermalink, teamPath: workspaceTeamPath }));
}

export async function watchStyles() {
  return watch("src/**/style.scss", buildStyles);
}

export async function checkConfig() {
  const teams = await api.getTeams();

  if (!teams.find((team) => team.path === workspaceTeamPath)) {
    throw new Error(`Team with path ${workspaceTeamPath} not found`);
  }
}

export async function listTheme() {
  return renderThemeTable();
}

gulp.task("build", series(checkConfig, buildStyles, listTheme));
gulp.task("dev", series(checkConfig, buildStyles, listTheme, watchStyles));
