---
title: Keeping User Processes Alive with loginctl
date: 2026-07-09
description: What I learned about systemd-logind, user sessions, and linger after my process kept getting stopped.
tags: ['Linux']
type: writing
---

# Keeping User Processes Alive with `loginctl`

Most people who have touched Linux services know about `systemctl`. It starts services, stops services, checks status, enables things at boot, and generally feels like the front door of systemd.

I knew that part too. Most of the time, when I serve something on a VPS, I just log in as `root`, write a system service, run `systemctl enable --now ...`, and move on. It is not always the prettiest setup, but it is direct and predictable.

This time was different. I was trying some experiments on a machine where I only had normal user permission. No root. No writing files into `/etc/systemd/system`. No global service management. I started my process, detached it, logged out, and later found that it had stopped.

At first I thought I had made the usual mistake: bad command, wrong working directory, missing environment variable, maybe a network issue. But the pattern was too consistent. The process was fine while my login session was alive, and then it disappeared after the session went away.

That led me to `loginctl`.

## What `loginctl` Actually Controls

`loginctl` is the command-line tool for `systemd-logind`. While `systemctl` manages systemd units, `loginctl` is more about users, seats, and login sessions.

In day-to-day server usage, the important part is this:

- a **session** is created when a user logs in through SSH, a TTY, or a graphical login
- a **user manager** can run per-user systemd units
- `systemd-logind` decides what happens to user processes when sessions end

That last point was the missing piece for me. On a normal VPS where I am root, I usually manage long-running things as system services, so they are not tied to my SSH login. On a shared or restricted machine, I might only be able to run things as my own user. In that case, session lifetime starts to matter.

## Useful `loginctl` Commands

To see current login sessions:

```bash
loginctl list-sessions
```

Example output:

```text
SESSION     UID USER           SEAT  TTY  STATE  IDLE SINCE
    193 1000001 myuser         -     -    active no   -
     c1     126 gdm            seat0 tty1 active yes  23h ago

2 sessions listed.
```

The useful columns are:

- `SESSION`: the session ID used by other `loginctl` commands
- `UID`: the numeric user ID
- `USER`: the login name
- `SEAT`: the physical seat, mostly relevant for desktop systems; `-` means there is no seat attached
- `TTY`: the terminal attached to the session, such as `tty1`; `-` means there is no TTY shown in this table
- `STATE`: whether the session is currently usable, such as `active`, or being cleaned up, such as `closing`
- `IDLE`: whether logind thinks the session is idle
- `SINCE`: when the session became idle; `-` means there is no idle timestamp

In this example, `193` is my SSH login session. The user is `myuser`, the UID is `1000001`, and there is no physical seat because this is a remote login. The `c1` session belongs to `gdm`, which is the GNOME display manager. That one is attached to `seat0` and `tty1`, so it is the graphical login environment of the machine, not my SSH experiment.

To inspect my SSH session:

```bash
loginctl session-status 193
```

The output is much more useful:

```text
193 - myuser (1000001)
  Since: Thu 2026-07-09 14:51:44 CST; 30min ago
  State: active
 Leader: 41495 (sshd)
 Remote: 192.0.2.10
Service: sshd
   Type: tty
  Class: user
   Idle: no
   Unit: session-193.scope
         |-41495 "sshd: myuser [priv]"
         |-41705 "sshd: myuser@pts/0"
         |-41706 /usr/bin/bash -l
         |-43065 tmux new -s experiment
         |-47480 loginctl session-status 193
         `-47481 pager
```

This tells me the session came from `sshd`, the remote address is `192.0.2.10`, and the session is represented by `session-193.scope`. The process tree is the part I care about most. My shell and tmux session are children of this login session, so if the machine is configured to clean up user session processes on logout, this is the scope that matters.

Compare that with the graphical greeter session:

```bash
loginctl session-status c1
```

```text
c1 - gdm (126)
  Since: Wed 2026-07-08 15:41:06 CST; 23h ago
  State: active
 Leader: 2596 (gdm-session-wor)
   Seat: seat0; vc1
    TTY: tty1
 Remote: no
Service: gdm-launch-environment
   Type: x11
  Class: greeter
   Idle: yes since Wed 2026-07-08 15:46:07 CST (23h ago)
   Unit: session-c1.scope
         |-2596 "gdm-session-worker [pam/gdm-launch-environment]"
         |-2622 /usr/libexec/gdm-x-session "dbus-run-session -- gnome-session --autostart /usr/share/gdm/greeter/autostart"
         |-2626 /usr/lib/xorg/Xorg vt1 -displayfd 3 ...
         |-2743 /usr/bin/gnome-shell
         `-3042 /usr/libexec/ibus-engine-simple
```

This is also an active session, but it is not mine. `Class: greeter`, `Service: gdm-launch-environment`, `Seat: seat0`, and `TTY: tty1` all point to the local graphical login screen. It is useful context, but it is not where my SSH-started process lives.

To list users known to logind:

```bash
loginctl list-users
```

To inspect a user:

```bash
loginctl user-status myuser
```

This is the command that made things clearer for me.

## Reading `loginctl user-status`

The output depends on the machine. On the machine where I only had user-scope permission, mine looked like this, shortened and sanitized a bit:

```text
myuser (1000001)
   Since: Wed 2026-07-08 16:51:33 CST; 22h ago
   State: active
Sessions: *193
  Linger: yes
    Unit: user-1000001.slice
          |-session-193.scope
          | |-41495 "sshd: myuser [priv]"
          | |-41705 "sshd: myuser@pts/0"
          | |-41706 /usr/bin/bash -l
          | |-43065 tmux new -s experiment
          | |-47680 loginctl user-status myuser
          | `-47681 pager
          `-user@1000001.service
            |-app.slice
            | |-gnome-keyring-daemon.service
            | `-snap.snapd-desktop-integration.snapd-desktop-integration.service
            |-init.scope
            | |-4108 /usr/lib/systemd/systemd --user
            | `-4110 "(sd-pam)"
            |-session.slice
            | |-dbus.service
            | |-pipewire.service
            | `-wireplumber.service
            |-tmux-spawn-c1a3d393-525a-47d0-b44d-db6294d327a2.scope
            | |-43066 -bash
            | `-43969 ./run-experiment.sh
            `-tmux-spawn-d1a430f8-9e64-44fa-8817-b8c2a27281c3.scope
              |-43718 -bash
              |-44223 /tmp/.mount_editor/usr/bin/editor
              `-44280 node ./language-server.js --stdio
```

The first line, `myuser (1000001)`, is the user name and UID.

`Since` tells you when logind started tracking this user as logged in.

`State` tells you whether the user currently has active sessions. Common values are `active`, `online`, `closing`, and sometimes no visible user entry at all if nothing is running for that user.

`Sessions` lists the active session IDs. The `*` before `193` marks the current session from the point of view of the command. If you SSH into the machine twice, you may see more than one session here.

`Linger` is the important one for long-running user services. Here it says `yes`, which means the user's systemd manager may exist even when the user is not logged in. If it says `no`, the user's systemd manager is normally tied more closely to login sessions.

`Unit` shows the cgroup tree for that user. This part is easy to skip, but it is useful:

- `user-1000001.slice` is the resource container for UID 1000001
- `session-193.scope` contains processes that belong to that login session
- `user@1000001.service` is the per-user systemd manager
- `init.scope` under `user@1000001.service` contains the user's systemd process itself
- `app.slice` and `session.slice` contain user-level desktop/session services, like DBus, PipeWire, and keyring services
- `tmux-spawn-....scope` entries are scopes created for processes launched from tmux

If your process appears under `session-193.scope`, it is connected to that login session. When the session is closed, it may be cleaned up depending on the machine's logind policy.

If your process appears under `user@1000001.service`, it is managed by the per-user systemd manager rather than directly by the SSH session. In my output, the experiment process is under `tmux-spawn-....scope`, which is inside `user@1000001.service`. That is a different situation from a random process living directly under `session-193.scope`.

If you run your process as a proper user service, it should also live under `user@1000001.service`:

```bash
systemctl --user status my-service.service
```

That distinction matters. A process started from an SSH shell is not the same thing as a user systemd service.

## The Policy: `logind.conf`

The behavior of `systemd-logind` is configured in `logind.conf`, usually at:

```text
/etc/systemd/logind.conf
```

There can also be drop-in files under:

```text
/etc/systemd/logind.conf.d/
```

The setting that often surprises people is:

```ini
KillUserProcesses=yes
```

When `KillUserProcesses=yes`, logind kills processes that belong to a user session when the user logs out. This is why a command that looked fine during SSH can vanish after disconnecting.

When `KillUserProcesses=no`, session processes are not killed just because the session ends. But I would not treat this as a proper service management strategy. It is a machine-level policy, and on a machine you do not administer, you probably cannot change it anyway. Defaults can also differ by systemd version or distribution packaging, so the important thing is to check the actual machine.

Other related settings include:

```ini
KillOnlyUsers=
KillExcludeUsers=root
UserStopDelaySec=10s
```

`KillOnlyUsers` limits the kill behavior to specific users.

`KillExcludeUsers` excludes users from that behavior. `root` is commonly excluded by default, which is one reason root-run VPS experiments can hide this issue.

`UserStopDelaySec` controls how long systemd keeps the per-user service manager around after the last session ends. A short delay can make it look like things survive logout for a moment, then disappear.

After changing logind configuration, the usual command is:

```bash
sudo systemctl restart systemd-logind
```

But be careful: restarting `systemd-logind` can affect active login sessions. On a shared machine, this is not something to do casually.

## The Better Fix: User Services

If you do not have root permission, the better pattern is usually to run the process through the user's systemd manager.

For a quick experiment, `systemd-run` is the lightest option:

```bash
systemd-run --user --scope tmux new -s experiment
```

The command is important:

- `--user` talks to the per-user systemd manager instead of the system manager
- `--scope` creates a transient scope unit instead of a persistent service file
- the command after that is the process I want systemd to place under the user manager

This does not create a `.service` file under `~/.config/systemd/user/`. It creates a temporary scope, so it is good for one-off commands, tmux sessions, shells, and experiments.

If I want something closer to a temporary service, I can omit `--scope`:

```bash
systemd-run --user ./run-my-process.sh
```

That creates a transient service unit. It is still temporary, but it behaves more like a service than a scope.

For something I want to keep, restart, inspect, and enable repeatedly, I would write a real user service.

User services live under:

```text
~/.config/systemd/user/
```

For example:

```ini
[Unit]
Description=My User Process

[Service]
WorkingDirectory=/home/myuser/my-app
ExecStart=/home/myuser/my-app/run.sh
Restart=on-failure

[Install]
WantedBy=default.target
```

Then enable it with:

```bash
systemctl --user daemon-reload
systemctl --user enable --now my-process.service
```

This moves the process into the user's systemd manager instead of leaving it as a child of an SSH session.

But all of these approaches still depend on the user manager staying alive. `systemd-run --user --scope`, `systemd-run --user`, and `systemctl --user enable --now ...` all place work under `user@1000001.service`. If that user manager is stopped after my last login session ends, the work under it can stop too.

That is where `linger` matters.

## Linger

By default, a user's systemd manager may start when the user logs in and stop after the user's last session ends. That is reasonable for desktop sessions, but not great if you want a user service to keep running on a server.

`linger` changes that.

To enable linger for a user:

```bash
loginctl enable-linger myuser
```

To disable it:

```bash
loginctl disable-linger myuser
```

To check it:

```bash
loginctl user-status myuser
```

Look for:

```text
Linger: yes
```

When linger is enabled, systemd can start the user's service manager at boot and keep it around after logout. That means `systemctl --user enable my-process.service` becomes much closer to a normal system service, except it runs as that user and uses user-level unit files.

There is one catch: whether you can enable linger yourself depends on the machine's policy. On some systemd systems, a normal user may be able to run `loginctl enable-linger` for their own account. On locked-down shared machines, the administrator may disable that path. In that case, you either need to ask the administrator, keep the process attached to an allowed session tool, or use whatever job system the machine provides.

## What I Took Away

The lesson for me was that "running in the background" is not the same as "running as a service."

On my own VPS, I often skip straight to root-owned system services, so I do not notice session cleanup rules much. On a machine where I only have user permission, those rules suddenly matter. `loginctl` gives a clear view into that layer: who is logged in, which sessions exist, whether linger is enabled, and whether my process belongs to an SSH session or a user service manager.

The short version:

- use `loginctl list-sessions` to see login sessions
- use `loginctl session-status <id>` to inspect a specific session
- use `loginctl user-status <user>` to check user state, process tree, and linger
- use `systemctl --user` for user-level services
- use `loginctl enable-linger <user>` when user services need to survive logout

If a process keeps dying after logout, it may not be mysterious at all. It may just be doing exactly what `systemd-logind` was configured to do.
