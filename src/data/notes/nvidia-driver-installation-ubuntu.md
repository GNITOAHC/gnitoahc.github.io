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

# Troubleshooting

If running `nvidia-smi` gives this error:

```
NVIDIA-SMI has failed because it couldn't communicate with the NVIDIA driver.
Make sure that the latest NVIDIA driver is installed and running.
```

1. Check the version of the driver `ls /usr/src | grep nvidia`. This will give you the version of the driver, e.g. `nvidia-535.309.01`.
2. Install the `dkms` package `sudo apt-get install dkms`.
3. Install the correct correct version with `dkms`: `sudo dkms install -m nvidia -v 535.309.01`.

If error still occurs, e.g.

```
Error! Your kernel headers for kernel 6.8.0-117-generic cannot be found at /lib/modules/6.8.0-117-generic/build or /lib/modules/6.8.0-117-generic/source.
Please install the linux-headers-6.8.0-117-generic package or use the --kernelsourcedir option to tell DKMS where it's located.
```

Just install the kernel header: `sudo apt install linux-headers-6.8.0-117-generic`.
