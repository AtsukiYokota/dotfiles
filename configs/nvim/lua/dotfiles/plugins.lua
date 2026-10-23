return {
  {
    "ellisonleao/gruvbox.nvim",
    lazy = false,
    priority = 1000,
    config = function()
      vim.opt.termguicolors = true
      vim.opt.background = "dark"
      require("gruvbox").setup({ transparent_mode = false })
      vim.cmd.colorscheme("gruvbox")
    end,
  },
  {
    "nvim-lualine/lualine.nvim",
    lazy = false,
    opts = {
      options = {
        theme = "gruvbox",
        icons_enabled = false,
        component_separators = { left = "", right = "" },
        section_separators = { left = "", right = "" },
      },
      sections = {
        lualine_a = { "mode" }, lualine_b = { "branch", "filename" }, lualine_c = {},
        lualine_x = { "fileformat", "encoding", "filetype" }, lualine_y = { "progress" }, lualine_z = { "location" },
      },
    },
  },
  {
    "lewis6991/gitsigns.nvim",
    event = { "BufReadPre", "BufNewFile" },
    opts = {},
    init = function() vim.opt.updatetime = 250 end,
  },
  {
    "brianhuster/live-preview.nvim",
    cmd = { "LivePreview" },
    config = function()
      require("livepreview.config").set({ address = "127.0.0.1", dynamic_root = true, picker = "vim.ui.select" })
    end,
  },
  { "aklt/plantuml-syntax", ft = { "plantuml" } },
  {
    "lervag/vimtex",
    -- VimTeX handles its own filetype loading; no compiler until requested.
    lazy = false,
    init = function()
      require("dotfiles.tex_preview").setup()
    end,
  },
}
