# sd-foldable-menu-list

Simple Stable Diffusion WebUI extension that adds a fold/unfold toggle for the
menu block list above the script panel in `txt2img` and `img2img`.

## What it does

- Inserts a toggle button above `#script_list` in:
  - `#txt2img_script_container`
  - `#img2img_script_container`
- Collapses or expands the sibling menu blocks above that anchor
- Persists open/closed state per tab in `localStorage`

https://github.com/user-attachments/assets/2ecd897e-00d5-452a-831e-d425f7290ab7

## Install

Place this folder under:

`extensions/sd-foldable-menu-list`

or use "Install from URL".

Then restart WebUI.
