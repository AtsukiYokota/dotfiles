-- Run with the pinned Neovim, isolated HOME, and this repository's init.lua.
local function check()
  local preview = require("dotfiles.plantuml_preview")
  preview.setup()
  local root = vim.fn.tempname() .. " preview 日本語"
  vim.fn.mkdir(root, "p", 448)
  local source = root .. "/diagram with spaces.puml"
  local log = root .. "/events"
  local function write(path, content)
    vim.fn.writefile(vim.split(content, "\n", { plain = true }), path)
  end
  local prefix = "#!/usr/bin/env python3\nimport pathlib,sys,time\nlog=pathlib.Path(" .. string.format("%q", log) .. ")\n"
  write(root .. "/dotfiles-plantuml-render", prefix .. [[
with log.open('a') as handle: handle.write('render\n')
time.sleep(0.15)
pathlib.Path(sys.argv[2]).write_text(pathlib.Path(sys.argv[1]).read_text())
]])
  write(root .. "/feh", prefix .. [[
with log.open('a') as handle: handle.write('viewer\n' + sys.argv[-1] + '\n')
time.sleep(60)
]])
  write(root .. "/plantuml", "#!/bin/sh\nexit 0")
  for _, command in ipairs({ "dotfiles-plantuml-render", "feh", "plantuml" }) do vim.fn.setfperm(root .. "/" .. command, "rwx------") end
  local original_path, original_display = vim.env.PATH, vim.env.DISPLAY
  vim.env.PATH = root .. ":" .. original_path
  vim.env.DISPLAY = ":dotfiles-test"
  write(source, "@startuml\nA -> B: 日本語\n@enduml")
  vim.cmd.edit(vim.fn.fnameescape(source))
  vim.bo.filetype = "plantuml"
  local function events()
    return vim.fn.filereadable(log) == 1 and vim.fn.readfile(log) or {}
  end
  preview.start()
  assert(vim.wait(5000, function() return #events() >= 3 end), "initial preview did not start")
  local image = events()[3]
  assert(vim.fn.filereadable(image) == 1, "preview output missing")
  vim.api.nvim_buf_set_lines(0, 1, 2, false, { "A -> B: saved change" })
  vim.cmd.write()
  assert(vim.wait(5000, function()
    return vim.fn.filereadable(image) == 1 and table.concat(vim.fn.readfile(image), "\n"):find("saved change", 1, true) ~= nil
  end), "saving did not rebuild preview")
  assert(#vim.tbl_filter(function(event) return event == "viewer" end, events()) == 1, "save opened another viewer")
  preview.stop()
  assert(vim.fn.isdirectory(vim.fn.fnamemodify(image, ":h")) == 0, "stop did not clean temporary preview")
  local count = #events()
  vim.cmd.write()
  vim.wait(300, function() return false end)
  assert(#events() == count, "save compiled after stopping")
  vim.env.PATH, vim.env.DISPLAY = original_path, original_display
  vim.cmd.bwipeout({ bang = true })
  vim.fn.delete(root, "rf")
  print("PlantUML Neovim preview: start, save, viewer reuse, stop and cleanup passed")
end

local ok, error = xpcall(check, debug.traceback)
if not ok then
  io.stderr:write(tostring(error) .. "\n")
  vim.cmd("cquit 1")
end
