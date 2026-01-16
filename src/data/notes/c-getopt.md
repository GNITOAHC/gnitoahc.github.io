---
title: C 的 Command Line Argument
date: 2024-07-24
description: 介紹 C 的 Command Line Argument Parsing ，包括 `getopt`, `getopt_long` 和參數的定義與處理。
readTime: 4 min read
tags: ['C/C++']
type: writing
---

在撰寫 C 語言時，常常會需要處理 Command Line Argument ，如果要簡單處理兩到三個參數時， `argc` 和 `argv` 就夠用了，但是當參數變多時，就需要使用一些函式來處理。
有些人可能會自己寫函式處理或是上網尋找已經有的 Header ，不過 C 語言已經有內建的函式可以處理 Command Line Argument ，這篇文章就來介紹這些函式。

# Getopt

`getopt` 是 C 語言的標準函式庫，在 [Linux Manual Page](https://www.man7.org/linux/man-pages/man3/getopt.3.html) 可以找到詳細說明。

在使用 `getopt()` 之前要先引入 `unistd.h` ，如下：

```c
#include <unistd.h>

int getopt(int argc, char * const argv[], const char *optstring);
```

## Getopt 的參數

`getopt` 的前兩個參數非常簡單，直接將 `main` 接收的 `argc`, `argv` 串入即可。重點在第三個 `optstring` 。`optstring` 是一個字串，用來定義傳入參數的種類。  
`optstring` 的格式如下：

- `:` 表示後面要接參數
- `::` 表示後面可以接參數
- 其他字元表示不接參數

舉例：`ab:c::` 表示 `-a` 不接參數，`-b` 後面要接參數，`-c` 後面可以接參數。

## Getopt 的回傳值

`getopt` 的回傳值有三種：

1. `-1` 表示沒有參數了
2. `?` 表示未知參數
3. 其他則是傳入的參數

```c
#include <stdio.h>
#include <unistd.h>

int main(int argc, char *argv[]) {
    const char *optstring = "ab:c::";
    int opt;
    while ((opt = getopt(argc, argv, optstring)) != -1) {
        switch (opt) {
            case 'a': printf("Option -a\n"); break;
            case 'b': printf("Option -b with value %s\n", optarg); break;
            case 'c': printf("Option -c with value %s\n", optarg); break;
            case '?': printf("Unknown option\n"); break;
        }
    }

    return 0;
}
```

這樣的程式可以處理 `-a`, `-b`, `-c` 三個參數，其中 `-b` 和 `-c` 都可以接參數。合理的執行如下：

```txt
./a.out -a -b1 -c2
# Option a
# Option b with value 1
# Option x with value 2
./a.out -a -b 1 -c2
# Option a
# Option b with value 1
# Option c with value 2
```

> 注意：如果一個 Option 後面可接可不接參數，則其參數須與 option 本身相連。

- `./a.out -b 1` 或是 `./a.out -b1` 都是合法的
- `./a.out -c1` 是合法的，但是 `./a.out -c 1` 不是，因為 `-c` 這個 Option 後面是可接可不接參數。

> 注意： `optarg` 是 `getopt` 內建的變數，用來存放參數的值。

## Getopt 的內建變數

1. `optarg` 用來存放參數的值
2. `optind` 用來存放下一個參數的位置（每次呼叫都會從 optind 的位置開始 parse 並在每次 parse 時更新；初始為 1 ）
3. `opterr` 用來控制錯誤訊息是否要顯示 （0 表示不顯示，1 （預設）表示顯示）
4. `optopt` 用來存放目前未知參數

以上述 `./a.out -a -b 1 -c2` 為例：

```txt
1. optopt = a    optarg = (null)    optind = 2    argv[optind] = -b   （目前選項是 `a` ，沒有值）
2. optopt = b    optarg = 1         optind = 4    argv[optind] = -c2  （目前選項是 `b` ，值是 1 ）
3. optopt = c    optarg = 2         optind = 5    argv[optind] = (null)
```

# Getopt_long

`getopt_long` 與 `getopt` 非常相似，但是可以處理一些 `--` 開頭的參數。

```c
#include <getopt.h>
int getopt_long(int argc, char *argv[],
                  const char *optstring,
                  const struct option *longopts, int *longindex);
```

其中 `longopts` 是一個 `struct option` 的陣列，用來定義長參數的格式，必續用 `{0, 0, 0, 0}` 作為結尾。

```c
struct option {
    const char *name;
    int         has_arg;
    int        *flag;
    int         val;
};
```

- `name` 是參數名稱 e.g. `help`
- `has_arg` 是參數是否需要值 e.g. `no_argument`(0), `required_argument`(1), `optional_argument`(2)
- `flag` 是一個指標，用來存放參數值
- `val` 是 `getopt_long` 的回傳值

額外說明：  
如果 `flag` 是 `NULL` 或是 `0` ，則 `getopt_long` 會回傳 `val` ，否則會將 `val` 存入 `flag` 中並回傳 `0` 。
因此，回傳 long option 的第一個字母就可以達到簡寫的功能，例如 `--help` 可以寫成 `-h` 。

```c
#include <getopt.h>
#include <stdio.h>

static struct option long_options[] = {
    {"help", no_argument, 0, 'h'},
    {0, 0, 0, 0}
};

int main(int argc, char *argv[]) {
    int opt;
    int option_index = 0;
    while ((opt = getopt_long(argc, argv, "h", long_options, &option_index)) != -1) {
        switch (opt) {
            case 'h': printf("Option -h\n"); break;
            case '?': printf("Unknown option\n"); break;
        }
    }
    return 0;
}
```

使用 `./a.out -h` 或是 `./a.out --help` 都可以執行。

1. 使用 `./a.out -h` 時， `getopt_long` 和 `getopt` 一樣，會回傳 `h` 。
2. 使用 `./a.out --help` 時， 也會回傳 `h` ，此時 `option_index` 會是 `0` ，表示使用了 `long_option` 陣列中的第 0 個元素。

# 處理最後沒用到的參數

回想標頭檔所提供的內建變數 `optind` ，可以用來處理最後沒用到的參數。因為 `optind` 會紀錄下一個參數的位置，所以當所有參數都處理完後， `optind` 的值就是最後一個位置。  
以 `./a.out -h i j k` 為例，最後 `optind` 的值會是 `2` ，所以可以用以下判斷：

```c
// Handle any remaining command line arguments (not options).
if (optind < argc) {
    printf("Non-option arguments: ");
    while (optind < argc)
        printf("%s ", argv[optind++]);
    printf("\n");
}
```

> 處理的是 "Non-option arguments" ，意思是*不是* `-` 或 `--` 開頭的參數。
> 如果是 `-` 或 `--` 開頭但是不在 `optstring` 或 `long_options` 中的參數，則會被視為未知參數。（出錯）

## Reordering

如果在 argument list 中，出現類似 `./a.out i -h j k` 的狀況， `getopt` 和 `getopt_long` 會將 `i` 也就是 Non-option argument 移到後面。

- 一開始的 `argv`: `./a.out`, `i`, `-h`, `j`, `k`
- 經過 `getopt` 或是 `getopt_long` 的 `argv`: `./a.out`, `-h`, `i`, j`, `k`

因此， `optind` 最後會是 `2` ，仍然可以用上述方法處理所有 Non-option arguments 。
