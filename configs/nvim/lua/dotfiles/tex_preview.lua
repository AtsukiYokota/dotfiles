local M = {}

local function fail(message)
  vim.notify(message, vim.log.levels.ERROR, { title = "TeX preview" })
  return false
end

local function running()
  return vim.fn.eval("b:vimtex.compiler.is_running() ? 1 : 0") == 1
end

local function ready(viewer)
  if vim.bo.filetype ~= "tex" and vim.bo.filetype ~= "plaintex" then
    return fail("Open a TeX source buffer first")
  end
  if vim.api.nvim_buf_get_name(0) == "" or vim.bo.buftype ~= "" then
    return fail("Save the TeX source to a .tex file first")
  end
  if vim.fn.exists("b:vimtex.compiler") == 0 or vim.fn.exists(":VimtexCompile") ~= 2 then
    return fail("VimTeX is not loaded; install the neovim module, then reopen this TeX buffer")
  end
  if viewer then
    if vim.fn.executable("zathura") == 0 then
      return fail("Zathura is missing; rerun bash setup_all.sh --modules latex in the dotfiles repository")
    end
    if (vim.env.DISPLAY or "") == "" and (vim.env.WAYLAND_DISPLAY or "") == "" then
      return fail("PDF preview needs a desktop display (native desktop or WSLg). Use :VimtexCompile for compilation only")
    end
  end
  return true
end

function M.start()
  if vim.fn.executable("latexmk") == 0 then
    return fail("latexmk is missing; run bash setup_all.sh --modules latex in the dotfiles repository")
  end
  if not ready(true) then return end
  -- Write only the current buffer. VimTeX resolves the main file, and latexmk
  -- watches all saved input/include files; unsaved buffers remain untouched.
  local ok, err = pcall(vim.cmd, "update")
  if not ok then return fail(tostring(err)) end
  if running() then
    -- Never use :VimtexCompile here: that command toggles a running compiler off.
    if vim.fn.filereadable(vim.fn.eval("b:vimtex.viewer.out()")) == 1 then
      vim.cmd.VimtexView()
    end
  else
    vim.fn["vimtex#compiler#start"]()
  end
end

function M.view()
  if not ready(true) then return end
  if vim.fn.filereadable(vim.fn.eval("b:vimtex.viewer.out()")) == 0 then
    return fail("No compiled PDF yet; run :TexPreview to compile and open it")
  end
  vim.cmd.VimtexView()
end

function M.stop()
  if not ready(false) then return end
  if running() then
    vim.cmd.VimtexStop()
  end
end

function M.setup()
  vim.g.vimtex_compiler_method = "latexmk"
  vim.g.vimtex_compiler_latexmk = {
    background = 1, continuous = 1, callback = 1,
    options = { "-verbose", "-file-line-error", "-synctex=1", "-interaction=nonstopmode" },
  }
  -- Leave the mode out of common options so TeX program directives and project
  -- latexmkrc files can select another engine. Retain the pLaTeX default.
  vim.g.vimtex_compiler_latexmk_engines = {
    _ = "-pdfdvi",
    platex = "-pdfdvi -latex='platex %O -halt-on-error %S'",
    uplatex = "-pdfdvi -latex='uplatex %O -halt-on-error %S' -e '$bibtex = \"upbibtex %O %B\";'",
  }
  vim.g.vimtex_quickfix_open_on_warning = 0
  -- The simple variant works on Wayland/WSLg without X11 window automation.
  vim.g.vimtex_view_method = "zathura_simple"
  vim.g.vimtex_view_automatic = 1
  vim.api.nvim_create_user_command("TexPreview", M.start, {
    desc = "Save this TeX buffer, start continuous compilation and open the PDF",
  })
  vim.api.nvim_create_user_command("TexPreviewStop", M.stop, {
    desc = "Stop continuous compilation of this TeX project",
  })
  vim.api.nvim_create_user_command("TexView", M.view, {
    desc = "Open the compiled PDF at the current TeX source position",
  })
end

return M
