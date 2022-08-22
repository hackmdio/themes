import API from "@hackmd/api";
import { StyleMeta } from "../types/styleMeta";

export function generateNoteContent(style: string, meta: StyleMeta) {
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

export async function getNotesMapByPermalink(api: API, teamPath: string) {
  const teamNotes = await api.getTeamNotes(teamPath);

  return teamNotes.reduce(
    (acc, note) => ({
      ...acc,
      [note.permalink]: note,
    }),
    {}
  );
}
