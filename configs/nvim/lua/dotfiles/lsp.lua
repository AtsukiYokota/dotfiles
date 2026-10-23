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
  cssls = { cmd = { "vscode-css-language-server", "--stdio" }, filetypes = { "css", "scss", "less" }, root_markers = { "package.json", ".git" } },
}

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
  local group = vim.api.nvim_create_augroup("DotfilesLsp", { clear = true })
  vim.api.nvim_create_autocmd("LspAttach", {
    group = group,
    callback = function(event)
      local client = vim.lsp.get_client_by_id(event.data.client_id)
      if client and client:supports_method("textDocument/completion") then
        vim.lsp.completion.enable(true, client.id, event.buf, { autotrigger = true })
      end
      local opts = { buffer = event.buf, silent = true }
      vim.keymap.set("n", "gd", vim.lsp.buf.definition, opts)
      vim.keymap.set("n", "gD", vim.lsp.buf.declaration, opts)
      vim.keymap.set("n", "gr", vim.lsp.buf.references, opts)
      vim.keymap.set("n", "K", vim.lsp.buf.hover, opts)
      vim.keymap.set("n", "<Leader>rn", vim.lsp.buf.rename, opts)
      vim.keymap.set({ "n", "x" }, "<Leader>ca", vim.lsp.buf.code_action, opts)
      vim.keymap.set("i", "<C-Space>", vim.lsp.completion.get, opts)
    end,
  })
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
    vim.lsp.buf.format({ async = false, timeout_ms = 5000 })
  end, { desc = "Format with an attached language server (manual only)" })
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
    local lines = {}
    for name, config in pairs(M.servers) do
      table.insert(lines, name .. ": " .. (vim.fn.executable(config.cmd[1]) == 1 and "available" or "missing " .. config.cmd[1]))
    end
    table.sort(lines)
    vim.notify(table.concat(lines, "\n"))
  end, { desc = "Show installed and missing language servers" })
end

return M
