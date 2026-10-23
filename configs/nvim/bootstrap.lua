-- Explicit installation: nvim --headless -u NONE -i NONE -l /path/to/bootstrap.lua
local config_dir = vim.fn.fnamemodify(debug.getinfo(1, "S").source:sub(2), ":p:h")
local lockfile = config_dir .. "/lazy-lock.json"
local original_lock = vim.fn.readfile(lockfile, "b")
local function run(args)
  local result = vim.system(args, { text = true }):wait()
  if result.code ~= 0 then
    error(table.concat(args, " ") .. " failed:\n" .. (result.stderr or result.stdout or ""))
  end
  return vim.trim(result.stdout or "")
end

local function bootstrap()
  assert(vim.fn.has("nvim-0.11.3") == 1, "Neovim 0.11.3 or newer is required")
  assert(vim.fn.executable("git") == 1, "git is required")
  local expected = vim.json.decode(table.concat(original_lock, "\n"))
  local manager = expected["lazy.nvim"].commit
  assert(manager:match("^[0-9a-f]+$") and #manager == 40, "Invalid lazy.nvim revision")
  local root = vim.fn.stdpath("data") .. "/lazy"
  local lazypath = root .. "/lazy.nvim"
  vim.fn.mkdir(root, "p")
  if not vim.uv.fs_stat(lazypath) then
    run({ "git", "clone", "--filter=blob:none", "https://github.com/folke/lazy.nvim.git", lazypath })
  else
    local origin = run({ "git", "-C", lazypath, "remote", "get-url", "origin" })
    assert(origin:gsub("%.git$", "") == "https://github.com/folke/lazy.nvim", "Unexpected lazy.nvim origin: " .. origin)
    assert(run({ "git", "-C", lazypath, "status", "--porcelain" }) == "", "lazy.nvim has local changes; resolve them before bootstrap")
  end
  run({ "git", "-C", lazypath, "fetch", "origin", manager })
  run({ "git", "-C", lazypath, "checkout", "--detach", manager })
  vim.g.dotfiles_bootstrap = true
  -- -u NONE intentionally skips the user's init, but also disables loadplugins.
  -- lazy.setup returns before initializing its configuration unless this is true.
  vim.go.loadplugins = true
  dofile(config_dir .. "/init.lua")
  assert(require("lazy.core.config").plugins["lazy.nvim"], "lazy.nvim initialization did not complete")
  require("lazy").install({ wait = true, show = false, lockfile = true })
  require("lazy").restore({ wait = true, show = false, lockfile = true })
  for name, pin in pairs(expected) do
    local revision = run({ "git", "-C", root .. "/" .. name, "rev-parse", "HEAD" })
    assert(revision == pin.commit, name .. " did not reach its locked revision")
  end
  print("dotfiles: all Neovim plugins installed at locked revisions")
end

local ok, err = xpcall(bootstrap, debug.traceback)
-- lazy writes its lock while installing; installation must not change our input.
if not vim.deep_equal(vim.fn.readfile(lockfile, "b"), original_lock) then
  vim.fn.writefile(original_lock, lockfile, "b")
end
if not ok then
  io.stderr:write(tostring(err) .. "\n")
  vim.cmd("cquit 1")
end
