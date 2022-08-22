import API from "@hackmd/api";
import { Note } from "@hackmd/api/dist/type";

import fs from "fs";
import path from "path";

import { StyleMeta } from "../types/styleMeta";

export function generateNoteContent(style: string, meta: StyleMeta) {
  const {
    metadata: {
      description = `${meta.slug} theme`,
      name = meta.slug,
      tags = ["theme"],
    } = {},
  } = meta;

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
  const meta = JSON.parse(
    fs.readFileSync(path.resolve(filePath, "../meta.json"), "utf8")
  ) as StyleMeta;

  if (!meta.slug || !meta.slug.length) {
    throw new Error("Missing slug in metadata");
  }

  if (!meta.metadata) {
    console.warn("Missing style metadata");
  }

  return meta;
}
