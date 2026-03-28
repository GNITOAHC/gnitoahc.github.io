---
title: My Neovim Tips
date: 2026-03-28
description: Neovim tips
tags: ['nvim']
type: note
---

**Find all occurrences and replace with [telescope.nvim](https://github.com/nvim-telescope/telescope.nvim)**

Setup `telescope.nvim` for keymapping:

```lua
local builtin = require('telescope.builtin')
vim.keymap.set('n', '<leader>F', builtin.live_grep, { desc = 'Telescope live grep' })

-- Or setup with which-key.nvim
local status_ok, which_key = pcall(require, "which-key")
if not status_ok then
	return
end
which_key.add({
  { "<leader>F", "<cmd>Telescope live_grep<cr>", desc = "Live grep", hidden = true },
})
```

1. Run `<leader>F` to find all occurrences.
2. Use `<C-q>` to send all items into quickfix list (qflist). For default mapping, see [this](https://github.com/nvim-telescope/telescope.nvim#default-mappings).
3. Use `:cdo s/foo/bar/gc` to replace all occurrences in the quickfix list.

---

Last updated: 2026-03-28\
Initial edit: 2026-03-28
