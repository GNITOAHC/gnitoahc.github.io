---
title: Daemonizing a process in C
date: 2024-11-11
description: What is daemonizing a process and how to do it in C.
readTime: 4 min read
tags: ['C/C++']
type: writing
---

# Daemonizing a Process

Daemonizing a process means to make a process run in the background without any controlling terminal. This is useful for long-running processes that need to run continuously without user intervention, such as services, background tasks, or system monitoring tools.

When a process is daemonized, it detaches itself from a controlling terminal and can prevents user's input/output or terminal closure.

## Unix Session, Process Group, and Process

In Unix, understanding how processes interact with sessions and process groups is essential to creating a daemon.

1.  A **process** is an instance of a running program. Each process has a unique process ID (PID) and runs in its own memory space. Processes can create child processes by forking.

2.  A **progcess group** is a collection is a collection of one or more processes. Each process group has a unique process group ID (PGID). Process groups are commonly used for job control in shells. For instance, when you run a command in the shell, the shell often places that command and any subprocesses it spawns into the same process group, allowing you to send signals (e.g., `SIGSTOP`, `SIGCONT`, `SIGTERM`) to all processes in the group at once.

3.  A **session** is a collection of one or more process groups. Each session has a unique session ID (SID). The first process to open a terminal becomes the session leader. Process within that session can interact with the terminal until they detach from it or it is closed. Sessions are used to manage related groups of processes, especially those needing terminal input/output control.

## Checking Information of a Process

- `getpid()`: Returns the PID of the current process.
- `getpgid(pid_t pid)`: Returns the PGID of the process with the given PID.
- `getsid(pid_t pid)`: Returns the SID of the process with the given PID.

Below is a simple C program that prints the PID, PGID, and SID of a process.

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main () {
    int pid = fork();
    if (pid < 0) { exit(EXIT_FAILURE); }
    if (pid > 0) {
        printf("Parent process, pid = %d, process group id = %d, session id = %d\n", getpid(),
               getpgid(getpid()), getsid(getpid()));
        exit(EXIT_SUCCESS);
    }
    printf("Child process, pid = %d, process group id = %d, session id = %d\n", getpid(),
           getpgid(getpid()), getsid(getpid()));
    return 0;
}
```

Output:

```
Parent process, pid = 50511, process group id = 50511, session id = 2834
Child process, pid = 50528, process group id = 50511, session id = 2834
```

## Concept of Daemonizing

To fully daemonize a process, we eventually want to run a new process under a new session and process group that is detached from the terminal.

**Diagram Explanation:**

```
Initial Process (Parent)
    |
    |--- Fork 1
    |
Child Process (Detached, Session Leader)
    |
   setsid() ---> Becomes session leader, detached from terminal
    |
    |--- Fork 2
    |
Grandchild Process (Daemon, not a session leader)
```

1.  First fork:
    - The parent process creates a child and exits. This ensures that the child process is detached from the parent and can call setsid() to create a new session.
    - The child becomes the session leader and is detached from the terminal.

2.  `setsid()`:
    - The child process calls `setsid()` to create a new session. This makes the child the session leader and the process group leader of a new process group.
    - The child process is now detached from the terminal and can run as a daemon while it still has the potential to acquire a new controlling terminal.

3.  Second fork:
    - The session leader forks again and the child (grandchild) becomes the final daemon process.
    - The grandchild is not a session leader, ensuring it cannot acquire a controlling terminal under any circumstances.

> `setsid()` creates a new session if the calling process is not a process group leader. The calling process is the leader of the new session (i.e., its session ID is made the same as its process ID). The calling process also becomes the process group leader of a new process group in the session (i.e., its process group ID is made the same as its process ID).
>
> The calling process will be the only process in the new process group and in the new session.
>
> Initially, the new session has no controlling terminal. For details of how a session acquires a controlling terminal, see [credentials(7)](https://man7.org/linux/man-pages/man7/credentials.7.html)
>
> https://man7.org/linux/man-pages/man2/setsid.2.html

## Daemonizing a Process in C

First, let's do the first fork to detach the child from the parent process.

```c
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main(void) {
    int pid = fork();
    if (pid < 0) { exit(EXIT_FAILURE); } /* Exit if fork() fails */
    if (pid > 0) { exit(EXIT_SUCCESS); } /* Exit for the parent process */

    /* Everything below is for the child process */
}
```

Secondly, call `setsid()` to create a new session and detach the child process from the terminal.

```c
    /* Everything below is for the child process */

    if (setsid() < 0) { exit(EXIT_FAILURE); }

    /* Second fork, to prevent the process from acquiring a terminal */
    pid = fork();
    if (pid < 0) { exit(EXIT_FAILURE); } /* Exit if fork() fails */
    if (pid > 0) { exit(EXIT_SUCCESS); } /* Exit for the child process */

    /* Below is the code that will be executed by the grandchild process */
```

Finally, the process is now a daemon and can run in the background.

```c
    /* Below is the code that will be executed by the grandchild process */

    /* Close standard file descriptors. */
    close(STDIN_FILENO);
    close(STDOUT_FILENO);
    close(STDERR_FILENO);

    int fd =
        open("./mydaemon.log", O_RDWR | O_CREAT, 0600);
    if (fd != -1) {
        dup2(fd, STDOUT_FILENO);
        dup2(fd, STDERR_FILENO);
        close(fd);
    }
    dprintf(STDOUT_FILENO, "Running in the background...\n");
```

**Full Code:**

```c
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main () {
    int pid = fork();
    if (pid < 0) { exit(EXIT_FAILURE); } /* Exit if fork() fails */
    if (pid > 0) { exit(EXIT_SUCCESS); } /* Exit for the parent process */

    if (setsid() < 0) { exit(EXIT_FAILURE); }

    /* Second fork, to prevent the process from acquiring a terminal */
    pid = fork();
    if (pid < 0) { exit(EXIT_FAILURE); } /* Exit if fork() fails */
    if (pid > 0) { exit(EXIT_SUCCESS); } /* Exit for the child process */

    /* Below is the code that will be executed by the grandchild process */

    /* Close standard file descriptors. */
    close(STDIN_FILENO);
    close(STDOUT_FILENO);
    close(STDERR_FILENO);

    int fd =
        open("./mydaemon.log", O_RDWR | O_CREAT, 0600);
    if (fd != -1) {
        dup2(fd, STDOUT_FILENO);
        dup2(fd, STDERR_FILENO);
        close(fd);
    }

    dprintf(STDOUT_FILENO, "Parent is cdw %d\n", getppid());
    return 0;
}
```
