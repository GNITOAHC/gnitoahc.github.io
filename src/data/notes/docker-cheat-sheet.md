---
title: Docker Cheat Sheet
date: 2024-09-16
lastEdit: 2025-06-14
description: Docker commands and tips
readTime: 2 min read
tags: ['Docker']
type: writing
---

# Docker Basics

![docker](/images/docker-cheat-sheet/docker.png)
source: [cto.ai](https://cto.ai/blog/docker-image-vs-container-vs-dockerfile/)

**Docker** is a platform for developers and sysadmins to develop, deploy, and run applications with containers.

- **Container**: A container is a standard unit of software that packages up code and all its dependencies so the application runs quickly and reliably from one computing environment to another.
- **Image**: An image is a read-only template with instructions for creating a Docker container.
- **Dockerfile**: A Dockerfile is a text document that contains all the commands a user could call on the command line to assemble an image.

**General Commands**

- `docker --version` - Show the Docker version information
- `docker info` - Display system-wide information
- `docker --help` - Show help
- `docker system df` - Show Docker disk usage

## Images

**Build**

- `docker build -t <image_name> .` - Build an image from a Dockerfile
  - `-t` flag is used to tag the image with a name
  - `.` is the path to the Dockerfile
- `docker build -t <image_name> -f <Dockerfile_name> .` - Build an image from a specific Dockerfile
- `docker build -t <image_name> --no-cache .`
  - `--no-cache` flag can be used to build the image without cache, for more info check FreeCodeCamp's tutorial [here](https://www.freecodecamp.org/news/docker-cache-tutorial/).
- `docker buildx prune` - Remove build cache

**Manage**

- `docker images` - List all images
- `docker image rm <image_id>` - Remove an image
  - Alias: `docker rmi <image_id>`
- `docker image prune` - Remove all dangling images
  - Dangling images are images that have no tag and are not used by any container
- `docker image prune -a` - Remove all images that are not used by any container
- `docker pull <image_name>` - Pull an image from the registry
  - _e.g._: Getting IoTDB official image `docker pull apache/iotdb:1.0.1-standalone`

## Containers

**Create and Run**

- `docker run --name <container_name> <image_name>` - Create and run a container
- `docker run -p <host_port>:<container_port> <image_name>` - Map a host port to a container port
- `docker run -d <image_name>` - Run a container in detached mode (background)

> `<image_name>` should always be the last argument in the command.

**Start and Stop**

- `docker start <container_id>` - Start a container
- `docker stop <container_id>` - Stop a container

**Manage**

- `docker ps` - List all running containers
- `docker ps -a` - List all containers (running and stopped)
- `docker rm <container_id>` - Remove a container
- `docker container prune` - Remove all stopped containers
- `docker container stats` - Display a live stream of container(s) resource usage statistics
- `docker logs <container_id>` - Fetch the logs of a container
- `docker exec -it <container_id> CONTAINER COMMANDS` - Execute a command in a running container
  - `-it` flags are used to open an interactive terminal
  - `bash` is the command to execute
  - _e.g._: `docker exec -it <container_id> bash`
