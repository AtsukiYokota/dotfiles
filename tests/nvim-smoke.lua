-- Run with an isolated HOME/XDG_* and no installed plugins:
-- nvim --headless -i NONE --cmd 'set loadplugins' -u configs/nvim/init.lua -l tests/nvim-smoke.lua
local function check()
  assert(vim.v.errmsg == "", "Startup error: " .. vim.v.errmsg)
  local expected = {
    backup = false, writebackup = false, swapfile = false,
    number = true, wrap = true, list = true, textwidth = 0,
    tabstop = 2, shiftwidth = 2, expandtab = true, smarttab = true,
    ignorecase = true, smartcase = true, incsearch = true, hlsearch = true,
    ambiwidth = "double", clipboard = "unnamedplus", mouse = "a",
  }
  for option, value in pairs(expected) do
    assert(vim.o[option] == value, option .. " did not preserve its old value")
  end
  for _, icon in ipairs({ "", "", "󰕈" }) do
    assert(vim.fn.strdisplaywidth(icon) == 1, "Nerd Font Mono icon must occupy one cell: " .. icon)
  end
  assert(vim.fn.strdisplaywidth("·") == 2 and vim.fn.strdisplaywidth("日") == 2, "Legacy CJK widths changed")
  for lhs, rhs in pairs({ [";"] = ":", j = "gj", k = "gk", n = "nzz", N = "Nzz", ["<C-h>"] = "<C-W>h" }) do
    assert(vim.fn.maparg(lhs, "n"):lower() == rhs:lower(), "Missing normal mapping " .. lhs)
  end
  assert(vim.fn.maparg("jj", "i"):lower() == "<esc>", "jj must leave insert mode")
  assert(vim.fn.exists(":ReopenWinFile") == 2)
  assert(vim.fn.exists(":AutoPep8") == 2)
  assert(vim.fn.exists(":RosFormat") == 2)
  assert(vim.lsp.config.clangd.cmd[1] == "clangd")
  assert(vim.lsp.config.basedpyright.cmd[1] == "basedpyright-langserver")
  assert(vim.fn.isdirectory(vim.fn.stdpath("data") .. "/lazy/lazy.nvim") == 0,
    "This offline smoke test requires a fresh XDG_DATA_HOME; startup must not clone lazy.nvim")

  -- Exercise behavior on a real write, including the consciously retained Markdown rule.
  local file = vim.fn.tempname() .. ".md"
  vim.cmd("edit " .. vim.fn.fnameescape(file))
  vim.api.nvim_buf_set_lines(0, 0, -1, false, { "hard break  ", "ordinary\t", "keep" })
  vim.cmd.write()
  assert(vim.deep_equal(vim.fn.readfile(file), { "hard break", "ordinary", "keep" }), "Trailing whitespace was not removed")
  vim.fn.delete(file)
  vim.api.nvim_buf_set_lines(0, 0, -1, false, { "\27[31mred\27[0m" })
  vim.cmd.DeleteAnsi()
  assert(vim.api.nvim_get_current_line() == "red", "DeleteAnsi must remove actual escape sequences")
  vim.bo.modified = false

  -- CP932 command must decode a real Japanese file, not merely exist.
  local cp932 = vim.fn.tempname() .. ".txt"
  local encoded = vim.fn.iconv("日本語", "utf-8", "cp932")
  assert(encoded ~= "", "Test runtime needs CP932 conversion")
  vim.fn.writefile({ encoded }, cp932, "b")
  vim.cmd("edit " .. vim.fn.fnameescape(cp932))
  vim.cmd.ReopenWinFile()
  assert(vim.api.nvim_get_current_line() == "日本語", "CP932 reopen failed")
  vim.fn.delete(cp932)
  vim.cmd.enew()
  vim.cmd("file robot.launch")
  vim.api.nvim_exec_autocmds("BufNewFile", { pattern = "robot.launch" })
  assert(vim.bo.filetype == "xml", "ROS XML filetype was not retained")
  local test_dir = vim.fn.fnamemodify(debug.getinfo(1, "S").source:sub(2), ":h")
  dofile(test_dir .. "/nvim-ros-format.lua")
  print("Neovim offline smoke: settings, mappings, write hook, ANSI cleanup and CP932 passed")
end

local ok, err = xpcall(check, debug.traceback)
if not ok then
  io.stderr:write(tostring(err) .. "\n")
  vim.cmd("cquit 1")
end
