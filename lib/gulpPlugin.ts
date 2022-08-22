import through2 from "through2";
import fs from "fs";
import path from "path";

import { generateNoteContent } from "./noteHelper";
import { StyleMeta } from "../types/styleMeta";
import { Note } from "@hackmd/api/dist/type";
import API from "@hackmd/api";

export default function ({
  api,
  teamPath,
  notesByPermalink,
}: {
  notesByPermalink: Record<string, Note>;
  api: API;
  teamPath: string;
}) {
  return through2.obj(async function (file, enc, cb) {
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
      await api.updateTeamNote(teamPath, note.id, {
        content: contentToUpdate,
      });
    } else {
      await api.createTeamNote(teamPath, {
        content: contentToUpdate,
        permalink: meta.slug,
      });
    }

    cb(null, file);
  });
}
