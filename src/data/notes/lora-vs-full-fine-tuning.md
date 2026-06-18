---
title: LoRA vs. Full Fine-Tuning, and What "Frozen" Really Means
date: 2026-06-18
description: A clear look at how LoRA works, why the base model stays frozen, and when low-rank adaptation can match full fine-tuning.
tags: ['NLP', 'ML']
type: writing
---

# LoRA vs. Full Fine-Tuning

Fine-tuning a large language model the old way means touching every weight. For a 7B model that is billions of parameters, a lot of GPU memory, and a fresh full-size checkpoint each time you train. LoRA (Low-Rank Adaptation) takes a different route: leave the original model alone and train a small set of extra weights instead.

This post walks through how that works, what people mean when they say "the LLM is frozen," and when LoRA actually keeps up with full fine-tuning.

## What "frozen" means

You will often see a setup described like this:

> LoRA adapters on the LLM's attention (`q/k/v/o_proj`), LLM frozen.

"Frozen" means the original model weights are not updated during training. Only the LoRA adapter weights change.

A transformer's attention block has projection layers:

```text
q_proj
k_proj
v_proj
o_proj
```

Full fine-tuning would update the original matrices behind them:

```text
W_q, W_k, W_v, W_o
```

LoRA keeps those matrices fixed and adds a small trainable update next to each one:

```text
W_q + ΔW_q
W_k + ΔW_k
W_v + ΔW_v
W_o + ΔW_o
```

The trick is in how $\Delta W$ is built. Instead of a full $d \times d$ matrix, it is the product of two thin matrices:

$$
\Delta W = B A
$$

where $A \in \mathbb{R}^{r \times d}$ and $B \in \mathbb{R}^{d \times r}$, with the rank $r$ much smaller than $d$. Only $A$ and $B$ are trained.

The shapes are the whole point. A tall-thin $B$ times a short-wide $A$ produces a full $d \times d$ update, but the two factors hold far fewer numbers than the result:

$$
\underbrace{
\begin{bmatrix}
b_{11} & \cdots & b_{1r} \\
b_{21} & \cdots & b_{2r} \\
\vdots &        & \vdots \\
b_{d1} & \cdots & b_{dr}
\end{bmatrix}
}_{B \,\in\, \mathbb{R}^{d \times r}}
\underbrace{
\begin{bmatrix}
a_{11} & a_{12} & \cdots & a_{1d} \\
\vdots & \vdots &        & \vdots \\
a_{r1} & a_{r2} & \cdots & a_{rd}
\end{bmatrix}
}_{A \,\in\, \mathbb{R}^{r \times d}}
=
\underbrace{
\begin{bmatrix}
\Delta w_{11} & \cdots & \Delta w_{1d} \\
\vdots        & \ddots & \vdots \\
\Delta w_{d1} & \cdots & \Delta w_{dd}
\end{bmatrix}
}_{\Delta W \,\in\, \mathbb{R}^{d \times d}}
$$

The full update $W + \Delta W$ then keeps the same $d \times d$ shape the layer always had, so nothing downstream needs to change:

$$
\underbrace{
\begin{bmatrix}
w_{11} & \cdots & w_{1d} \\
\vdots & \ddots & \vdots \\
w_{d1} & \cdots & w_{dd}
\end{bmatrix}
}_{W \text{ (frozen)}}
+
\underbrace{
\begin{bmatrix}
\Delta w_{11} & \cdots & \Delta w_{1d} \\
\vdots        & \ddots & \vdots \\
\Delta w_{d1} & \cdots & \Delta w_{dd}
\end{bmatrix}
}_{BA \text{ (trained)}}
=
\begin{bmatrix}
w_{11} + \Delta w_{11} & \cdots & w_{1d} + \Delta w_{1d} \\
\vdots                 & \ddots & \vdots \\
w_{d1} + \Delta w_{d1} & \cdots & w_{dd} + \Delta w_{dd}
\end{bmatrix}
$$

Notice the parameter count. $B$ holds $d \times r$ numbers and $A$ holds $r \times d$, for $2dr$ trainable values in total, while the dense $\Delta W$ it stands in for would need $d^2$. As long as $r \ll d$, that is a huge saving.

A forward pass through one adapted layer looks like this:

```python
output = x @ W_frozen + x @ (B @ A)
```

And during backpropagation:

```text
W_frozen: no gradient update
A, B:     updated
```

So "frozen" does not mean the model is switched off. It still runs in full during the forward and backward passes. Its original parameters are simply treated as constants.

## Why bother

The payoff is size. A full $d \times d$ matrix has $d^2$ parameters. The low-rank version has $2 \cdot d \cdot r$. With $d = 4096$ and $r = 8$, that is roughly 16.7M parameters dropping to about 65K per layer—two orders of magnitude smaller.

In practice this means:

- Far less GPU memory, since you only store optimizer state for the adapter.
- Tiny checkpoints. A LoRA adapter is megabytes, not gigabytes.
- Lower risk of clobbering the base model's general knowledge, because the original weights never move.

After training you can either keep the adapter as a separate file or merge $BA$ back into $W$ for inference, paying no extra runtime cost.

## When LoRA matches full fine-tuning

LoRA used to be seen as the cheap option—always a notch below full fine-tuning. Thinking Machines Lab's [_LoRA Without Regret_](https://thinkingmachines.ai/blog/lora/) shows it can learn just as well, if you get these details right.

**Keep the dataset within the adapter's capacity.** A LoRA adapter is like a fixed-size container: it can only hold so much new information. As long as the dataset fits, LoRA keeps pace with full fine-tuning—true for typical instruction-tuning and reasoning datasets. It falls behind only when the data is too large to fit.

**Turn up the learning rate.** The learning rate sets how big each update step is, and LoRA needs steps about 10x bigger than full fine-tuning (the study measured ~9.8x, steady across models). Reuse your old learning rate and LoRA learns far too slowly.

**Don't adapt the attention layers alone.** A transformer layer has two parts: attention and the MLP (feed-forward block). Adapting only the attention projections (`q/k/v/o`) leaves performance on the table—the MLP is where LoRA does its real work. Attention-only LoRA even trails MLP-only LoRA at the same parameter count. The rule: apply LoRA to every layer, MLP included.

**Reinforcement learning barely needs any rank.** Rank sets the adapter's size. For RL (as in RLHF), rank 1 already matches full fine-tuning, because each episode teaches only about one bit, "good answer" or "bad answer", versus a signal on every token in supervised data. Less to learn, so a tiny adapter is plenty.

**Watch out for large batch sizes.** Batch size is how many examples the model sees before each update. As it grows, LoRA falls behind—and raising the rank does _not_ help. The cause is the math of multiplying $B$ by $A$, not a capacity limit. Keep the batch size modest.

## The short version

LoRA freezes the original model and learns a small low-rank update beside it. That makes fine-tuning cheap in memory, storage, and risk. It is not a strict downgrade from full fine-tuning—matched on dataset size, learning rate, and layer coverage, it holds its own. The main place it still struggles is large batch sizes, and figuring out why is still active research.

## References

- Thinking Machines Lab — [LoRA Without Regret](https://thinkingmachines.ai/blog/lora/)
- Hu et al. — [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
