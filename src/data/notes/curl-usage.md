---
title: Guide to the `curl` command
date: 2024-05-22
description: Introduction to the `curl` command.
readTime: 2 min read
tags: ['Command Line']
type: writing
---

Curl, short for _Client URL_, is a command-line tool that allows you to transfer data to or from a server.
It supports a wide range of protocols, including HTTP, HTTPS, FTP, FTPS, SCP, SFTP, LDAP, and more.
In this article, we will explore the basic usage of the `curl` command.

# Basic `curl` command

## GET request

To make a basic HTTP GET request, simply run the `curl` command followed by the URL you want to access.

```curl
curl https://example.com
```

If you want to save the output to a file, use `-o` or `-O` option.

- `-o` option allows you to specify the output file name. e.g. `curl -o output.html https://example.com`
- `-O` option saves the output to a file with the same name as the remote file. e.g. `curl -O https://example.com/index.html`

If the server returns a redirect response, you can follow the redirect using the `-L` option.

```curl
curl -OL https://example.com # Follow redirect and save output to a file
```

## POST request

To send data using a POST request, use `-X` to specify the request method and `-d` to provide the data.

- `-X` option specifies the request method. e.g. `curl -X POST https://example.com`
- `-d` option sends data in the request body. e.g. `curl -d 'key=value' https://example.com`. If `-d` is used without `-X`, it defaults to a POST request.
- `-H` option allows you to set headers. e.g. `curl -H "Content-Type: application/json" -d '{"key": "value"}' https://example.com`

```curl
curl -d '{"key": "value"}' -H "Content-Type: application/json" -X POST https://example.com
```

# Other common options

To see the response headers along with the body, use the `-i` option.

```curl
curl -i https://example.com
```

Output sample:

```bash
OUTPUT sample
HTTP/1.1 200 OK
date: Wed, 22 May 2024 05:42:02 GMT
server: uvicorn
content-length: 3
content-type: application/json

"OK"
```

To display the progress of the transfer, use the `-#` option.

```curl
curl -# https://example.com
```

To send a file as part of the request, use the `--data-binary` option.

```curl
curl --data-binary @file.txt https://example.com
```

# Conclusion

`curl` is a powerful tool for making HTTP requests from the command line.
It provides a wide range of options to customize the request and handle the response.
Whether you are testing APIs, downloading files, or debugging network issues, `curl` is an essential tool for any developer.
Start exploring its capabilities and see how it can simplify your workflow!!!
