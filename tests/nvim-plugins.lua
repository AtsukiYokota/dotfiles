-- After bootstrap, use the same isolated HOME/XDG_* directories:
-- nvim --headless -i NONE --cmd 'set loadplugins' -u configs/nvim/init.lua -l tests/nvim-plugins.lua
local function check()
  assert(vim.v.errmsg == "", "Startup error: " .. vim.v.errmsg)
  local errors = {}
  local notify = vim.notify
  vim.notify = function(message, level, opts)
    if level == vim.log.levels.ERROR then
      table.insert(errors, tostring(message))
    end
    notify(message, level, opts)
  end
  local plugins = require("lazy.core.config").plugins
  local names = {}
  for name, plugin in pairs(plugins) do
    assert(plugin._.installed, "Plugin is not installed: " .. name)
    table.insert(names, name)
  end
  require("lazy").load({ plugins = names, wait = true })
  vim.wait(200, function() return false end)
  assert(vim.g.colors_name == "gruvbox", "Gruvbox did not load")
  assert(vim.api.nvim_get_hl(0, { name = "Normal", link = false }).bg == 0x282828, "Gruvbox background did not load")
  assert(#names == 7, "Unexpected plugin count")
  assert(package.loaded["lualine"], "lualine did not load")
  assert(package.loaded["gitsigns"], "gitsigns did not load")
  assert(vim.fn.exists(":LivePreview") == 2, "LivePreview command missing")
  assert(vim.fn.exists(":AutoPep8") == 2, "AutoPep8 command missing")
  assert(vim.fn.exists(":ClangFormat") == 2, "ClangFormat command missing")
  assert(vim.fn.exists(":Format") == 2, "Format command missing")
  for _, command in ipairs({ "TexPreview", "TexPreviewStop", "TexView", "PlantumlPreview", "PlantumlStop", "MarkdownPreview", "MarkdownPreviewStop" }) do
    assert(vim.fn.exists(":" .. command) == 2, command .. " missing")
  end
  assert(vim.g.vimtex_compiler_latexmk_engines._ == "-pdfdvi", "pLaTeX default changed")
  for _, option in ipairs(vim.g.vimtex_compiler_latexmk.options) do
    assert(not vim.tbl_contains({ "-pdf", "-pdfdvi", "-lualatex", "-xelatex" }, option), "Compiler mode must respect TeX magic comments")
  end
  assert(vim.fn.globpath(vim.o.runtimepath, "syntax/plantuml.vim") ~= "", "PlantUML syntax missing")
  assert(vim.fn.globpath(vim.o.runtimepath, "autoload/vimtex.vim") ~= "", "VimTeX missing")
  assert(vim.o.ambiwidth == "double" and vim.o.tabstop == 2 and not vim.o.swapfile, "Plugins changed retained options")
  assert(vim.fn.strdisplaywidth("󰕈") == 3, "Plugins changed Nerd Font Mono icon widths")
  assert(vim.v.errmsg == "", "Plugin error: " .. vim.v.errmsg)
  assert(#errors == 0, table.concat(errors, "\n"))
  print("Neovim plugin smoke: all installed plugins loaded, commands and retained options passed")
end

local ok, err = xpcall(check, debug.traceback)
if not ok then
  io.stderr:write(tostring(err) .. "\n")
  vim.cmd("cquit 1")
end
