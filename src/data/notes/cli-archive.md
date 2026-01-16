---
title: Archiving Commands in Unix
date: 2025-11-19
description: zip, tar - compression and file packaging utility for Unix.
readTime: 2 min read
tags: ['Command Line']
type: writing
---

I'll introduce two commonly used archiving commands in Unix-like operating systems: `zip` and `tar`. These commands are essential for compressing files and directories, making it easier to store and transfer them.

# Zip Command Syntax

```shell
zip [options] [filename.zip] [file_to_zip]
```

## Options

| Options | Description                              | Syntax                                                |
| ------- | ---------------------------------------- | ----------------------------------------------------- |
| `-r`    | Recursively zip a directory              | `zip -r [filename.zip] [dir_name]`                    |
| `-x`    | Explicitly exclude the specified files   | `zip -r [filename.zip] [dir_name] -x [excluded_file]` |
| `-m`    | Move the original files into the archive | `zip -m [filename.zip] [file_to_zip]`                 |

## Examples

1. Zipping files

   ```shell
   zip archive.zip file1.txt file2.txt
   ```

2. Zipping a directory while excluding some subdirectories

   ```shell
   zip -r archive.zip . -x "node_modules/*"
   ```

   For a large number of exclusions, a file can be used to list the patterns.

   ```shell
   zip -r archive.zip . -x @exclude.lst
   ```

   In this case, `exclude.lst` would contain one pattern per line, and zip would exclude files matching those patterns.

3. Zipping files and moving them into the archive

   ```shell
   zip -m documents.zip *.txt
   ```

# Tar Command Syntax

```shell
tar [options] [archive_name.tar] [file_to_archive]
```

## Options

The `-f` option is mandatory to specify the archive file name. Without it, `tar` will try to write this archive to the default output device (typically /dev/rmt0 or standard output)

| Options | Description                                  | Syntax                              |
| ------- | -------------------------------------------- | ----------------------------------- |
| `-c`    | Create a new archive                         | `tar -cf name.tar [targets...]`     |
| `-z`    | Compress with gzip                           | `tar -czf name.tar.gz [targets...]` |
| `-x`    | Extract files                                | `tar -xf name.tar`                  |
| `-v`    | Verbose output                               | `tar -xvf name.tar`                 |
| `-C`    | Change to [dir] before performing operations | `tar -C [dir] -xzf name.tar.gz`     |

> Combining options or skipping dash is common, e.g. `tar Cxzf output_dir archive.tar.gz` is the same as `tar -C output_dir -xzf archive.tar.gz`

## Examples

1. Create a new `.tar.gz` archive

   ```shell
   tar -czf archive.tar.gz file1.txt file2.txt
   ```

2. Extract a `.tar.gz` archive

   ```shell
   tar -xzf archive.tar.gz
   ```

   Or, extract specific files (file1.txt and file2.txt) from the archive:

   ```shell
   tar -xzf archive.tar.gz file1.txt file2.txt
   ```

# Browsing Archive Files

To browse the contents of a zip, tar, or tar.gz file using Vim or Neovim, you can simply open the them with either editor. These editors have built-in support for browsing zip archives.

```shell
# e.g.
vim filename.zip
nvim filename.tar.gz
```
