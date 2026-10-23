local M = {}

-- Servers inherit the shell's ROS/PYTHONPATH; no ROS release is fixed here.
-- The installer manages executables. The editor never installs language servers.
M.servers = {
  clangd = {
    cmd = { "clangd", "--background-index", "--clang-tidy" },
    filetypes = { "c", "cpp", "objc", "objcpp", "cuda" },
    root_markers = { ".clangd", "compile_commands.json", "compile_flags.txt", ".git" },
  },
  basedpyright = {
    cmd = { "basedpyright-langserver", "--stdio" },
    filetypes = { "python" },
    root_markers = { "pyrightconfig.json", "pyproject.toml", "setup.py", "setup.cfg", ".git" },
    settings = { basedpyright = { analysis = { typeCheckingMode = "standard", diagnosticMode = "openFilesOnly" } } },
  },
  cmake = {
    cmd = { "cmake-language-server" },
    filetypes = { "cmake" },
    root_markers = { "CMakePresets.json", "CMakeLists.txt", ".git" },
    init_options = { buildDirectory = "build" },
  },
  rust_analyzer = {
    cmd = { "rust-analyzer" },
    filetypes = { "rust" },
    root_markers = { "Cargo.toml", "rust-project.json", ".git" },
  },
  texlab = {
    cmd = { "texlab" },
    filetypes = { "tex", "plaintex", "bib" },
    root_markers = { ".latexmkrc", "latexmkrc", ".git" },
  },
  bashls = { cmd = { "bash-language-server", "start" }, filetypes = { "sh", "bash" }, root_markers = { ".git" } },
  jsonls = { cmd = { "vscode-json-language-server", "--stdio" }, filetypes = { "json", "jsonc" }, root_markers = { "package.json", ".git" } },
  yamlls = { cmd = { "yaml-language-server", "--stdio" }, filetypes = { "yaml" }, root_markers = { ".git" } },
  html = { cmd = { "vscode-html-language-server", "--stdio" }, filetypes = { "html" }, root_markers = { "package.json", ".git" } },
  cssls = {
    cmd = { "vscode-css-language-server", "--stdio" },
    filetypes = { "css", "scss", "less" },
    root_markers = { "package.json", ".git" },
    init_options = { provideFormatter = true },
    -- The server expects objects when requesting workspace/configuration.
    settings = {
      css = { validate = true, lint = vim.empty_dict() },
      scss = { validate = true, lint = vim.empty_dict() },
      less = { validate = true, lint = vim.empty_dict() },
    },
  },
  ts_ls = {
    cmd = { "typescript-language-server", "--stdio" },
    filetypes = { "javascript", "javascriptreact", "typescript", "typescriptreact" },
    root_markers = { "tsconfig.json", "jsconfig.json", "package.json", ".git" },
  },
}

local server_modules = {
  clangd = "cpp", basedpyright = "python", cmake = "python", rust_analyzer = "rust", texlab = "latex",
  bashls = "node", jsonls = "node", yamlls = "node", html = "node", cssls = "node", ts_ls = "node",
}

local function completion_clients(bufnr)
  return vim.lsp.get_clients({ bufnr = bufnr, method = "textDocument/completion" })
end

local function sync_word_completion(bufnr)
  if vim.fn.exists("+autocomplete") == 1 and vim.api.nvim_buf_is_valid(bufnr) then
    vim.bo[bufnr].autocomplete = vim.bo[bufnr].buftype == "" and #completion_clients(bufnr) == 0
  end
end

local function enable_completion(client, bufnr)
  -- autotrigger alone only reacts to server punctuation (often just ".").
  -- Let Neovim's native debounce/cancellation also handle ordinary identifiers.
  local provider = client.server_capabilities.completionProvider
  if type(provider) ~= "table" then
    provider = {}
    client.server_capabilities.completionProvider = provider
  end
  local triggers = provider.triggerCharacters or {}
  local seen = {}
  for _, character in ipairs(triggers) do
    seen[character] = true
  end
  for character in ("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789"):gmatch(".") do
    if not seen[character] then
      table.insert(triggers, character)
    end
  end
  provider.triggerCharacters = triggers
  if vim.fn.exists("+autocomplete") == 1 then
    -- Do not let buffer-word completion compete with the LSP popup.
    vim.bo[bufnr].autocomplete = false
  end
  vim.lsp.completion.enable(true, client.id, bufnr, { autotrigger = true })
end

function M.setup()
  require("dotfiles.ros_format").setup()
  for name, config in pairs(M.servers) do
    config.workspace_required = false
    vim.lsp.config(name, config)
    if vim.fn.executable(config.cmd[1]) == 1 then
      vim.lsp.enable(name)
    end
  end
  vim.opt.completeopt = { "menu", "menuone", "noselect" }
  vim.opt.complete = { ".", "w", "b" }
  if vim.fn.exists("+autocomplete") == 1 then
    -- Neovim 0.12: provide useful completion in text/config files without an LSP.
    vim.opt.autocomplete = true
    vim.opt.autocompletedelay = 150
  end
  local group = vim.api.nvim_create_augroup("DotfilesLsp", { clear = true })
  vim.api.nvim_create_autocmd({ "BufEnter", "FileType" }, {
    group = group,
    callback = function(event)
      -- New buffers can inherit the previous buffer's local option values.
      sync_word_completion(event.buf)
    end,
  })
  vim.api.nvim_create_autocmd("LspAttach", {
    group = group,
    callback = function(event)
      local client = vim.lsp.get_client_by_id(event.data.client_id)
      if client and client:supports_method("textDocument/completion") then
        enable_completion(client, event.buf)
      end
      local opts = { buffer = event.buf, silent = true }
      vim.keymap.set("n", "gd", vim.lsp.buf.definition, opts)
      vim.keymap.set("n", "gD", vim.lsp.buf.declaration, opts)
      vim.keymap.set("n", "gr", vim.lsp.buf.references, opts)
      vim.keymap.set("n", "K", vim.lsp.buf.hover, opts)
      vim.keymap.set("n", "<Leader>rn", vim.lsp.buf.rename, opts)
      vim.keymap.set({ "n", "x" }, "<Leader>ca", vim.lsp.buf.code_action, opts)
    end,
  })
  vim.api.nvim_create_autocmd("LspDetach", {
    group = group,
    callback = function(event)
      vim.schedule(function()
        sync_word_completion(event.buf)
      end)
    end,
  })
  local function request_completion()
    if #completion_clients(0) > 0 then
      vim.lsp.completion.get()
    else
      vim.api.nvim_feedkeys(vim.keycode("<C-n>"), "n", false)
    end
  end
  vim.keymap.set("i", "<C-Space>", request_completion, { silent = true, desc = "Request completion" })
  -- Ctrl-Space may be consumed by an IME; tmux captures Ctrl-x and Ctrl-o.
  vim.keymap.set("i", "<C-g><Space>", request_completion,
    { silent = true, desc = "Request completion (terminal fallback)" })
  vim.keymap.set("i", "<C-g><C-f>", "<C-x><C-f>", { silent = true, desc = "Complete a file path" })
  -- One completion mapping per key; normal-mode window mappings stay untouched.
  vim.keymap.set("i", "<Tab>", function()
    return vim.fn.pumvisible() == 1 and "<C-n>" or "<Tab>"
  end, { expr = true })
  vim.keymap.set("i", "<S-Tab>", function()
    return vim.fn.pumvisible() == 1 and "<C-p>" or "<S-Tab>"
  end, { expr = true })
  vim.keymap.set("i", "<CR>", function()
    return vim.fn.pumvisible() == 1 and vim.fn.complete_info().selected >= 0 and "<C-y>" or "<C-g>u<CR>"
  end, { expr = true })
  vim.api.nvim_create_user_command("Format", function()
    if not vim.bo.modifiable then
      vim.notify("This buffer is not modifiable", vim.log.levels.WARN)
      return
    end
    if vim.tbl_contains({ "c", "cpp", "python" }, vim.bo.filetype) then
      require("dotfiles.ros_format").format()
      return
    end
    local clients = vim.lsp.get_clients({ bufnr = 0, method = "textDocument/formatting" })
    if #clients == 0 then
      vim.notify("No formatter is attached for " .. vim.bo.filetype .. "; run :DotfilesLsp to check installed servers",
        vim.log.levels.WARN)
      return
    end
    -- Apply exactly one formatter; competing servers can undo each other's edits.
    table.sort(clients, function(a, b) return a.name < b.name end)
    vim.lsp.buf.format({ id = clients[1].id, async = false, timeout_ms = 5000 })
  end, { desc = "Format this buffer: ROS rules for C/C++/Python, attached LSP for other languages" })
  vim.api.nvim_create_user_command("ClangFormat", function()
    if vim.fn.executable("clang-format") == 0 then
      vim.notify("clang-format is not installed", vim.log.levels.ERROR)
      return
    end
    local result = vim.system({
      "clang-format", "--style=file", "--fallback-style=Google", "--assume-filename=" .. vim.api.nvim_buf_get_name(0),
    }, { text = true, stdin = table.concat(vim.api.nvim_buf_get_lines(0, 0, -1, false), "\n") .. "\n" }):wait()
    if result.code ~= 0 then
      vim.notify(result.stderr or "clang-format failed", vim.log.levels.ERROR)
      return
    end
    local view = vim.fn.winsaveview()
    local lines = vim.split((result.stdout or ""):gsub("\n$", ""), "\n", { plain = true })
    vim.api.nvim_buf_set_lines(0, 0, -1, false, lines)
    vim.fn.winrestview(view)
  end, { desc = "Run clang-format using project style, falling back to Google" })
  vim.api.nvim_create_user_command("DotfilesLsp", function()
    local attached = {}
    for _, client in ipairs(vim.lsp.get_clients({ bufnr = 0 })) do
      attached[client.name] = true
    end
    local servers = {}
    for name, config in pairs(M.servers) do
      local executable = vim.fn.exepath(config.cmd[1])
      local status = attached[name] and "attached" or executable ~= "" and "available (not attached)" or "missing"
      table.insert(servers, string.format("%s: %s | module: %s | %s", name, status, server_modules[name],
        executable ~= "" and executable or config.cmd[1]))
    end
    table.sort(servers)
    local lines = { "LSP for current buffer (filetype: " .. (vim.bo.filetype ~= "" and vim.bo.filetype or "none") .. ")" }
    table.insert(lines, "Completion: " .. (#completion_clients(0) > 0 and "LSP" or "buffer words (no completion-capable LSP attached)"))
    vim.list_extend(lines, servers)
    table.insert(lines, "Only servers for this filetype attach. Install missing servers with their listed module.")
    vim.notify(table.concat(lines, "\n"))
  end, { desc = "Show language server executables, module names and current-buffer attachment" })
end

return M
