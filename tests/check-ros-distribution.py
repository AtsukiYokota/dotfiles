#!/usr/bin/env python3
"""Build and communicate with installed ROS 2 Lyrical in a disposable workspace.

Run after sourcing /opt/ros/lyrical/setup.bash. Dependencies are installed by CI;
this script neither installs packages nor writes into the caller's home/workspace.
"""
from __future__ import annotations

import os
from pathlib import Path
import platform
import secrets
import signal
import subprocess
import sys
import tempfile
import time


PACKAGE = 'dotfiles_ros_smoke'


def run(command, environment, work, timeout=60):
    process = subprocess.Popen([str(part) for part in command], cwd=work,
                               env=environment, stdin=subprocess.DEVNULL,
                               stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                               text=True, start_new_session=True)
    try:
        output, _ = process.communicate(timeout=timeout)
        if process.returncode:
            raise AssertionError(f'{command} failed ({process.returncode}):\n{output}')
        return output
    finally:
        stop(process)


def stop(process):
    # Each test process owns a new process group, including any compiler children.
    try:
        os.killpg(process.pid, signal.SIGINT)
    except ProcessLookupError:
        pass
    try:
        process.wait(timeout=2)
    except subprocess.TimeoutExpired:
        pass
    try:
        os.killpg(process.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    process.wait(timeout=2)


def build_cpp(environment, work):
    package = work / 'src' / PACKAGE
    package.mkdir(parents=True)
    (package / 'package.xml').write_text(f'''<?xml version="1.0"?>
<package format="3">
  <name>{PACKAGE}</name><version>0.0.0</version>
  <description>Disposable ROS distribution integration check.</description>
  <maintainer email="noreply@example.invalid">Dotfiles CI</maintainer>
  <license>Apache-2.0</license>
  <buildtool_depend>ament_cmake</buildtool_depend>
  <depend>rclcpp</depend>
  <export><build_type>ament_cmake</build_type></export>
</package>
''', encoding='utf-8')
    (package / 'CMakeLists.txt').write_text(f'''cmake_minimum_required(VERSION 3.20)
project({PACKAGE} LANGUAGES CXX)
find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
add_executable({PACKAGE} main.cpp)
target_compile_features({PACKAGE} PRIVATE cxx_std_20)
target_link_libraries({PACKAGE} PRIVATE rclcpp::rclcpp)
install(TARGETS {PACKAGE} DESTINATION lib/${{PROJECT_NAME}})
ament_package()
''', encoding='utf-8')
    (package / 'main.cpp').write_text('''#include <algorithm>
#include <array>
#include <concepts>
#include <iostream>
#include <memory>
#include <span>
#include <rclcpp/rclcpp.hpp>

int main(int argc, char ** argv)
{
  static_assert(std::integral<int>);
  std::array<int, 2> values{42, 7};
  if (std::ranges::count(std::span<int>(values), 42) != 1) {
    return 2;
  }
  rclcpp::init(argc, argv);
  auto node = std::make_shared<rclcpp::Node>("dotfiles_cpp20_smoke");
  std::cout << "ROS_CPP20_OK " << node->get_name() << std::endl;
  node.reset();
  rclcpp::shutdown();
  return 0;
}
''', encoding='utf-8')
    run(['colcon', '--log-base', work / 'log', 'build', '--base-paths', package,
         '--build-base', work / 'build', '--install-base', work / 'install',
         '--event-handlers', 'console_cohesion+', '--cmake-args', '-DBUILD_TESTING=OFF'],
        environment, work, timeout=180)
    executable = work / 'install' / PACKAGE / 'lib' / PACKAGE / PACKAGE
    output = run([executable], environment, work, timeout=20)
    assert 'ROS_CPP20_OK dotfiles_cpp20_smoke' in output, output


def communication(environment, work, prefix):
    logs = {name: work / f'{name}.log' for name in ('listener', 'talker')}
    topic = '/dotfiles_smoke_' + secrets.token_hex(6)
    processes = []
    try:
        for name in ('listener', 'talker'):
            with logs[name].open('wb') as output:
                processes.append(subprocess.Popen(
                    [str(prefix / 'lib' / 'demo_nodes_cpp' / name),
                     '--ros-args', '-r', f'chatter:={topic}'], cwd=work,
                    env=environment, stdin=subprocess.DEVNULL, stdout=output,
                    stderr=subprocess.STDOUT, start_new_session=True))
        deadline = time.monotonic() + 12
        while time.monotonic() < deadline:
            received = logs['listener'].read_text(encoding='utf-8', errors='replace')
            if any('I heard:' in line and 'Hello World:' in line
                   for line in received.splitlines()):
                return
            if any(process.poll() is not None for process in processes):
                break
            time.sleep(0.1)
        details = '\n'.join(f'{name}:\n{path.read_text(errors="replace")}'
                            for name, path in logs.items())
        raise AssertionError('ROS talker/listener did not communicate within 12 seconds.\n' + details)
    finally:
        for process in reversed(processes):
            stop(process)


def main():
    if sys.platform != 'linux':
        raise SystemExit('Run on Ubuntu 26.04 after sourcing /opt/ros/lyrical/setup.bash.')
    release = platform.freedesktop_os_release()
    if release.get('ID') != 'ubuntu' or release.get('VERSION_ID') != '26.04':
        raise SystemExit('This integration check requires Ubuntu 26.04.')
    if os.environ.get('ROS_DISTRO') != 'lyrical' or os.environ.get('ROS_VERSION') != '2':
        raise SystemExit('Source /opt/ros/lyrical/setup.bash before running this check.')
    with tempfile.TemporaryDirectory(prefix='dotfiles-ros-distribution-') as temporary:
        work = Path(temporary)
        home = work / 'home'
        home.mkdir()
        environment = {**os.environ, 'HOME': str(home), 'ROS_HOME': str(home / '.ros'),
                       'ROS_LOG_DIR': str(work / 'ros-log'), 'PYTHONDONTWRITEBYTECODE': '1',
                       'ROS_DOMAIN_ID': str(secrets.randbelow(101) + 1),
                       'ROS_AUTOMATIC_DISCOVERY_RANGE': 'LOCALHOST'}
        for key in ('RMW_IMPLEMENTATION', 'ROS_LOCALHOST_ONLY', 'ROS_STATIC_PEERS', 'ROS_DISCOVERY_SERVER',
                    'FASTDDS_DEFAULT_PROFILES_FILE', 'FASTRTPS_DEFAULT_PROFILES_FILE',
                    'CYCLONEDDS_URI'):
            environment.pop(key, None)
        packages = set(run(['ros2', 'pkg', 'list'], environment, work).splitlines())
        assert {'rclcpp', 'rclpy', 'ament_cmake', 'demo_nodes_cpp'} <= packages, packages
        python_check = '''import rclpy
rclpy.init()
try:
    node = rclpy.create_node('dotfiles_python_smoke')
    print('ROS_PYTHON_OK ' + node.get_name())
    node.destroy_node()
finally:
    rclpy.shutdown()
'''
        output = run([sys.executable, '-c', python_check], environment, work, timeout=20)
        assert 'ROS_PYTHON_OK dotfiles_python_smoke' in output, output
        build_cpp(environment, work)
        prefix = Path(run(['ros2', 'pkg', 'prefix', 'demo_nodes_cpp'], environment, work).strip())
        communication(environment, work, prefix)
    print('ROS 2 Lyrical passed: rclpy, C++20 colcon build/run, and localhost talker/listener.')


if __name__ == '__main__':
    main()
