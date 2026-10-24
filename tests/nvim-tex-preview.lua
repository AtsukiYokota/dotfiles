-- Run through check-tex-preview.py; all state and external jobs are isolated.
local root, repo = vim.env.TEX_TEST_ROOT, vim.env.TEX_TEST_REPO
local real = vim.env.TEX_TEST_REAL == "1"
local notices = {}
vim.notify = function(message) table.insert(notices, tostring(message)) end
vim.opt.runtimepath:prepend(repo .. "/configs/nvim")
vim.opt.runtimepath:prepend(vim.env.TEX_TEST_PLUGIN)
require("dotfiles.tex_preview").setup()
-- The fake viewer is a Python script, not a linked GTK executable.
vim.g.vimtex_view_zathura_check_libsynctex = 0
vim.g.vimtex_quickfix_mode = 0
vim.cmd("filetype plugin indent on")
vim.cmd("runtime plugin/vimtex.vim")

local function wait_for(message, condition)
  assert(vim.wait(real and 90000 or 10000, condition, 50), message)
end

local function text(path)
  if vim.fn.filereadable(path) == 0 then return "" end
  if real and path:sub(-4) == ".pdf" then
    local result = vim.system({ "pdftotext", path, "-" }, { text = true }):wait()
    return result.code == 0 and result.stdout or ""
  end
  return table.concat(vim.fn.readfile(path), "\n")
end

local function running()
  return vim.fn.eval("b:vimtex.compiler.is_running() ? 1 : 0") == 1
end

local compiler_jobs = {}
vim.api.nvim_create_autocmd("User", {
  pattern = "VimtexEventCompileStarted",
  callback = function()
    table.insert(compiler_jobs, vim.fn.eval("b:vimtex.compiler.job"))
  end,
})

local function wait_for_jobs(jobs)
  for _, status in ipairs(vim.fn.jobwait(jobs, 5000)) do
    assert(status >= 0 or status == -3, "Compiler job did not finish after stop: " .. status)
  end
end

local function stop_current()
  local job = vim.fn.eval("b:vimtex.compiler.job")
  vim.cmd.TexPreviewStop()
  wait_for_jobs({ job })
  assert(not running(), "Stop left the compiler running")
end

local function check()
  vim.cmd.enew()
  vim.bo.filetype = "text"
  vim.cmd.TexPreview()
  assert(notices[#notices]:find("TeX source"), "Non-TeX buffer should be rejected")

  local project = root .. "/project with spaces ; dollars$"
  vim.fn.mkdir(project, "p")
  local main, part, pdf = project .. "/main file.tex", project .. "/section part.tex", project .. "/main file.pdf"
  vim.fn.writefile({
    "% !TeX program = lualatex", "\\documentclass{ltjsarticle}",
    "\\begin{document}", "\\input{section part}", "\\end{document}",
  }, main)
  vim.fn.writefile({ "% !TeX root = main file.tex", "FirstPreview 日本語" }, part)
  vim.cmd("edit " .. vim.fn.fnameescape(part))
  local source_buf = vim.api.nvim_get_current_buf()
  assert(vim.fn.eval("b:vimtex.tex") == main, "Subfile magic did not resolve the main document")
  assert(vim.fn.eval("b:vimtex.compiler.get_engine()") == "-lualatex", "LuaLaTeX magic lost to default pdfdvi")

  local path = vim.env.PATH
  vim.env.PATH = "/nonexistent-dotfiles-test"
  vim.cmd.TexPreview()
  assert(notices[#notices]:find("modules latex"), "Missing compiler should explain how to install it")
  vim.env.PATH = path
  local display = vim.env.DISPLAY
  vim.env.DISPLAY = ""
  vim.cmd.TexPreview()
  assert(notices[#notices]:find("WSLg"), "No-display session should explain WSLg requirement")
  assert(not running(), "No-display preview must not start a process")
  vim.env.DISPLAY = display

  -- Another modified buffer must not be silently written by preview.
  local unsaved = vim.api.nvim_create_buf(true, false)
  vim.api.nvim_buf_set_name(unsaved, project .. "/unrelated.txt")
  vim.api.nvim_buf_set_lines(unsaved, 0, -1, false, { "not saved" })
  vim.api.nvim_buf_set_lines(0, 1, -1, false, { "FirstPreview 日本語 and English" })
  vim.cmd.TexPreview()
  wait_for("First compile did not produce Japanese/English PDF", function()
    local result = text(pdf)
    return result:find("FirstPreview", 1, true) and result:find("日本語", 1, true)
  end)
  wait_for("Viewer was not opened after successful compile", function()
    return text(vim.env.TEX_TEST_VIEWER):find("main file.pdf", 1, true)
  end)
  assert(running(), "Continuous compiler exited after first build")
  assert(vim.fn.filereadable(project .. "/unrelated.txt") == 0 and vim.bo[unsaved].modified,
    "Starting preview wrote another modified buffer")
  local pid = vim.fn.eval("b:vimtex.compiler.get_pid()")
  vim.cmd.TexPreview()
  assert(running() and vim.fn.eval("b:vimtex.compiler.get_pid()") == pid, "Repeated preview toggled/restarted the compiler")
  vim.api.nvim_buf_set_lines(0, 1, -1, false, { "SecondPreview 保存後の日本語" })
  vim.cmd.write()
  wait_for("Saving an included source did not rebuild the PDF", function()
    return text(pdf):find("SecondPreview", 1, true)
  end)
  vim.cmd.TexView()
  vim.api.nvim_buf_set_lines(0, 1, -1, false, { "\\UndefinedCommandForTest" })
  vim.cmd.write()
  wait_for("Compiler did not observe invalid TeX", function()
    return text(project .. "/main file.log"):find("Undefined control sequence", 1, true)
  end)
  vim.wait(200, function() return false end)
  -- VimTeX may show compiler output when a fixture log has no parseable line.
  vim.api.nvim_set_current_buf(source_buf)
  assert(running(), "A source error terminated continuous compilation")
  vim.api.nvim_buf_set_lines(0, 1, -1, false, { "RecoveredPreview 修正した日本語" })
  vim.cmd.write()
  wait_for("Continuous compiler did not recover from source error", function()
    return text(pdf):find("RecoveredPreview", 1, true)
  end)
  vim.api.nvim_set_current_buf(source_buf)
  stop_current()
  vim.cmd.TexPreviewStop()

  if not real then
    local calls = vim.fn.readfile(vim.env.TEX_TEST_CALLS)
    assert(#calls == 1, "Repeated start created duplicate compiler processes")
    local call = vim.json.decode(calls[1])
    assert(call.cwd == project and call.args[#call.args] == "main file.tex", "Paths were split or shell-expanded")
    assert(vim.tbl_contains(call.args, "-pvc") and vim.tbl_contains(call.args, "-view=none"), "Continuous mode was not passed to latexmk")
    assert(vim.tbl_contains(call.args, "-lualatex") and not vim.tbl_contains(call.args, "-pdfdvi"), "Conflicting engine flags were sent")
  end

  -- Preserve existing pLaTeX sources; also allow upLaTeX and English pdfLaTeX.
  local cases = {
    { "platex", "", "\\documentclass[dvipdfmx]{jsarticle}", "DefaultPreview 日本語 English", "-pdfdvi" },
    { "uplatex", "% !TeX program = uplatex", "\\documentclass[uplatex,dvipdfmx]{jsarticle}", "UnicodePreview 日本語 English", "uplatex" },
    { "pdflatex", "% !TeX program = pdflatex", "\\documentclass{article}", "EnglishPreview", "-pdf" },
    { "project-lualatex", "", "\\documentclass{ltjsarticle}", "ProjectPreview 日本語 English", "-lualatex", "$pdf_mode = 4;" },
  }
  for _, case in ipairs(cases) do
    local dir = root .. "/" .. case[1]
    vim.fn.mkdir(dir, "p")
    if case[6] then vim.fn.writefile({ case[6] }, dir .. "/.latexmkrc") end
    local source = dir .. "/main.tex"
    vim.fn.writefile({ case[2], case[3], "\\begin{document}", case[4], "\\end{document}" }, source)
    vim.cmd("edit " .. vim.fn.fnameescape(source))
    assert(vim.fn.eval("b:vimtex.compiler.get_engine()"):find(case[5], 1, true), "Wrong engine for " .. case[1])
    vim.cmd.TexPreview()
    wait_for(case[1] .. " did not produce PDF", function()
      local result = text(dir .. "/main.pdf")
      return result:find(case[4]:match("^%w+"), 1, true)
        and (case[1] == "pdflatex" or result:find("日本語", 1, true))
    end)
    stop_current()
  end
  vim.bo[unsaved].modified = false
  print("TeX preview: root/engine selection, paths, first view, repeat start, save rebuild, errors/recovery and stop passed")
end

local ok, err = xpcall(check, debug.traceback)
local cleanup_ok, cleanup_err = xpcall(function()
  vim.fn["vimtex#compiler#stop_all"]()
  wait_for_jobs(compiler_jobs)
end, debug.traceback)
if not cleanup_ok then
  ok, err = false, tostring(err or "") .. "\n" .. cleanup_err
end
if not ok then
  io.stderr:write(table.concat(notices, "\n") .. "\n")
  io.stderr:write(tostring(err) .. "\n")
  vim.cmd("cquit 1")
end
