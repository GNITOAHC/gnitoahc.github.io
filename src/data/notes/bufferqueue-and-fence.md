---
title: BufferQueue 和 Fence 的基礎知識介紹
date: 2024-07-18
description: BufferQueue 和 Fence 是 Android Graphic 中的兩個重要機制，本文將介紹 BufferQueue 的概念與簡述 Fence 機制的運作。
readTime: 4 min read
tags: ['Android']
type: writing
---

前情提要：

- Android 版本： Android 14.0.0
- Source Code ： [xrefandroid/android-14](http://xrefandroid.com/android-14.0.0_r21/)

# BufferQueue 介紹

首先，我們要先了解什麼是 BufferQueue 。 BufferQueue 是 Android Graphic 中的一個機制，它用來管理圖像緩衝區的生命週期。在 Android Graphic 中，圖像緩衝區 _i.e. BufferQueue_ 是用來存儲圖像數據的內存區域，儲存著每幀影像的數據，並且在系統與渲染管道之間交換數據。BufferQueue 通過一個緩衝區隊列來管理這些圖像緩衝區，它可以實現圖像的生產者和消費者之間的同步。

![BufferQueue](/images/bufferqueue-and-fence/bufferqueue-official.png)
Source: [source.android.com](https://source.android.com/static/docs/core/graphics/images/bufferqueue.png)

BufferQueue 的 Producer 通常是 OpenGL 、影片解碼器等等； Consumer 則是 SurfaceFlinger 、 MediaCodec 等。（這裡的生產者和消費者是指 BufferQueue 中的生產者與消費者）

## Buffer 的五大 State

Buffer 分成五種狀態，分別為：

- `FREE`, `DEQUEUED`, `QUEUED`, `ACQUIRED`, `SHARED`

其中，不同狀態的 Buffer 被不同的角色所持有，分別是 `BufferQueue`, `Producer`, `Consumer` 。可以用下圖來增加理解：

![Buffer State](/images/bufferqueue-and-fence/bufferstate.png)

步驟：

1. Buffer 處於 `FREE` 狀態，表示 BufferQueue 持有 Buffer ， Producer 使用 `dequeueBuffer` 來取得 Buffer ，狀態被更改為 `DEQUEUED` 。
2. Producer 寫入數據再使用 `queueBuffer` 將 Buffer 放入 BufferQueue ，此時 Buffer 狀態為 `QUEUED` 。
3. Consumer 使用 `acquireBuffer` 取得 Buffer ，此時 Buffer 狀態為 `ACQUIRED` ，表示 Consumer 正在使用數據中。
4. Consumer 使用 `releaseBuffer` 釋放 Buffer ，此時 Buffer 狀態為 `FREE` 。

> `SHARED` 狀態下的 Buffer 表示可以是 `FREE` 以外的任意狀態的組合，可以被 `Producer` 或 `Consumer` 使用。
> 同時也可以被 dequeued, queued, acquired 一次或多次。

### Buffer State 的原始碼變數解讀

Buffer 的狀態維護被寫在 `BufferSlot.h` 中，可以參考 [BufferSlot.h](http://xrefandroid.com/android-14.0.0_r21/xref/frameworks/native/libs/gui/include/gui/BufferSlot.h).其中， state 的狀態由 `mShared`, `mDequeueCount`, `mQueueCount`, `mAcquireCount` 來決定。

```cpp
uint32_t mDequeueCount;
uint32_t mQueueCount;
uint32_t mAcquireCount;
bool mShared;
```

並且，其判斷方式如下（摘自 BufferSlot.h）

<Table
  data={{
    headers: ['', 'mShared', 'mDequeueCount', 'mQueueCount', 'mAcquireCount'],
    rows: [
      ['FREE', 'false', '0', '0', '0'],
      ['DEQUEUED', 'false', '1', '0', '0'],
      ['QUEUED', 'false', '0', '1', '0'],
      ['ACQUIRED', 'false', '0', '0', '1'],
      ['SHARED', 'true', 'any', 'any', 'any'],
    ],
  }}
/>

在 `BufferQueueCore.h` 中，定義了以下變數與操作。我們將挑選重要的幾個解讀。

變數：

<Table
  data={{
    headers: ['型別', '變數', '描述'],
    rows: [
      ['Fifo', 'mQueue', '用來儲存 Buffer 的 FIFO 隊列'],
      ['BufferQueueDefs::SlotsType', 'mSlots', '用來儲存 Buffer 的 Slot'],
      [
        'std::set<int>',
        'mFreeSlots',
        '狀態為 FREE 的 Slot 集合（沒有與 Buffer 綁定的 Slots ）',
      ],
      [
        'std::list<int>',
        'mFreeBuffers',
        '狀態為 FREE 的 Slot 集合（有與 Buffer 綁定的 Slots ）',
      ],
      ['std::list<int>', 'mUnusedSlots', '所有沒用到的 Slots'],
      ['std::set<int>', 'mActiveBuffers', '所有不是 FREE 狀態的 Slots'],
    ],
  }}
/>

> Buffer v.s. Slot  
> Buffer 是指圖像數據的內存區域，Slot 是指 Buffer 在 BufferQueue 中的索引。
> 所以說 Buffer 是實際拿來儲存數據的 block ，而 Slot 是以個索引，指向一定數量的 Buffer 。

> `Fifo` 其實就是一個 `BufferItem` 的一維陣列：`typedef Vector<BufferItem> Fifo`

### Buffer State 的原始碼函數解讀

#### Producer - BufferQueueProducer.h

1. `dequeueBuffer()`:  
   先從 `mFreeBuffers` 中取得一個 Slot ，將其狀態修改為 `DEQUEUED` ，再將其放入 `mActiveBuffers` 中。如果 `mFreeBuffers` 是空的，會從 `mFreeSlots` 取得一個 Slot 並指定一定大小的 Buffer 給他。

   ![DequeueBuffer](/images/bufferqueue-and-fence/dequeuebuffer.png)

2. `queueBuffer()`:  
   根據輸入，將指定的 Slot 狀態從 `DEQUEUED` 改成 `QUEUED` ，並根據內容生成一個 `BufferItem` 放入 `mQueue` 中。

   ![QueueBuffer](/images/bufferqueue-and-fence/queuebuffer.png)

#### Consumer - BufferQueueConsumer.h

3. `acquireBuffer()`:  
   從 `mQueue` 中取得一個 `BufferItem` ，並將對應的 Slot 狀態從 `QUEUED` 改成 `ACQUIRED` ，再將其放入 `mActiveBuffers` 中。

   ![AcquireBuffer](/images/bufferqueue-and-fence/acquirebuffer.png)

4. `releaseBuffer()`:  
   根據輸入，將指定的 Slot 狀態從 `ACQUIRED` 改成 `FREE` ，並將其從 `mActiveBuffers` 放回 `mFreeBuffers` 中。

   ![ReleaseBuffer](/images/bufferqueue-and-fence/releasebuffer.png)

# Fence 介紹

什麼是 Fence ？首先，我們先回顧 BufferQueue 的流程。

![BufferQueue](/images/bufferqueue-and-fence/bufferqueue-official.png)

在這裡， Producer 在生產完進入 BufferQueue 後， Consumer 會再向 BufferQueue 提取資料。這些流程在同一執行緒下一次進行是沒有問題的。但是實際運作時，有些繪製是在不同執行緒執行的 e.g. 當繪製圖形時需要 GPU 運算。

> 如果只需要 CPU 運算，此時 Fence 則不會列入考慮。

## Fence 的兩大函數

- `acquireFence()`
- `releaseFence()`

1. `acquireFence()`:  
   在繪製時，所有的 Buffer 都會帶上一個 Fence ，當 Producer 繪製完後，會將 Fence 連同 Buffer 交給 BufferQueue 。當 Producer 繪製完並 `queueBuffer` 後，會呼叫 `onFrameAvailable` 告知 Consumer 有新的 Buffer 可以使用。但此時 Consumer 並不會直接使用，而是等待一個由 GPU 發出的 `acquireFence` 告訴 Consumer 已經可以使用手上的 Buffer 。

   ![AcquireFence](/images/bufferqueue-and-fence/acquirefence.png)

2. `releaseFence()`:  
   同理，當 Consumer 使用完 Buffer 後，會呼叫 `releaseBuffer` 並帶上一個 Fence ，當 Producer 使用 `dequeueBuffer` 取得 Buffer 時，會等待 `releaseFence` 。相對 `onFrameAvailable` ，在 `releaseBuffer` 之前，會先呼叫 `onFrameCommitted` ，這個 callback function 會同步其他後處理工作（ post-processing ）。

   ![ReleaseFence](/images/bufferqueue-and-fence/releasefence.png)

**Fence 小結與後續：**

以上的 Fence 都是用相對簡單的概念描述，實際上在運作時還會牽扯到是否是 Overlay 層等等問題。如果還有機會將會在另一篇中詳細介紹。
