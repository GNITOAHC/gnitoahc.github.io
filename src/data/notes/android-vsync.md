---
title: Android VSYNC
date: 2024-08-31
description: Android VSYNC 的運作機制
readTime: 2 min read
tags: ['Android']
type: writing
---

在了解 VSYNC 前，需要先了解 FPS 和螢幕更新率是什麼。

- Frame rate (fps): 軟體每秒產生多少幀的圖像。
- Refresh rate (Hz): 螢幕每秒更新幀數，代表螢幕每秒更新多少幀。

也就是說，如果 Frame rate 是 60fps，代表軟體每秒產生 60 個 frame；如果 Refresh rate 是 60Hz，代表螢幕每秒將 60 個 frame 畫到螢幕上。

![fpshz](/images/android-vsync/fps-hz.png)

> 螢幕更新補充: 螢幕的更新和 terminal 的 console 很像，或是 C 的 `printf` 很像，都是一行一行印出來。實際上，螢幕的更新也是一行一行印出來，從上到下左到右，只是因為更新速度非常快，所以看起來像是同時更新的。

# Jank and Tearing

當 FPS 和螢幕更新率一樣時，不會有任何問題，但當 FPS 和螢幕更新率不一樣時，就會出現不同問題。

- Jank: 當 Frame rate < Refresh rate 時，螢幕每秒更新超過軟體能產生的 frame，導致有些 frame 被更新兩次，看起來卡卡的。
- Tearing: 當 Frame rate > Refresh rate 時，軟體能產生的 frame 速度快於螢幕更新速度，導致螢幕在更新時，軟體正在準備新的 frame，導致螢幕上半部是前一幀的影像、下半部是後一幀的影像。

![TearingA](/images/android-vsync/tearing-a.png)
在螢幕更新時，軟體正在更新第一幀，也就是 aaaaa...

![TearingB](/images/android-vsync/tearing-b.png)
因為軟體產生 frame 的速度太快了，導致螢幕還在更新時，軟體已經在寫入第二幀，也就是 bbbbb...。最終導致螢幕上半部是前一幀的影像、下半部是後一幀的影像。

# Double Buffering

為了解決 Jank 和 Tearing 的問題，Android 引入了 Double Buffering。簡單來說，Double Buffering 就是兩個 buffer，讓軟體先將 frame 畫到其中一個 buffer 上，並讓 display 讀另外一個 buffer，時間到了再交換。

![DoubleBuffering](/images/android-vsync/double-buffering.png)

> 被 Display 使用的叫做 Front Buffer，另外ㄧ個叫做 Back Buffer

> 為了解決更多問題，Android 又引入了 Triple Buffering。

## Swap on VSYNC

那什麼時候交換 buffer 呢？其實就是 VSYNC 訊號發送的時候。

## Draw on VSYNC

雖然說 VSYNC 解決了 swapping 的問題，但並沒有解決最核心的問題，就是軟體產生 frame 的速度和螢幕更新速度不一樣。

![DrawOnVSYNC](/images/android-vsync/draw-on-vsync.png)
_圖為 Triple Buffering_

因此， Android 在 VSYNC 訊號發送的時候，會同時通知軟體產生 frame。也就出現了 VSYNC Offset 機制。

- `HW_VSYNC_0`: Display 開始畫第 $N$ 張
- `VSYNC`: 軟體生成第 $N + 2$ 張
- `SF_VSYNC`: SurfaceFlinger 合成第 $N + 1$ 張

![SyncOffset](/images/android-vsync/sync-offset.png)

# DispSync

如此多得訊號，自然需要一個機制來管理這些訊號。這個機制就是 DispSync。

![DispSync](https://source.android.com/static/docs/core/graphics/images/dispsync.png)
_Source from Android Docs: source.android.com_

DispSync 可以追蹤 `HW_VSYNC_0` 然後幫助軟體和 SurfaceFlinger 排成並利用 `VSYNC` 和 `SF_SYNC` 在對的時間點產生 frame。（也就是說，這三個的訓好產生時間不一定是相同的）

# Triple Buffering

為了讓效率提高，目前的 Triple Buffering 可以供應兩個 buffer 用來渲染，也就是在第一個 backbuffer 渲染完畢後，可以馬上開始渲染第二個 backbuffer，而不需要等待第一個 backbuffer 渲染完畢。
