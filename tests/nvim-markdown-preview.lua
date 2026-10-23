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
  vim.fn.writefile({ "# InitialPreview 日本語", "", "![image](image.png)" }, filename)
  local png = vim.base64.decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=")
  local image = assert(io.open(directory .. "/image.png", "wb"))
  image:write(png)
  image:close()
  vim.cmd("edit " .. vim.fn.fnameescape(filename))
  vim.bo.filetype = "markdown"
  vim.api.nvim_buf_set_lines(0, 0, 1, false, { "# InitialPreview 日本語 English" })
  local other = vim.api.nvim_create_buf(true, false)
  vim.api.nvim_buf_set_name(other, directory .. "/other.md")
  vim.api.nvim_buf_set_lines(other, 0, -1, false, { "unsaved" })
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
