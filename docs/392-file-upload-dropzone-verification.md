# #392 — Reusable File Upload Dropzone Component

- **Requested:** `frontend/src/components/ui/FileUpload/FileUpload.tsx` — a
  reusable drag-and-drop / click-to-browse file upload component with type
  and size validation, image thumbnail previews, per-file remove buttons,
  and an optional upload progress bar.

## Investigation

Before implementing anything, checked whether this was already done:

- `frontend/src/components/ui/FileUpload/FileUpload.tsx`,
  `FileUpload.test.tsx`, and `index.ts` already exist on `upstream/main`
  (`Navin-xmr/navin-frontend`), added by commit `47fba41` —
  `feat(ui): add FileUpload dropzone component (#392)` — merged via PR #468.
- The implementation covers every item in the issue:
  - Props: `accept?: string[]`, `maxSizeMB?: number`, `multiple?: boolean`,
    `onFilesSelected: (files: File[]) => void`, plus `uploadProgress?: number`
    as specified for the progress bar.
  - Drag-over highlight state via `onDragOver`/`onDragLeave`/`onDrop`
    (`isDragOver` state, styled highlight).
  - Click-to-browse via a hidden `<input type="file">` triggered by the
    dropzone's `onClick`/keyboard (`Enter`/`Space`) handlers.
  - Type validation against `accept` (MIME wildcards, exact MIME types, and
    file extensions) and size validation against `maxSizeMB`, with an inline
    `role="alert"` error per invalid file; invalid files are excluded from
    the `onFilesSelected` callback.
  - Image thumbnails via `FileReader`/data URL; filename + formatted size for
    non-images.
  - Per-file remove (×) button that updates both the rendered list and the
    `onFilesSelected` callback.
  - Accessible: `role="button"` dropzone with keyboard support, ARIA labels
    on the remove buttons, `role="progressbar"` with
    `aria-valuenow`/`aria-valuemin`/`aria-valuemax` on the progress bar.
- Unit tests in `FileUpload.test.tsx` cover drag-and-drop, click-to-browse,
  type/size validation errors, thumbnail rendering, and remove-button
  behavior — i.e. every acceptance-criteria checkbox in the issue.

## Conclusion

**No new implementation was needed.** #392's acceptance criteria are already
met on `upstream/main`. This note exists purely as a paper trail so #392 can
be closed referencing commit `47fba41` (PR #468) instead of sitting open
with no record connecting it to the code that already satisfies it — the
PR's subject line references `(#392)` but its body never used a
`Closes #392`-style keyword, so GitHub would not have auto-closed the issue
when the PR merged.

## Re-verifying

```bash
git log upstream/main --oneline -- frontend/src/components/ui/FileUpload/
git show 47fba41 --stat
```
