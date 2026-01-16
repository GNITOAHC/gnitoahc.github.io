---
title: Nvidia Driver Installation on Ubuntu
date: 2025-10-3
description: Installation of nvidia driver
readTime: 1 min read
tags: ['Ubuntu']
type: note
---

# Nvidia Driver Installation

1. Check if the driver is already installed by running `nvidia-smi`. To remove the driver, run `sudo apt purge nvidia*` followed by `sudo apt autoremove`.
2. First, run `sudo apt update`.
3. Install the correct Linux headers `sudo apt install linux-headers-$(uname -r)`.
4. Install ubuntu-drivers `sudo apt install ubuntu-drivers-common`.
5. Install the recommended driver from `ubuntu-drivers devices`, e.g. `sudo apt install nvidia-driver-550`.
6. Remember to reboot the system.
