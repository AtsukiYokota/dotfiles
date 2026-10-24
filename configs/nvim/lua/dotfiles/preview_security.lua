-- Restrict the pinned preview server to its document tree and browser origin.
local M = {}
local installed = false
local asset_version = "2026-10-25"

local function inside(path, root)
  return path and root and (path == root or path:sub(1, #root + 1) == root .. "/")
end

local documents = { md = true, markdown = true }
local assets = { md = true, markdown = true, png = true, jpg = true, jpeg = true,
  gif = true, webp = true, svg = true, ico = true, bmp = true, avif = true }

local function allowed_file(path, root, extensions)
  if not inside(path, root) or path == root then return false end
  local relative = path:sub(#root + 2)
  for component in relative:gmatch("[^/]+") do
    if component:sub(1, 1) == "." then return false end
  end
  local extension = relative:match("%.([^./]+)$")
  return not extensions or (extension and extensions[extension:lower()])
end

local function checked_assets()
  local data = vim.env.XDG_DATA_HOME or vim.fs.dirname(vim.fn.stdpath("data"))
  local metadata = data .. "/dotfiles/preview-assets.json"
  local instructions = "Markdown preview assets need updating: rerun bash setup_all.sh --modules neovim"
  assert(vim.fn.filereadable(metadata) == 1, instructions)
  local manifest = vim.json.decode(table.concat(vim.fn.readfile(metadata), "\n"))
  assert(manifest.version == asset_version and type(manifest.files) == "table", instructions)
  local root = vim.uv.fs_realpath(manifest.root)
  local expected = vim.uv.fs_realpath(data .. "/dotfiles/preview-assets/" .. asset_version)
  assert(root and root == expected, instructions)
  local files, hashes, command = {}, {}, { "sha256sum", "--zero", "--" }
  for relative, entry in pairs(manifest.files) do
    assert(type(relative) == "string" and (relative:sub(1, 7) == "static/" or relative:sub(1, 9) == "licenses/"), instructions)
    local path = vim.uv.fs_realpath(entry.path)
    assert(allowed_file(path, root) and path == root .. "/" .. relative, instructions)
    assert(type(entry.sha256) == "string" and #entry.sha256 == 64 and entry.sha256:match("^[0-9a-f]+$"), instructions)
    files[relative], hashes[path] = path, entry.sha256
    table.insert(command, path)
  end
  for _, name in ipairs({ "static/markdown/markdown-it.min.js", "static/katex/katex.min.js",
    "static/katex/katex.min.css", "static/mermaid/mermaid.min.js", "static/markdown/markdown-it-emoji.min.js" }) do
    assert(files[name], instructions)
  end
  local result = vim.system(command):wait()
  assert(result.code == 0, instructions)
  local count = 0
  for record in result.stdout:gmatch("[^%z]+") do
    local digest, path = record:sub(1, 64), record:sub(67)
    assert(hashes[path] == digest, "Markdown preview asset verification failed. " .. instructions)
    count = count + 1
  end
  assert(count == #command - 3, instructions)
  return files
end

function M.setup()
  if installed then return end
  local server = require("livepreview.server")
  local handler = server.handler
  local utils = require("livepreview.utils")
  local static = assert(vim.uv.fs_realpath(utils.get_plugin_path() .. "/static"))
  local routes, serve, respond = server.Server.routes, handler.serve_file, handler.send_http_response
  local rejected = setmetatable({}, { __mode = "k" })
  local assets_by_path
  local new = server.Server.new
  server.Server.new = function(self, webroot)
    assets_by_path = checked_assets()
    return new(self, webroot)
  end

  handler.send_http_response = function(client, status, content_type, body, headers)
    headers = headers or {}
    local address = client:getsockname()
    headers["Content-Security-Policy"] = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
      .. "img-src 'self' data:; font-src 'self' data:; connect-src 'self' ws://127.0.0.1:" .. address.port
      .. "; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
    headers["X-Content-Type-Options"] = "nosniff"
    headers["Referrer-Policy"] = "no-referrer"
    return respond(client, status, content_type, body, headers)
  end

  local function deny(client)
    rejected[client] = true
    handler.send_http_response(client, "403 Forbidden", "text/plain", "Forbidden")
    return { path = false, forbidden = true }
  end

  handler.request = function(client, data)
    local headers = {}
    for line in data:gmatch("[^\r\n]+") do
      local name, value = line:match("^([^: ]+):%s*(.-)%s*$")
      if name then
        name = name:lower()
        if headers[name] then return deny(client) end
        headers[name] = value
      end
    end
    local address = client:getsockname()
    local host = "127.0.0.1:" .. address.port
    local origin = "http://" .. host
    local target = data:match("^GET ([^%s]+) HTTP/1%.1\r\n")
    local websocket = headers.upgrade and headers.upgrade:lower() == "websocket"
    if not target or target:sub(1, 1) ~= "/" or headers.host ~= host
      or (headers.origin and headers.origin ~= origin)
      or (websocket and headers.origin ~= origin)
      or headers["sec-fetch-site"] == "cross-site" then
      return deny(client)
    end
    if websocket then
      local key = headers["sec-websocket-key"] or ""
      local connection = "," .. (headers.connection or ""):lower():gsub("%s", "") .. ","
      if #key ~= 24 or not key:match("^[A-Za-z0-9+/]+==$")
        or headers["sec-websocket-version"] ~= "13" or not connection:find(",upgrade,", 1, true) then
        return deny(client)
      end
      server.websocket.handshake(client, "Sec-WebSocket-Key: " .. key .. "\r\n")
      return
    end
    return { path = vim.uri_decode(target:match("^[^?]*")),
      if_none_match = headers["if-none-match"], accept = headers.accept or "" }
  end

  server.Server.routes = function(self, path)
    if type(path) ~= "string" or path:find("[%z\1-\31\\]") then return false end
    path = path:gsub("/+", "/")
    for component in path:gmatch("[^/]+") do
      if component:sub(1, 1) == "." then return false end
    end
    local relative = path:match("^/live%-preview%.nvim/(.+)$")
    if relative and (relative == "static/markdown/markdown-it.min.js"
      or relative == "static/markdown/markdown-it-emoji.min.js"
      or relative:sub(1, 13) == "static/katex/"
      or (relative:sub(1, 15) == "static/mermaid/" and relative ~= "static/mermaid/main.js")) then
      return assets_by_path and assets_by_path[relative] or false
    end
    local file = vim.uv.fs_realpath(routes(self, path))
    if not file then return false end
    local root = path:sub(1, 26) == "/live-preview.nvim/static/" and static or vim.uv.fs_realpath(self.webroot)
    if not allowed_file(file, root, root ~= static and assets or nil) then return false end
    return file
  end

  handler.serve_file = function(client, file, if_none_match, accept)
    if rejected[client] then rejected[client] = nil; return end
    if not file then
      -- Rejected requests have already sent a response. Otherwise reject routes
      -- outside the preview root, including symlinks and plugin source files.
      if not client:is_closing() then
        handler.send_http_response(client, "403 Forbidden", "text/plain", "Forbidden")
      end
      return
    end
    if file == static .. "/markdown/main.js" or file == static .. "/mermaid/main.js"
      or file == static .. "/markdown/markdown-it-katex.js" then
      utils.async_read_file(file, function(_, body)
        if not body then return handler.send_http_response(client, "404 Not Found", "text/plain", "Not found") end
        body = body:gsub("html:%s*true", "html: false", 1)
        body = body:gsub("md%.use%(markdownitEmoji%);", "md.use(markdownitEmoji.full || markdownitEmoji);")
        body = body:gsub("securityLevel:%s*'loose'", "securityLevel: 'strict'")
        -- The adapter's unexpected-error fallback must also escape source text.
        body = body:gsub("%${content}", [[${content.replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';')}]])
        handler.send_http_response(client, "200 OK", "text/javascript", body)
      end)
      return
    end
    -- SVG images may be served, but never wrapped into an executable HTML page.
    if file:lower():match("%.svg$") then accept = "image/svg+xml" end
    return serve(client, file, if_none_match, accept)
  end

  local send_json = server.websocket.send_json
  server.websocket.send_json = function(client, message)
    if message.filepath then
      local preview = package.loaded.livepreview
      local root = preview and preview.serverObj and vim.uv.fs_realpath(preview.serverObj.webroot)
      if not allowed_file(vim.fs.normalize(message.filepath), root, documents)
        or not allowed_file(vim.uv.fs_realpath(message.filepath), root, documents) then return end
    end
    return send_json(client, message)
  end
  installed = true
end

return M
