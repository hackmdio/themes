import API from "@hackmd/api";
import { Note } from "@hackmd/api/dist/type";

import fs from "fs";
import path from "path";

import { StyleMeta } from "../types/styleMeta";

export function generateNoteContent(
  style: string,
  meta: StyleMeta,
  teamPath: string
) {
  const description = `Use \`{%hackmd @${teamPath}/${
    meta.slug
  } %}\` syntax to include this theme.${
    meta.description ? `\n  ${meta.description}` : ""
  }`;
  const name = `HackMD Theme - ${meta.name}`;
  const tags = ["HackMD-Theme"];

  return `---
title: ${name}
description: ${description}
tags: ${tags.join(", ")}
---

<style>
${style}
</style>
`;
}

export async function getNotesMapByPermalink(api: API, teamPath: string) {
  const teamNotes = await api.getTeamNotes(teamPath);

  return teamNotes.reduce(
    (acc, note) => ({
      ...acc,
      [note.permalink]: note,
    }),
    {} as Record<string, Note>
  );
}

export function loadMetaFromCSS(filePath: string) {
  const metaFilePath = path.resolve(filePath, "../meta.json");

  if (!fs.existsSync(metaFilePath)) {
    return null;
  }

  const meta = JSON.parse(fs.readFileSync(metaFilePath, "utf8")) as StyleMeta;

  if (!meta.slug || !meta.slug.length) {
    throw new Error("Missing slug in metadata");
  }

  if (!meta.name) {
    throw new Error("Missing Theme name");
  }

  return meta;
}
