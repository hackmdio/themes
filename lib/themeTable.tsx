import React from "react";
import { render } from "ink";
import Table from "ink-table";
import fg from "fast-glob";
import path from "path";
import { Note } from "@hackmd/api/dist/type";

import { getNotesMapByPermalink, loadMetaFromCSS } from "./noteHelper";
import hackmdConfig from "../hackmd.config";

const { api, workspaceTeamPath } = hackmdConfig;

export default function ThemeTable({
  themes,
}: {
  themes: Pick<Note, "publishLink" | "title" | "permalink" | "teamPath">[];
}) {
  return (
    <Table
      data={themes.map((theme) => ({
        ...theme,
        syntax: `{% hackmd @${theme.teamPath}/${theme.permalink} %}`,
      }))}
      columns={["title", "permalink", "publishLink", "syntax"]}
    />
  );
}

export async function renderThemeTable() {
  const notesMap = await getNotesMapByPermalink(api, workspaceTeamPath);
  const entries = await fg(path.resolve(__dirname, "../src/**/style.scss"));

  const themes = entries
    .map((entry) => {
      const meta = loadMetaFromCSS(entry);

      if (!meta) return null;

      return notesMap[meta.slug];
    })
    .filter(Boolean)
    .map((note) => {
      return {
        publishLink: note.publishLink,
        title: note.title,
        permalink: note.permalink || note.shortId,
        teamPath: note.teamPath,
      };
    });

  return render(<ThemeTable themes={themes} />);
}
