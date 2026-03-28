---
title: Why Modern LLMs Favor Decoder-Only Architectures
date: 2026-03-28
description: Why Modern LLMs Favor Decoder-Only Architectures
tags: ['NLP']
type: writing
---

# Why Modern LLMs Favor Decoder-Only Architectures

In 2018, BERT dominated NLP. Bidirectional attention seemed like the obvious future, and much of the research community aligned around that belief.

Yet today, every frontier model—GPT, Llama, DeepSeek, Qwen, Gemini—uses a decoder-only architecture.

This shift wasn’t accidental, nor was it simply copying OpenAI. Decoder-only models won because they offer a set of structural advantages that become decisive at scale. What looked like a design choice in 2018 became a necessity by 2024.

---

## Training Efficiency and the Train–Inference Mismatch

The first advantage is simple but profound: **training efficiency**.

Decoder-only models use next-token prediction. Every token in a sequence contributes to the loss.

- A 1,024-token document provides 1,024 training signals.
- There is no wasted computation.

By contrast, bidirectional models like BERT use a masked language modeling objective where only about **15% of tokens are selected as prediction targets,** and loss is computed solely on those tokens.[^1] The remaining ~85% of tokens do not contribute direct training signal in each step.

[^1]: Devlin, J., Chang, M.-W., Lee, K., & Toutanova, K. (2018). _BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding_. https://arxiv.org/abs/1810.04805

Beyond simple efficiency, there is a deeper architectural issue: the **train–inference mismatch**.

- BERT trains on corrupted text (predicting masked tokens).
- But it is used on clean text during inference.

This mismatch is fundamental. The model is optimized for a task it never actually performs in production. Decoder-only models avoid this entirely because their training objective—strictly left-to-right generation—is exactly how they are used during inference. This alignment leads to more stable and scalable learning.

---

## The Paradigm Shift of In-Context Learning

The real inflection point for decoder-only models came with GPT-3, which revealed something unexpected: **in-context learning**.

Decoder-only models don’t just learn specific tasks; they learn how to _adapt to tasks from context_. You can provide examples in a prompt and immediately get task performance without any fine-tuning or gradient updates.

This fundamentally changes the deployment model.

The traditional **BERT-style workflow** required significant friction:

- Collect labeled data
- Add a task-specific head
- Fine-tune the model
- Deploy a separate, specialized model

The **decoder-only workflow** is radically simpler:

- Write a prompt

To understand why this works, it helps to look at how encoder–decoder models differ. In an encoder–decoder architecture, the input is processed by the encoder, while the decoder is trained to generate the final output. If you provide examples like:

```
cat → gato
dog → perro
bird →
```

the entire sequence is treated as input to the encoder, and the decoder is only trained to produce the final answer. The model was never trained to interpret these examples as a sequence of demonstrations to learn from.

Decoder-only models, on the other hand, are trained to predict the next token given everything that came before. This makes them naturally good at recognizing patterns within a prompt and continuing them. In this setup, the examples aren’t just inputs—they are _part of the generation process itself._

As a result, encoder–decoder models tend to treat demonstrations as static context, while decoder-only models treat them as dynamic patterns to extend. This difference in training leads to a crucial gap: encoder–decoder models lack strong signals for learning transformations from a handful of examples, making in-context learning far less natural and reliable.

---

## Causal Modeling vs. Statistical Shortcuts

It’s tempting to think bidirectional attention is inherently superior because it sees "more context" by looking ahead. But seeing the future can introduce statistical shortcuts.

Bidirectional models can look ahead, exploit co-occurrence patterns, and fill in blanks without modeling the true underlying structure of the text. For example, if tasked with predicting the word "bark" in "The dog loves to [MASK] at the mailman," a bidirectional model can look at "mailman" and guess "bark" through simple association, without necessarily understanding the causal flow of the sentence. This can lead to shallow pattern matching rather than deep understanding.

Decoder-only models remove this shortcut entirely. Because they cannot see the future, they are forced to model how language unfolds over time. This enforces a **strictly causal, step-by-step generative process.** Rather than filling in missing pieces with global context, the model must construct outputs incrementally, mirroring the way sequences are produced in real-world settings.

While mechanistic interpretability is still an ongoing field of research, a growing body of empirical evidence suggests that this autoregressive constraint is closely tied to the emergence of stronger reasoning capabilities. Large-scale decoder-only models demonstrate in-context learning and task adaptation [^2], as well as improved performance when reasoning is explicitly structured step-by-step[^3].

[^2]: Brown, et al. (2023). _Language Models are Few-Shot Learners_. https://arxiv.org/abs/2005.14165

[^3]: Wei, et al. (2022). _Chain-of-Thought Prompting Elicits Reasoning in Large Language Models_. https://arxiv.org/abs/2201.11903

---

## Scaling Predictability and the T5 Problem

So, why not use encoder-decoder models like T5? On paper, they seem like a balanced solution, capturing both bidirectional context and generative capabilities. In practice, they introduce a critical problem: **uncertainty in scaling**.

Encoder-decoder architectures require researchers to make arbitrary decisions about parameter allocation:

- How many parameters go to the encoder?
- How many go to the decoder?

This split is hard to optimize and becomes highly unpredictable at a large scale. At frontier training costs—often exceeding $50 million per run—architectural uncertainty is simply unacceptable.

Decoder-only models avoid this dilemma by using one repeating block and one scaling axis. This simplicity enables **predictable scaling laws**, which are absolutely essential when experiments are extraordinarily expensive.

---

## Inference Efficiency and KV Caching

Training determines a model's theoretical capability, but inference determines its practical viability.

Decoder-only models are inherently optimized for efficient generation through **Key-Value (KV) caching**. Because attention in these models is strictly causal, past keys and values can be cached in memory. As the model generates new tokens, it doesn't need to recompute attention for the entire past context. This makes per-token generation highly efficient, even for extremely long documents.

Encoder-decoder models, however, require cross-attention to the full encoder output at _every_ decoder layer for _every_ generated token. This creates higher memory usage, higher latency, and ultimately, higher serving costs.

At the scale of millions of concurrent users, this inefficiency becomes a critical disadvantage.

---

## Conclusion

Decoder-only models didn’t win because they were obviously better in 2018. They won because they scale better across every dimension that matters:

- **Training efficiency:** No wasted compute on unmasked tokens.
- **Train–inference alignment:** Learning exactly what they will do in production.
- **In-context learning:** Zero-shot adaptation without fine-tuning.
- **Causal modeling:** Forcing deep reasoning instead of statistical shortcuts.
- **Predictable scaling:** Simple architectures that follow reliable laws.
- **Inference efficiency:** Fast, cacheable generation at scale.

Individually, each advantage is meaningful. Together, they form a structural lead that alternative architectures have not been able to overcome. At the frontier of AI, architectural simplicity isn’t a limitation—it’s the foundational requirement that makes massive scaling possible.
