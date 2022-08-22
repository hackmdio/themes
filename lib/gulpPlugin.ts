import through2 from "through2";

import { generateNoteContent, loadMetaFromCSS } from "./noteHelper";
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

    const meta = loadMetaFromCSS(filePath);

    const note = notesByPermalink[meta.slug];
    const contentToUpdate = generateNoteContent(contents.toString(), meta);
    if (note) {
      await api.updateTeamNote(teamPath, note.id, {
        content: contentToUpdate,
        // !FIXME: workaround to prevent the API from clearing the permalink
        permalink: meta.slug,
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
