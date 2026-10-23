-- Loading the editor never downloads plugins. Run bootstrap.lua explicitly.
local config_dir = vim.fn.fnamemodify(debug.getinfo(1, "S").source:sub(2), ":p:h")
vim.g.dotfiles_nvim_config = config_dir
vim.opt.runtimepath:prepend(config_dir)
if vim.fn.executable("dotfiles-clipboard") == 1 then
  local paste = { "dotfiles-clipboard", "paste" }
  if vim.env.TMUX and vim.fn.executable("tmux") == 1 then
    paste = { "sh", "-c", "dotfiles-clipboard paste 2>/dev/null || tmux show-buffer" }
  end
  vim.g.clipboard = {
    name = "dotfiles-clipboard",
    copy = { ["+"] = { "dotfiles-clipboard", "copy" }, ["*"] = { "dotfiles-clipboard", "copy" } },
    paste = { ["+"] = paste, ["*"] = paste },
    cache_enabled = 1,
  }
end
vim.cmd("source " .. vim.fn.fnameescape(config_dir .. "/legacy.vim"))
-- Keep legacy CJK ambiguous-width behavior, but Nerd Font Mono icons occupy one
-- cell. Without these PUA overrides, ambiwidth=double misaligns Lazy/status lines.
vim.fn.setcellwidths({ { 0xe000, 0xf8ff, 1 }, { 0xf0000, 0xffffd, 1 }, { 0x100000, 0x10fffd, 1 } })
if vim.fn.has("nvim-0.11.3") == 0 then
  vim.schedule(function()
    vim.notify("dotfiles: Neovim 0.11.3 or newer is required for plugins and LSP; base settings loaded.", vim.log.levels.WARN)
  end)
  return
end
require("dotfiles.lsp").setup()
require("dotfiles.plantuml_preview").setup()
require("dotfiles.markdown_preview").setup()
require("dotfiles.lazy").setup(config_dir)
