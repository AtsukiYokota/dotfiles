local M = {}

function M.format()
  local filetype = vim.bo.filetype
  if filetype ~= "c" and filetype ~= "cpp" and filetype ~= "python" then
    vim.notify("RosFormat supports C, C++ and Python buffers", vim.log.levels.ERROR)
    return
  end
  if vim.fn.executable("ros-format") == 0 then
    vim.notify("ros-format is missing; install the dotfiles shell and ros2 modules", vim.log.levels.ERROR)
    return
  end
  local name = vim.api.nvim_buf_get_name(0)
  if name == "" then
    name = "buffer." .. ({ c = "c", cpp = "cpp", python = "py" })[filetype]
  end
  local content = table.concat(vim.api.nvim_buf_get_lines(0, 0, -1, false), "\n")
    .. (vim.bo.endofline and "\n" or "")
  local result = vim.system({
    "ros-format", "--language", filetype == "python" and "python" or "cpp", "--stdin", "--filename", name,
  }, { text = true, stdin = content }):wait(120000)
  if result.code ~= 0 then
    vim.notify(result.stderr or "ROS formatting failed; buffer unchanged", vim.log.levels.ERROR)
    return
  end
  local output = result.stdout or ""
  local view = vim.fn.winsaveview()
  local lines = vim.split(output:gsub("\n$", ""), "\n", { plain = true })
  vim.api.nvim_buf_set_lines(0, 0, -1, false, lines)
  vim.bo.endofline = output:sub(-1) == "\n"
  vim.fn.winrestview(view)
end

function M.setup()
  vim.api.nvim_create_user_command("RosFormat", M.format, {
    desc = "Format this buffer with ROS 2 Jazzy rules (manual; use :write to save)",
  })
end

return M
