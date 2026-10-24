local M = {}
function M.setup(config_dir)
  local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
  if not vim.uv.fs_stat(lazypath .. "/lua/lazy/init.lua") then
    vim.schedule(function()
      vim.notify("dotfiles: base editing settings loaded. Install plugins explicitly with: nvim --headless -u NONE -i NONE -l "
        .. vim.fn.shellescape(config_dir .. "/bootstrap.lua"), vim.log.levels.INFO)
    end)
    return
  end
  vim.opt.runtimepath:prepend(lazypath)
  local specs = require("dotfiles.plugins")
  -- Bootstrap uses exactly the reviewed lockfile, including on a partial rerun.
  if vim.g.dotfiles_bootstrap then
    local lock = vim.json.decode(table.concat(vim.fn.readfile(config_dir .. "/lazy-lock.json"), "\n"))
    for _, spec in ipairs(specs) do
      local name = spec.name or spec[1]:match("/([^/]+)$")
      assert(lock[name], "Missing plugin lock entry: " .. name)
      spec.commit = lock[name].commit
    end
  end
  require("lazy").setup(specs, {
    lockfile = config_dir .. "/lazy-lock.json",
    performance = { rtp = { paths = { config_dir } } },
    install = { missing = false },
    checker = { enabled = false },
    change_detection = { notify = false },
    rocks = { enabled = false },
    pkg = { enabled = false },
  })
end
return M
