# Compatibility function names; ROS 2 Lyrical C/C++ formatting uses ament_uncrustify.
# Explicit invocation writes files. Pass --check or --dry-run to preview changes.
clang_autoformat() {
  command ros-format --language cpp "$@"
}

recursive_clang_autoformat() {
  command ros-format --language cpp --recursive "$@"
}

pep8_autoformat() {
  command ros-format --language python "$@"
}

recursive_pep8_autoformat() {
  command ros-format --language python --recursive "$@"
}
