local root, repo = vim.env.MD_TEST_ROOT, vim.env.MD_TEST_REPO
vim.opt.runtimepath:prepend(repo .. "/configs/nvim")
vim.opt.runtimepath:prepend(vim.env.MD_TEST_PLUGIN)
vim.cmd("runtime plugin/livepreview.lua")
local notices = {}
vim.notify = function(message) table.insert(notices, tostring(message)) end
require("dotfiles.markdown_preview").setup()
local client

local function check()
  vim.bo.filetype = "text"
  vim.cmd.MarkdownPreview()
  assert(notices[#notices]:find(".md", 1, true), "Non-Markdown buffer accepted")
  local directory = root .. "/日本語 spaces ; dollars$"
  vim.fn.mkdir(directory, "p")
  local filename = directory .. "/preview 日本語 #.md"
  vim.fn.writefile({ "# InitialPreview 日本語", "", "![image](image.png)",
    '<img src="bad.png" onerror="window.previewInjected=true">',
    '<iframe src="https://untrusted.example/"></iframe>', '',
    '$E = mc^2$', '', '```mermaid', 'graph LR', '  A[First] --> B[Second]', '```', '', ':smile:' }, filename)
  vim.fn.writefile({ "FixturePrivate" }, root .. "/private.md")
  vim.fn.writefile({ "FixturePrivate" }, directory .. "/.hidden.md")
  assert(vim.uv.fs_symlink(root .. "/private.md", directory .. "/outside.md"))
  vim.fn.mkdir(directory .. "/.private", "p")
  vim.fn.writefile({ "FixturePrivate" }, directory .. "/.private/secret.md")
  assert(vim.uv.fs_symlink(directory .. "/.private/secret.md", directory .. "/public.md"))
  vim.fn.writefile({ "VisibleFixture" }, directory .. "/visible-target.md")
  assert(vim.uv.fs_symlink(directory .. "/visible-target.md", directory .. "/.visible-alias.md"))
  local png = vim.base64.decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg==")
  local image = assert(io.open(directory .. "/image.png", "wb"))
  image:write(png)
  image:close()
  vim.cmd("edit " .. vim.fn.fnameescape(filename))
  vim.bo.filetype = "markdown"
  vim.api.nvim_buf_set_lines(0, 0, 1, false, { "# InitialPreview 日本語 English" })
  local other = vim.api.nvim_create_buf(true, false)
  vim.api.nvim_buf_set_name(other, directory .. "/other.md")
  vim.api.nvim_buf_set_lines(other, 0, -1, false, { "unsaved" })
  local metadata = vim.env.XDG_DATA_HOME .. "/dotfiles/preview-assets.json"
  assert(vim.uv.fs_rename(metadata, metadata .. ".test-backup"))
  vim.cmd.MarkdownPreview()
  assert(not require("livepreview").is_running(), "Missing reviewed assets started a server")
  assert(notices[#notices]:find("assets need updating", 1, true), "Missing assets did not explain recovery")
  assert(vim.uv.fs_rename(metadata .. ".test-backup", metadata))
  local manifest = vim.json.decode(table.concat(vim.fn.readfile(metadata), "\n"))
  local script = manifest.files["static/markdown/markdown-it.min.js"].path
  local handle = assert(io.open(script, "rb"))
  local content = handle:read("*a")
  handle:close()
  handle = assert(io.open(script, "wb")); handle:write("// FixtureChanged"); handle:close()
  vim.cmd.MarkdownPreview()
  assert(not require("livepreview").is_running(), "Changed assets started a server")
  assert(notices[#notices]:find("verification failed", 1, true), "Changed asset was not rejected")
  handle = assert(io.open(script, "wb")); handle:write(content); handle:close()
  vim.cmd.MarkdownPreview()
  assert(not vim.bo.modified, "Preview did not save the current source")
  assert(vim.bo[other].modified and vim.fn.filereadable(directory .. "/other.md") == 0, "Another buffer was saved")
  local preview = require("livepreview")
  local listener = preview.serverObj.server
  assert(listener:getsockname().ip == "127.0.0.1", "Server did not bind loopback only")
  assert(vim.wait(5000, function() return vim.fn.filereadable(vim.env.MD_TEST_OPENED) == 1 end), "Browser was not launched")
  -- :LivePreview start can replace the plugin's server outside our wrapper.
  local elsewhere = root .. "/other project"
  vim.fn.mkdir(elsewhere, "p")
  vim.fn.writefile({ "# Other" }, elsewhere .. "/other.md")
  assert(preview.start(elsewhere .. "/other.md", 0))
  local external = preview.serverObj
  vim.cmd.MarkdownPreview()
  assert(preview.serverObj ~= external and preview.serverObj.webroot == directory,
    "Wrapper reused the stale root/port of an externally replaced server")
  listener = preview.serverObj.server
  assert(vim.wait(5000, function() return #vim.fn.readfile(vim.env.MD_TEST_OPENED) >= 2 end), "Restored preview did not open")
  local opened = vim.fn.readfile(vim.env.MD_TEST_OPENED)
  local argv = vim.json.decode(opened[#opened])
  assert(#argv == 1, "Browser URL was split into shell arguments")
  local url = argv[1]
  assert(url:match("^http://127%.0%.0%.1:%d+/") and vim.uri_decode(url):find("preview 日本語 #.md", 1, true), "Filename was not URL encoded")
  vim.cmd.MarkdownPreview()
  assert(preview.serverObj.server == listener, "Repeated preview restarted the local server")
  local command = { vim.env.MD_TEST_PYTHON, repo .. "/tests/check-markdown-preview.py", "--client", url }
  if vim.env.MD_TEST_BROWSER == "1" then table.insert(command, "--browser") end
  local finished
  client = vim.system(command, { text = true }, function(result) finished = result end)
  local function wait_event(marker)
    assert(vim.wait(40000, function()
      if finished and finished.code ~= 0 then
        error("Preview client failed: " .. (finished.stderr or ""))
      end
      return table.concat(vim.fn.filereadable(vim.env.MD_TEST_EVENTS) == 1 and vim.fn.readfile(vim.env.MD_TEST_EVENTS) or {}, "\n"):find(marker, 1, true)
    end, 50), "Preview client did not observe " .. marker)
  end
  wait_event('"kind": "ready"')
  local original = vim.api.nvim_get_current_buf()
  for _, name in ipairs({ ".hidden.md", ".private/secret.md", "public.md", ".visible-alias.md" }) do
    vim.cmd("edit " .. vim.fn.fnameescape(directory .. "/" .. name))
    vim.api.nvim_buf_set_lines(0, 0, -1, false, { "FixturePrivate" })
    vim.api.nvim_exec_autocmds("TextChangedI", { buffer = 0 })
    vim.api.nvim_exec_autocmds("BufWritePost", { buffer = 0 })
    vim.wait(50, function() return false end)
    vim.bo.modified = false
  end
  vim.api.nvim_set_current_buf(original)
  vim.api.nvim_buf_set_lines(0, 0, 1, false, { "# EditPreview 編集中の日本語" })
  vim.api.nvim_exec_autocmds("TextChangedI", { buffer = 0 })
  wait_event("EditPreview")
  assert(not table.concat(vim.fn.readfile(filename), "\n"):find("EditPreview", 1, true), "Live editing unexpectedly saved the source")
  for _, marker in ipairs({ "SavedPreview", "SavedAgain" }) do
    vim.api.nvim_buf_set_lines(0, 0, 1, false, { "# " .. marker .. " 保存後の日本語" })
    vim.cmd.write()
    wait_event(marker)
  end
  assert(vim.wait(5000, function() return finished ~= nil end), "Client did not finish")
  assert(finished.code == 0, finished.stderr)
  vim.cmd.MarkdownPreviewStop()
  vim.wait(50, function() return false end)
  assert(not preview.is_running() and listener:is_closing(), "Stop left the listener open")
  vim.cmd.MarkdownPreviewStop()
  vim.bo[other].modified = false
  print("Markdown preview: current buffer, local assets, loopback port, WSL opener argv, edits, repeated saves and shutdown passed")
end

local ok, error = xpcall(check, debug.traceback)
pcall(require("dotfiles.markdown_preview").stop)
if client then pcall(client.kill, client, 15) end
if not ok then
  io.stderr:write(tostring(error) .. "\n" .. table.concat(notices, "\n") .. "\n")
  vim.cmd("cquit 1")
end
