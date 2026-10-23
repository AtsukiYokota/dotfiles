-- Loaded by nvim-smoke.lua with no external formatter installed.
-- Test the editor adapter's input/output contract; the Python suite tests the CLI.
local original_system, original_notify = vim.system, vim.notify
local original_executable = vim.fn.executable
local errors, requests = {}, {}
local response = { code = 0, stdout = "value = 1\n", stderr = "" }
local available = true
local ok, err = xpcall(function()
  -- A fresh buffer avoids reusing the empty named buffer from the preceding test.
  vim.api.nvim_set_current_buf(vim.api.nvim_create_buf(true, false))
  vim.bo.filetype = "python"
  vim.bo.endofline = true
  vim.api.nvim_buf_set_lines(0, 0, -1, false, { "value=1" })
  vim.fn.executable = function(name)
    if name == "ros-format" then return available and 1 or 0 end
    return original_executable(name)
  end
  vim.notify = function(message, level)
    table.insert(errors, { message = message, level = level })
  end
  vim.system = function(command, options)
    if command[1] ~= "ros-format" then return original_system(command, options) end
    table.insert(requests, { command = command, options = options })
    return { wait = function() return response end }
  end
  vim.cmd.RosFormat()
  assert(vim.api.nvim_get_current_line() == "value = 1")
  assert(vim.bo.modified, "RosFormat must update the buffer without saving it")
  assert(vim.deep_equal(requests[1].command, {
    "ros-format", "--language", "python", "--stdin", "--filename", "buffer.py",
  }), "Unexpected formatter arguments: " .. vim.inspect(requests[1].command))
  assert(requests[1].options.stdin == "value=1\n", "Unexpected stdin: " .. vim.inspect(requests[1].options.stdin))
  response = { code = 2, stdout = "corrupt output", stderr = "formatter failed" }
  vim.cmd.RosFormat()
  assert(vim.api.nvim_get_current_line() == "value = 1", "Failed format changed the buffer")
  assert(errors[#errors].message == "formatter failed")
  available = false
  local count = #requests
  vim.cmd.RosFormat()
  assert(#requests == count, "Missing formatter should not launch a subprocess")
  assert(errors[#errors].message:find("ros%-format is missing"))
  available = true
  vim.bo.filetype = "markdown"
  vim.cmd.RosFormat()
  assert(#requests == count, "Unsupported filetype should not launch a formatter")
  assert(errors[#errors].message:find("supports C, C%+%+ and Python"))
  vim.bo.modified = false
end, debug.traceback)
vim.system, vim.notify, vim.fn.executable = original_system, original_notify, original_executable
if not ok then error(err) end
