import gulp, { src, watch, dest, series } from "gulp";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import through2 from "through2";
import fs from "fs";
import path from "path";
const sass = gulpSass(dartSass);

import hackmdConfig from "./hackmd.config";
import { StyleMeta } from "./types/styleMeta";

const { api, workspaceTeamPath } = hackmdConfig;

function generateNoteContent(style: string, meta: StyleMeta) {
  const {
    metadata: {
      description = `${meta.slug} theme`,
      name = meta.slug,
      tags = "theme",
    } = {},
  } = meta;

  return `---
title: ${name}
description: ${description}
tags: ${tags}
---

<style>
${style}
</style>
`;
}

export async function buildStyles() {
  const teamNotes = await api.getTeamNotes(workspaceTeamPath);

  const notesByPermalink = teamNotes.reduce(
    (acc, note) => ({
      ...acc,
      [note.permalink]: note,
    }),
    {}
  );

  return src("src/**/style.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(
      through2.obj(async function (file, enc, cb) {
        const { contents, path: filePath } = file;

        const meta = JSON.parse(
          fs.readFileSync(path.resolve(filePath, "../meta.json"), "utf8")
        ) as StyleMeta;

        if (!meta.slug || !meta.slug.length) {
          throw new Error("Missing slug in metadata");
        }

        if (!meta.metadata) {
          console.warn("Missing style metadata");
        }

        const note = notesByPermalink[meta.slug];
        const contentToUpdate = generateNoteContent(contents.toString(), meta);
        if (note) {
          await api.updateTeamNote(workspaceTeamPath, note.id, {
            content: contentToUpdate,
          });
        } else {
          await api.createTeamNote(workspaceTeamPath, {
            content: contentToUpdate,
            permalink: meta.slug,
          });
        }

        cb(null, file);
      })
    );
}

export async function checkConfig() {
  const teams = await api.getTeams();

  if (!teams.find((team) => team.path === workspaceTeamPath)) {
    throw new Error(`Team with path ${workspaceTeamPath} not found`);
  }
}

gulp.task("build", series(checkConfig, buildStyles));
