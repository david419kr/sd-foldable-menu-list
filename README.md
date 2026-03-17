# sd-foldable-menu-list

Simple Stable Diffusion WebUI extension that adds a fold/unfold toggle for the
menu block list above the script panel in `txt2img`.

## What it does

- Inserts a toggle button above `#script_list` in `#txt2img_script_container`
- Collapses or expands the sibling menu blocks above that anchor
- Persists open/closed state in `localStorage`

## Install

Place this folder under:

`extensions/sd-foldable-menu-list`

Then restart WebUI.

## Notes

- This extension is JavaScript-only.
- If you still keep a legacy script at `javascript/hide-fold-menu.js`, disable
  or remove it to avoid duplicate behavior.
