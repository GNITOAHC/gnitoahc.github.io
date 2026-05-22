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

**Some default key mappings and commands**

- **Existing from Terminal:** `<C-\><C-n>`
- **List buffers:** `:buffers`, use `:b<number>` to switch to target buffer and `:bd<number>` to delete target buffer.
- **Managing pane:** `:vs` or `:sp` to split. `<C-w>H, <C-w>J, <C-w>K, <C-w>L` to move pane.
- **Number increment/decrement:** Increase/Decrease highlighted number by one: `<C-a>`/`<C-x>`. Increase/Decrease visual blocked number sequentially: `g<C-a>`/`g<C-x>`.

---

Last updated: 2026-05-27\
Initial edit: 2026-03-28
