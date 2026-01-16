---
title: Android Fence
date: 2024-08-29
description: Android Fence 的運作機制
readTime: 2 min read
tags: ['Android']
type: writing
---

在介紹 Fence 之前，我們需要了解為什麼需要 Fence 和其用途。這需要從 GPU 和 CPU 說起。

# GPU & CPU

在前一篇的 「BufferQueue 和 Fence 的基礎知識介紹」中，我們講過 BufferQueue 的運作模式。但是實際上，我們省略了一個很重要的部分，也就是 GPU 在這裡擔任的角色。首先我們先看看 CPU 與 GPU 各自的分工。

- CPU: CPU 的角色是非常單純的。製作 buffer ，將 buffer 放進 BufferQueue 後等待 SurfaceFlinger 更進一步的行動。
- GPU: GPU 的角色與 CPU 不同， GPU 是負責一些 loading 比較重的工作，並且 GPU 與 BufferQueue 其實沒有太多溝通。

## 加入 GPU 前的 Render 順序

回顧最基礎的 BufferQueue ，在這裡，其實 Consumer 就是 SurfaceFlinger ，也就是 Android Graphic 的其中一個重要元件。

![BufferQueue](/images/android-fence/bufferqueue-official.png)

如果所有的圖形皆不需要 GPU 參與，則 SF (SurfaceFlinger) 會直接將 buffers 交給 HWC (Hardware Composer)。

![ProcessNoGPU](/images/android-fence/process-without-gpu.png)

## 加入 GPU 後的 Render 順序

但是，如果今天有需要 GPU 介入的圖形時， SF 會透過另一個 BufferQueue ，將工作交給 GPU 。步驟如下：

- 由 App 生產、繪製，交給 BufferQueue ，等待 SF 取用
- SF 管理 Layer ，在繪製下一幀時，問 HWC 各個圖層的合成模式
  - 如果不用 GPU 則直接交給 HWC
  - 如果需要 GPU ，則調用 GPU 並在合成後再轉交給 HWC
- HWC 最後交給 Display 並 render 出來

![ProcessGPU](/images/android-fence/process-with-gpu.png)

> HWC 範例補充：像是 app icons, wallpaper 這種東西，就會直接交給 HWC 而不經過 GPU

# Fence

了解渲染的過程之後，終於可以聊聊 Fence 的用處與出現時機。就如同上篇提到的，如果純 CPU 工作就不需要 Fence 機制，因為線性的工作環境並不會出現搶資源的情況。但是 GPU 加入後，工作與 CPU 是同步的，這時候就需要 Fence 機制來確保資源不會被搶走。

> 說明：Fence 機制是 Producer-Consumer 都會有的（或是說 BufferQueue 這個模型都會有的），而非 Android Graphics 特有。只是在這裡 Android Graphics 有使用到 Fence 機制。

這時候就是 Fence 派上用場的時候。

## Fence 基礎

Buffer 與 Fence 不能當作同一種東西來理解。先介紹 `acquireFence()` 與 `releaseFence()` 的簡單運作。

- `acquireFence()`: 生產者通知消費者可以消費；或者說是消費者告訴生產者自己要開始消費了
- `releaseFence()`: 消費者通知生產者消費已經完成

## Android Graphics 的 Acquire Fence

1. 當 Producer(App) 通過 `queueBuffer()` 將一 buffer 放入 BufferQueue 時，此 buffer 會帶著一個 Fence。

2. 在 SurfaceFlinger 取用並轉交 GPU 合成之前，需要檢查 `acquireFence()`，才能開始處理。換句話說，就是當 `acquireFence()` 還沒完成時（`acquireFence()` 還沒拿到 buffer 帶著的 Fence 時），SurfaceFlinger 不能開始合成。

3. 當 SurfaceFlinger 成功 `acquireFence()` 後開始合成。

4. SurfaceFlinger 的 RenderSurface(新的 Producer) 產生一個 Fence，並且在合成完成後，將這個 Fence 交給 HWC。當 HWC 要渲染時，需要檢查 `acquireFence()`，確認 SurfaceFlinger 已經合成完成。

> 可以理解成， `acquireFence()` 和 Fence 被異步的程序創造並傳遞，而 `acquireFence()` 會先傳遞， Fence 則是程序完成之後傳遞。當 `acquireFence()` 被傳遞後，收到的程序需要先完成 `acquireFence()` 並找到也被傳遞的 Fence 才能繼續執行。

![GenerateFence](/images/android-fence/generate-fence.png)

> 這裡的 RenderSurface 是生產者， BQ 是 BufferQueue， FramebufferSurface 是消費者。

## Android Graphics 的 Release Fence

如果了解 `acquireFence()` 的運作，那 `releaseFence()` 就相對簡單許多。 `releaseFence()` 其實就是通知生產者，消費者已經完成消費。

# Fence 結語

其實 `acquireFence` 與 `releaseFence` 並不是一個變數抑或是 function ，而是一種概念。其中 `Fence` 是一個 class，並且 `acquireFence` 和 `releaseFence` 是這個 class 的一個 instance，並被 Android 的 strong pointer 操控著。如果想要了解更多，可以參考 [Android 官方文件](https://source.android.com/docs/core/graphics/sync)。
