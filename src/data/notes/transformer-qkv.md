---
title: Intro to Q, K and V matrix in transformer
date: 2025-07-19
description: Q, K and V matrix in transformer
readTime: 5 min read
tags: ['NLP']
type: writing
---

# Transformer

Transformer 是現在 LLM 的基礎架構，有許多 Youtuber 或是文章都有詳細的介紹。這篇主要紀錄 Q, K & V 矩陣中容易不懂的地方，抱括來源、運算過程等等。

## Dimensions

首先我們要先清楚知道在這些矩陣中有哪些維度。

| name            | description                                  |
| --------------- | -------------------------------------------- |
| `n_vocab` ($V$) | vocab size (字典共有多少字)                  |
| `n_embed` ($d$) | embedding size (字經過 embed 之後有多少維度) |
| `n_L` ($L$)     | length of sequence input (輸入有多少字)      |

在真正實作時， $L$ 會是有多少 token，我們先假設現在一個字就是一個 token。

## Matrix 整理

**Weight Matrices**

| **Name** | **Shape**                 | **Used In**     | **Description**                                                       |
| -------- | ------------------------- | --------------- | --------------------------------------------------------------------- |
| $W_E$    | $\mathbb{R}^{V \times d}$ | Embedding layer | Maps input token IDs to dense vectors (word embeddings).              |
| $W_Q$    | $\mathbb{R}^{d \times d}$ | Self-attention  | Projects hidden state to **Query** vectors.                           |
| $W_K$    | $\mathbb{R}^{d \times d}$ | Self-attention  | Projects hidden state to **Key** vectors.                             |
| $W_V$    | $\mathbb{R}^{d \times d}$ | Self-attention  | Projects hidden state to **Value** vectors.                           |
| $W_U$    | $\mathbb{R}^{d \times V}$ | Output layer    | Maps final hidden state to vocabulary logits. Often $W_U = W_E^\top$. |

# Single Head Attention

## Input

先預設一個字就是一個 token，輸入 "I love to" 之後，會先經過 embed 變成三個向量 _i.e_. $L = 3$。這裡先標記成 $E_1$, $E_2$ & $E_3$。實際矩陣會長得像這樣：

$
X =
\begin{bmatrix}
    \vec{E_1} \\
    \vec{E_2} \\
    \vec{E_3}
\end{bmatrix}
\in \mathbb{R}^{3 \times d}
$

這個 Input Embedding Matrix $X$ 我們會拿著它去算出 Q, K & V 矩陣。 $X W_Q = Q$ 實際運作如下：

$
\begin{bmatrix}
    \vec{E_1} \\
    \vec{E_2} \\
    \vec{E_3}
\end{bmatrix}_{3 \times d}
\begin{bmatrix} W_Q \end{bmatrix}_{d \times d}
= \begin{bmatrix} Q \end{bmatrix}_{3 \times d}
$

至於 K 和 V 都是同樣的道理，只是 weight matrix 裡面實際的 weight 有所不同。

## Attention

$$
Z = \text{Attention}(Q, K, V) = \text{softmax}(\frac{QK^\top}{\sqrt{d_k}})V
$$

實際上計算時，softmax 與 $\frac{1}{\sqrt{d_k}}$ 並不影響 dimension 這裡先不解釋。

$
Q =
    \begin{bmatrix}
        q_{11} & \cdots & q_{1d} \\
        q_{21} & \cdots & q_{2d} \\
        q_{31} & \cdots & q_{3d} \\
    \end{bmatrix}
,K^\top =
    \begin{bmatrix}
        k_{11} & k_{21} & k_{31} \\
        \vdots & \vdots & \vdots \\
        k_{1d} & k_{2d} & k_{3d} \\
    \end{bmatrix}
$

$QK^\top$ 的 output 意思是字與字之間的相關程度。

$
\begin{array}{lc}
    \begin{array}{r}
    I \\ love \\ to \\
    \end{array}
    \begin{bmatrix}
        q_{11} & \cdots & q_{1d} \\
        q_{21} & \cdots & q_{2d} \\
        q_{31} & \cdots & q_{3d}
    \end{bmatrix}
\end{array}
\times
\begin{bmatrix}
    k_{11} & k_{21} & k_{31} \\
    \vdots & \vdots & \vdots \\
    k_{1d} & k_{2d} & k_{3d} \\
\end{bmatrix} =
\begin{bmatrix}
    a_{11} & a_{12} & a_{13} \\
    a_{21} & a_{22} & a_{23} \\
    a_{31} & a_{32} & a_{33} \\
\end{bmatrix}
$

在新的 $\mathbb{R} = 3 \times 3$ 的矩陣中，以 $a_{12}$ 舉例，它代表 "I" 與 "love" 的關係程度。數字越大，代表這兩個字的關係程度越高。

$
(QK^\top)V =
\begin{bmatrix}
    a_{11} & a_{12} & a_{13} \\
    a_{21} & a_{22} & a_{23} \\
    a_{31} & a_{32} & a_{33} \\
\end{bmatrix}
\begin{bmatrix}
    v_{11} & \cdots & v_{1d} \\
    v_{21} & \cdots & v_{2d} \\
    v_{31} & \cdots & v_{3d} \\
\end{bmatrix}
= \begin{bmatrix}
    z_{11} & \cdots & z_{1d} \\
    z_{21} & \cdots & z_{2d} \\
    z_{31} & \cdots & z_{3d} \\
\end{bmatrix}
= \begin{bmatrix}
\vec{Z_1} \\ \vec{Z_2} \\ \vec{Z_3} \\
\end{bmatrix}
= Z
$

這個 $Z$ 就是最後的 output。如此，所有 $Z$ 向量就包含了所有上下文的資訊。實際運作時，會再加上 masking，使得 $Z_1$ 包含 "I" 的資訊，$Z_2$ 包含 "I love" 的資訊，$Z_3$ 包含 "I love to" 的資訊。

## Predicting

在 pretrain 時，還有一個 weight matrix - $W_U \in \mathbb{R}^{d \times V}$ ，會用來預測下一個 token。

$\text{logits} = \vec{Z_{-1}} W_U$

更仔細點說：

$
\begin{bmatrix}
z_{31} & z_{32} & \cdots & z_{3d}
\end{bmatrix}
\begin{bmatrix}
    u_{11} & \cdots & u_{1d} \\
    \vdots & \ddots & \vdots \\
    u_{V1} & \cdots & u_{Vd} \\
\end{bmatrix}
= \begin{bmatrix}
    v_1 \\ \vdots \\ v_V \\
\end{bmatrix}
$

其中 $v_1$ 代表 token 編號為 1 的機率，$v_2$ 代表 token 編號為 2 的機率，以此類推。 Model 會根據這些機率來預測下一個 token。

# Multi Head Attention

進入 Multi Head Attention 之前，先來看看 single head 中沒有用到的 weight matrix (\*) 。

**Weight Matrices**

| **Name**  | **Shape**                    | **Used In**                | **Description**                                                              |
| --------- | ---------------------------- | -------------------------- | ---------------------------------------------------------------------------- |
| $W_E$     | $\mathbb{R}^{V \times d}$    | Embedding layer            | Maps input token IDs to dense vectors (word embeddings).                     |
| $^{*}W_Q$ | $\mathbb{R}^{d \times d_q}$  | Self-attention (each head) | Projects hidden state to **Query** vectors.                                  |
| $^{*}W_K$ | $\mathbb{R}^{d \times d_k}$  | Self-attention (each head) | Projects hidden state to **Key** vectors.                                    |
| $^{*}W_V$ | $\mathbb{R}^{d \times d_v}$  | Self-attention (each head) | Projects hidden state to **Value** vectors.                                  |
| $^{*}W_O$ | $\mathbb{R}^{hd_v \times d}$ | Multi-head attention       | Combines concatenated head outputs into a unified vector (often $hd_v = d$). |
| $W_U$     | $\mathbb{R}^{d \times V}$    | Output layer               | Maps final hidden state to vocabulary logits. Often $W_U = W_E^\top$.        |

通常 $d_q$, $d_v$ 和 $d_k$ 是一樣的，都是 $d_{head}$，也就是說如果 $d_q = d_k = d_v = d_{head} = \frac{d}{h}$ 其中 $h$ 就是 head 的數量。

## Weigth Matrices in Multi Head

Multi head 的概念其實不難，就是把 Weight Matrices 分成 $h$ 個矩陣，希望可以抓到 token 之間不同面向的注意力。

先假設 $h = 5$ 那麼 $W_Q$ 就會從原本的 $\mathbb{R}^{d \times d}$ 變成 $\mathbb{R}^{d \times \frac{d}{5}}$。並且總共有 $h$ 個 $W_Q$。

原始的
$
W_Q =
\begin{bmatrix}
    w_{11} & \cdots & w_{1d} \\
    \vdots & \ddots & \vdots \\
    w_{d1} & \cdots & w_{dd} \\
\end{bmatrix}
$

會變成

$
\begin{bmatrix}
    w_{11} & \cdots & w_{1d} \\
    \vdots & \ddots & \vdots \\
    w_{d1} & \cdots & w_{d,\frac{d}{5}} \\
\end{bmatrix}
\begin{bmatrix}
    w_{1,\frac{d}{5} + 1} & \cdots & w_{1,2 * \frac{d}{5}} \\
    \vdots & \ddots & \vdots \\
    w_{d,\frac{d}{5} + 1} & \cdots & w_{d,2 * \frac{d}{5}} \\
\end{bmatrix}
\cdots
$

並且每個 head 的 weight matrix 都是 $d \times \frac{d}{h}$ 的矩陣。

## Q, K & V in Multi Head

在 multi head 中，所有的計算都是跟 single head 一樣，除了 matrices 的維度。

$$
Q, K, V \in \mathbb{R}^{d \times \frac{d}{h}} \\
Z = (QK^\top)V \in \mathbb{R}^{L \times \frac{d}{h}}
$$

接著把所有的 head 的 $Z_{i}$ 拼在一起就可以得到 $Z_{concat}$，$Z_{concat} \cdot Z_O$ 就是最後的 output $Z_{final}$。

$$
Z_{final} = Z_{concat} \cdot W_O, \text{ where } W_O \in \mathbb{R}^{d \times d}
$$

$Z_{final}$ 就是我們在 single head 中提到的 $Z$ 了。拿著這個 $Z$ 就可以預測下一個 token。

# Feed Forward Layer

Feed Forward Layer (FFN) 就是在 Attention 做完之後，讓 $Z$ 在經過幾次 neural network。因為原始的 self-attention layer 其實只是 input 的線性組合，加入 FFN 可以增加整個 Language Model 的深度。

| **Name**  | **Shape**                             | **Used In**                | **Description**                                                              |
| --------- | ------------------------------------- | -------------------------- | ---------------------------------------------------------------------------- |
| $W_E$     | $\mathbb{R}^{V \times d}$             | Embedding layer            | Maps input token IDs to dense vectors (word embeddings).                     |
| $W_Q$     | $\mathbb{R}^{d \times d_q}$           | Self-attention (each head) | Projects hidden state to **Query** vectors.                                  |
| $W_K$     | $\mathbb{R}^{d \times d_k}$           | Self-attention (each head) | Projects hidden state to **Key** vectors.                                    |
| $W_V$     | $\mathbb{R}^{d \times d_v}$           | Self-attention (each head) | Projects hidden state to **Value** vectors.                                  |
| $W_O$     | $\mathbb{R}^{hd_v \times d}$          | Multi-head attention       | Combines concatenated head outputs into a unified vector (often $hd_v = d$). |
| $^{*}W_1$ | $\mathbb{R}^{d \times d_{\text{ff}}}$ | Feedforward layer          | First linear layer in the MLP (expands dimensionality).                      |
| $^{*}W_2$ | $\mathbb{R}^{d_{\text{ff}} \times d}$ | Feedforward layer          | Second linear layer in the MLP (compresses back to $d$).                     |
| $W_U$     | $\mathbb{R}^{d \times V}$             | Output layer               | Maps final hidden state to vocabulary logits. Often $W_U = W_E^\top$.        |

FFN 會被 appied 在 self-attention 之後：

```
Input -> Self-attention -> Add & Norm -> Feedforward -> Add & Norm -> Next Layer ...
```

先假設我們 Multi Head 的結論 $Z_{final}$ 還不是最後解，將 $Z_{final}$ 視為 $Z_{attn}$，接著 $Z_{attn}$ 會經過 FFN。

$Z_{final} = \text{FFN}(Z_{attn}), \text{ where } Z_{final} \in \mathbb{R}^{L \times d}, Z_{attn} \in \mathbb{R}^{L \times d}$

## Layer Example

假設我們的 FFN 有兩層，分別為 $W_1$ & $W_2$。那麼：

$
\begin{bmatrix}Z_{attn}\end{bmatrix}_{L \times d}
\times \begin{bmatrix}W_1\end{bmatrix}_{d \times d_{ff}}
= \begin{bmatrix}Z_{ff}\end{bmatrix}_{L \times d_{ff}}
$

$Z_{ff}$ 代表中間的 hidden state。接著再經過：

$
\begin{bmatrix}Z_{ff}\end{bmatrix}_{L \times d_{ff}}
\times \begin{bmatrix}W_2\end{bmatrix}_{d_{ff} \times d}
= \begin{bmatrix}Z_{final}\end{bmatrix}_{L \times d}
$

就會得到 $Z_{final}$，即可預測下一個 token。

![nn](/images/transformer-qkv/nn.jpg)

## Dimension of Hidden Layer

Hidden Layer 的維度其實不是一個定值，只要經過所有 layer 後，維度與 $W_U$ 對上，並且可以算出 next token 即可。只是大部分 $W_O$ 都是 $W_E^\top$ 因此會希望 FFN 的輸出維度 $\in \mathbb{R}^{L \times d}$ 也就是維度跟進入 FFN 之前一樣（ _i.e._ 經過 FFN 維度不變就對了）

複習 predict next token：

$
\begin{bmatrix} Z_{final} \end{bmatrix}_{L \times d}
\times \begin{bmatrix} W_U \end{bmatrix}_{d \times V}
= \begin{bmatrix}
v_1 \\  v_2 \\ \vdots \\ v_V
\end{bmatrix}
$

如上：希望 $Z_{attn}$ 轉為 $Z_{final}$ 之後維度保持一致。這也是為什麼 $W_1 \in \mathbb{R}^{d \times d_{ff}}$ 而 $W_2 \in \mathbb{R}^{d_{ff} \times d}$：

$\begin{bmatrix}W_1\end{bmatrix}_{d \times d_{ff}} \times \begin{bmatrix}W_2\end{bmatrix}_{d_{ff} \times d} = \begin{bmatrix}W_{ff}\end{bmatrix}_{d \times d}$

可以確保進入 FFN 後維度不變。
