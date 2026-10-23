local M = {}
local webroot, port, owned_server

local function fail(message)
  vim.notify(message, vim.log.levels.ERROR, { title = "Markdown preview" })
end

local function browser_command()
  local uname = vim.uv.os_uname()
  local wsl = (vim.env.WSL_DISTRO_NAME or "") ~= "" or (vim.env.WSL_INTEROP or "") ~= ""
    or (uname.release .. uname.version):lower():find("microsoft", 1, true) ~= nil
  if wsl then
    -- xdg-open may exist on WSL even though no Linux browser is installed.
    for _, command in ipairs({ "wslview", "explorer.exe" }) do
      if vim.fn.executable(command) == 1 then return { command } end
    end
  end
  if (vim.env.DISPLAY or "") ~= "" or (vim.env.WAYLAND_DISPLAY or "") ~= "" then
    if vim.fn.executable("xdg-open") == 1 then return { "xdg-open" } end
  end
end

function M.start()
  local filename = vim.api.nvim_buf_get_name(0)
  if vim.bo.filetype ~= "markdown" or vim.bo.buftype ~= ""
    or not (filename:match("%.md$") or filename:match("%.markdown$")) then
    return fail("Open a named .md or .markdown file first")
  end
  local browser = browser_command()
  if not browser then
    return fail("A desktop browser is needed: use Ubuntu with xdg-open, or enable Windows interop for the WSL host browser")
  end
  local ok, preview = pcall(require, "livepreview")
  if not ok then
    return fail("live-preview.nvim is missing; rerun bash setup_all.sh --modules neovim in the dotfiles repository")
  end
  local written, error = pcall(vim.cmd, "update")
  if not written then return fail(tostring(error)) end
  local directory = vim.fs.dirname(filename)
  if not preview.is_running() or webroot ~= directory or preview.serverObj ~= owned_server then
    require("livepreview.config").set({ address = "127.0.0.1", dynamic_root = true })
    -- Port 0 asks the OS for an unused loopback port, including when several
    -- independent Neovim instances are previewing different documents.
    local started, result = pcall(preview.start, filename, 0)
    local address = started and result and preview.serverObj.server:getsockname()
    if not address then
      pcall(preview.close)
      return fail("Could not start the local preview server: " .. tostring(result))
    end
    webroot, port, owned_server = directory, address.port, preview.serverObj
    require("livepreview.config").set({ port = port })
  end
  local url = ("http://127.0.0.1:%d/%s"):format(port, vim.uri_encode(vim.fs.basename(filename)))
  local opened, process, error = pcall(vim.ui.open, url, { cmd = browser })
  if not opened or not process then
    return fail("Browser launch failed. Open " .. url .. " manually. " .. tostring(error or process))
  end
  vim.notify("Markdown preview: " .. url)
end

function M.stop()
  if package.loaded.livepreview then package.loaded.livepreview.close() end
  webroot, port, owned_server = nil, nil, nil
end

function M.setup()
  vim.api.nvim_create_user_command("MarkdownPreview", M.start, {
    desc = "Save this Markdown buffer and open a local live browser preview",
  })
  vim.api.nvim_create_user_command("MarkdownPreviewStop", M.stop, {
    desc = "Stop the Markdown preview server",
  })
  local group = vim.api.nvim_create_augroup("DotfilesMarkdownPreview", { clear = true })
  vim.api.nvim_create_autocmd("BufWritePost", {
    group = group, pattern = { "*.md", "*.markdown" },
    callback = function(event)
      if not package.loaded.livepreview or not package.loaded.livepreview.is_running() then return end
      -- Also publish writes made by formatters/commands. The plugin normally
      -- updates on typing; snapshot this saved buffer even if focus changes.
      local server = require("livepreview.server")
      local message = {
        type = "update", filepath = vim.api.nvim_buf_get_name(event.buf),
        content = table.concat(vim.api.nvim_buf_get_lines(event.buf, 0, -1, false), "\n"),
      }
      for _, client in ipairs(server.connecting_clients) do
        if not client:is_closing() then server.websocket.send_json(client, message) end
      end
    end,
  })
end

return M
