-- Local PNG preview: one compiler and one reloadable viewer per saved buffer.
local M = {}
local sessions = {}

local function notify(message, level)
  vim.notify("PlantUML: " .. message, level or vim.log.levels.INFO)
end

function M.stop(buffer)
  buffer = buffer or vim.api.nvim_get_current_buf()
  local session = sessions[buffer]
  if not session then return end
  sessions[buffer] = nil
  if session.compiler then session.compiler:kill(15) end
  if session.viewer then vim.fn.jobstop(session.viewer) end
  vim.fn.delete(session.directory, "rf")
end

local function view(buffer, session)
  if session.viewer then return end
  session.viewer = vim.fn.jobstart({
    "feh", "--reload", "1", "--scale-down", "--keep-zoom-vp", "--title", "PlantUML preview", "--", session.image,
  }, {
    on_exit = function(_, code)
      if sessions[buffer] ~= session then return end
      session.viewer = nil
      M.stop(buffer)
      if code ~= 0 then notify("Viewer exited; check that DISPLAY points to a working desktop or WSLg.", vim.log.levels.ERROR) end
    end,
  })
  if session.viewer <= 0 then
    session.viewer = nil
    M.stop(buffer)
    notify("Could not start feh.", vim.log.levels.ERROR)
  end
end

local function render(buffer)
  local session = sessions[buffer]
  if not session then return end
  if session.compiler then
    session.pending = true
    return
  end
  session.pending = false
  local ok, process = pcall(vim.system, { "dotfiles-plantuml-render", session.source, session.image },
    { text = true, timeout = 65000 }, function(result)
      vim.schedule(function()
        if sessions[buffer] ~= session then return end
        session.compiler = nil
        if result.code == 0 then
          view(buffer, session)
        else
          notify((result.stderr or "Compilation failed; the last successful preview is retained."):sub(1, 4000), vim.log.levels.ERROR)
        end
        if session.pending then render(buffer) end
      end)
    end)
  if not ok then
    notify(tostring(process), vim.log.levels.ERROR)
    return
  end
  session.compiler = process
end

function M.start()
  local buffer = vim.api.nvim_get_current_buf()
  local source = vim.api.nvim_buf_get_name(buffer)
  if vim.bo[buffer].buftype ~= "" or source == "" then
    notify("Give this PlantUML buffer a filename first.", vim.log.levels.ERROR)
    return
  end
  if vim.bo[buffer].filetype ~= "plantuml" then
    notify("Open a .puml / .pu file, or use :setfiletype plantuml first.", vim.log.levels.ERROR)
    return
  end
  for _, command in ipairs({ "plantuml", "dotfiles-plantuml-render", "feh" }) do
    if vim.fn.executable(command) == 0 then
      notify(command .. " is missing; install or update the diagrams module.", vim.log.levels.ERROR)
      return
    end
  end
  if not vim.env.DISPLAY or vim.env.DISPLAY == "" then
    notify("A graphical desktop or WSLg is required (DISPLAY is unset).", vim.log.levels.ERROR)
    return
  end
  local saved, error = pcall(vim.cmd, "update")
  if not saved or vim.fn.filereadable(source) == 0 then
    notify("Could not save this buffer: " .. tostring(error or source), vim.log.levels.ERROR)
    return
  end
  if not sessions[buffer] then
    local directory = vim.fn.tempname() .. "-plantuml"
    vim.fn.mkdir(directory, "p", 448)
    sessions[buffer] = { source = source, directory = directory, image = directory .. "/preview.png" }
    notify("Live preview started. Saving rebuilds the diagram; :PlantumlStop stops it.")
  end
  render(buffer)
end

function M.setup()
  vim.api.nvim_create_user_command("PlantumlPreview", M.start, { desc = "Compile this PlantUML file and preview it live in feh" })
  vim.api.nvim_create_user_command("PlantumlStop", function() M.stop() end, { desc = "Stop this buffer's PlantUML preview" })
  local group = vim.api.nvim_create_augroup("DotfilesPlantumlPreview", { clear = true })
  vim.api.nvim_create_autocmd("BufWritePost", { group = group, callback = function(event)
    if sessions[event.buf] then
      if vim.api.nvim_buf_get_name(event.buf) ~= sessions[event.buf].source then M.stop(event.buf)
      else render(event.buf) end
    end
  end })
  vim.api.nvim_create_autocmd({ "BufWipeout", "BufFilePost" }, { group = group, callback = function(event) M.stop(event.buf) end })
  vim.api.nvim_create_autocmd("VimLeavePre", { group = group, callback = function()
    for buffer in pairs(sessions) do M.stop(buffer) end
  end })
end

return M
