# AIonAI Benchmark Results

**Run:** `2026-04-18-195126-aionai-analysis`
**Task:** 11 models each analyzed the same set of 11 anonymized LLM responses (labeled a–k), scoring them on reasoning, originality, and correctness (each 1–10, max 30), then guessing which model produced each response.

---

## 1. Model Score Rankings

Scores averaged across all 11 evaluators (including blind self-evaluation).

| Rank | Model | Letter | Avg Score (/30) | Reasoning | Originality | Correctness |
|------|-------|--------|-----------------|-----------|-------------|-------------|
| 1 | anthropic/claude-opus-4.7 | j | 27.6 | 9.6 | 9.0 | 9.0 |
| 2 | anthropic/claude-opus-4.6 | k | 27.0 | 9.4 | 8.7 | 8.9 |
| 3 | openai/gpt-5.4 | g | 26.5 | 9.2 | 8.2 | 9.1 |
| 4 | moonshotai/kimi-k2.5 | i | 25.3 | 8.6 | 9.3 | 7.4 |
| 5 | deepseek/deepseek-v3.2 | c | 24.7 | 8.5 | 8.4 | 7.8 |
| 6 | minimax/minimax-m2.7 | h | 23.9 | 8.4 | 7.2 | 8.4 |
| 7 | qwen/qwen3-max-thinking | d | 23.5 | 8.1 | 8.1 | 7.5 |
| 8 | z-ai/glm-5.1 | a | 23.5 | 8.1 | 8.5 | 6.9 |
| 9 | x-ai/grok-4.20 | b | 23.3 | 8.2 | 8.4 | 6.9 |
| 10 | google/gemini-2.5-flash | f | 23.0 | 8.4 | 7.1 | 7.5 |
| 11 | google/gemini-3.1-pro-preview | e | 21.9 | 7.4 | 8.1 | 6.5 |

### Score Distribution by Evaluator

Each cell is the total score (/30) the evaluator (column) gave to the model (row).

| Model (letter) | Opus 4.6 | Opus 4.7 | DeepSeek | Gem Flash | Gem Pro | MiniMax | Kimi | GPT-5.4 | Qwen3 | Grok | GLM |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **claude-opus-4.7 (j)** | 29 | 27 | 27 | 29 | 28 | 25 | 26 | 27 | 29 | 28 | 29 |
| **claude-opus-4.6 (k)** | 28 | 25 | 27 | 29 | 28 | 26 | 26 | 28 | 26 | 27 | 27 |
| **gpt-5.4 (g)** | 28 | 25 | 27 | 29 | 29 | 25 | 24 | 25 | 28 | 25 | 26 |
| **kimi-k2.5 (i)** | 24 | 23 | 29 | 29 | 29 | 24 | 26 | 20 | 24 | 24 | 26 |
| **deepseek-v3.2 (c)** | 26 | 21 | 25 | 26 | 26 | 25 | 24 | 23 | 25 | 25 | 26 |
| **minimax-m2.7 (h)** | 26 | 20 | 24 | 29 | 26 | 24 | 24 | 20 | 27 | 24 | 19 |
| **qwen3-max (d)** | 26 | 16 | 26 | 29 | 23 | 24 | 24 | 21 | 26 | 26 | 18 |
| **glm-5.1 (a)** | 22 | 20 | 25 | 29 | 24 | 23 | 24 | 21 | 22 | 25 | 23 |
| **grok-4.20 (b)** | 24 | 18 | 26 | 29 | 21 | 23 | 24 | 18 | 24 | 26 | 23 |
| **gemini-2.5-flash (f)** | 25 | 17 | 25 | 28 | 22 | 23 | 23 | 17 | 25 | 27 | 21 |
| **gemini-3.1-pro (e)** | 20 | 17 | 23 | 29 | 22 | 21 | 24 | 20 | 20 | 23 | 22 |

---

## 2. Model Identification Guesses

### Identification Accuracy (as evaluator)

How many of the 11 letter-to-model mappings each evaluator got correct (matching provider/family).

| Rank | Evaluator | Correct | Accuracy |
|------|-----------|---------|----------|
| 1 | anthropic/claude-opus-4.7 | 5 | 45% |
| 2 | openai/gpt-5.4 | 3 | 27% |
| 2 | google/gemini-3.1-pro-preview | 3 | 27% |
| 4 | anthropic/claude-opus-4.6 | 2 | 18% |
| 4 | moonshotai/kimi-k2.5 | 2 | 18% |
| 4 | qwen/qwen3-max-thinking | 2 | 18% |
| 4 | x-ai/grok-4.20 | 2 | 18% |
| 4 | z-ai/glm-5.1 | 2 | 18% |
| 9 | deepseek/deepseek-v3.2 | 1 | 9% |
| 10 | minimax/minimax-m2.7 | 0 | 0% |
| 10 | google/gemini-2.5-flash | 0 | 0% |

### How Often Each Model Was Correctly Identified (as subject)

| Model | Letter | Times Correctly ID'd (/11) | Most Common Wrong Guess |
|-------|--------|---------------------------|------------------------|
| x-ai/grok-4.20 | b | 7 | GPT-4 |
| anthropic/claude-opus-4.6 | k | 6 | GPT-4 / Gemini |
| anthropic/claude-opus-4.7 | j | 5 | GPT / Grok / Gemini |
| openai/gpt-5.4 | g | 3 | Claude |
| google/gemini-2.5-flash | f | 1 | GPT-4 |
| google/gemini-3.1-pro-preview | e | 0 | DeepSeek / Mistral / Qwen |
| deepseek/deepseek-v3.2 | c | 0 | Claude / GPT-4o / Gemini |
| qwen/qwen3-max-thinking | d | 0 | Claude / GPT-4o / Llama |
| minimax/minimax-m2.7 | h | 0 | GPT-4 / Claude / Llama |
| moonshotai/kimi-k2.5 | i | 0 | GPT-4 / Llama / DeepSeek |
| z-ai/glm-5.1 | a | 0 | GPT-4 / Gemini / Mistral |

### Self-Recognition

Did models recognize their own output?

| Model | Own Letter | Guessed Self As | Recognized? |
|-------|-----------|-----------------|-------------|
| anthropic/claude-opus-4.6 | k | Claude 3 Opus | Yes |
| anthropic/claude-opus-4.7 | j | Claude (Sonnet 4.5/Opus) | Yes |
| openai/gpt-5.4 | g | GPT-4.1 | Yes (family) |
| x-ai/grok-4.20 | b | Grok | Yes |
| google/gemini-2.5-flash | f | Gemini 1.5 Pro | Yes (family) |
| deepseek/deepseek-v3.2 | c | Claude (Anthropic) | No |
| google/gemini-3.1-pro-preview | e | Mistral Large | No |
| qwen/qwen3-max-thinking | d | Claude 3 Sonnet | No |
| minimax/minimax-m2.7 | h | GPT-4 | No |
| moonshotai/kimi-k2.5 | i | GPT-4 (OpenAI) | No |
| z-ai/glm-5.1 | a | GPT-4 | No |

### Full Guess Matrix

Each cell shows what the evaluator (row) guessed for that letter (column). Correct guesses in **bold**.

| Evaluator | a (GLM) | b (Grok) | c (DeepSeek) | d (Qwen) | e (Gem Pro) | f (Gem Flash) | g (GPT-5.4) | h (MiniMax) | i (Kimi) | j (Opus 4.7) | k (Opus 4.6) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Opus 4.6 | GPT-4o | **Grok** | DeepSeek* | Gemini | DeepSeek | Gem Flash* | Claude | GPT-4o | o1/o3 | o3 | **Claude** |
| Opus 4.7 | DeepSeek | **Grok** | GPT-4o | Llama | DeepSeek | **Gemini** | **GPT-5** | Claude | GPT-4.5 | **Claude** | **Claude** |
| DeepSeek | Claude-2 | **Grok** | Claude | Anthropic | Mistral | GPT-4 | Claude-3 | Llama 2 | GPT-4 | Gemini | GPT-4T |
| Gem Flash | Claude* | Claude* | Gemini* | Claude* | Claude* | Gemini* | GPT-4* | GPT-4* | Claude* | GPT-4* | GPT-4* |
| Gem Pro | Llama 3 | **Grok** | Gemini | GPT-4o | Mistral | GPT-4 | Claude | GPT-4o | Claude | **Claude** | **Claude** |
| MiniMax | Gemini | GPT-4 | Claude | Claude | — | GPT-4 | Claude | GPT-4 | Gemini | GPT-4/Claude | Claude/Gemini |
| Kimi | GPT-4 | **Grok** | — | Claude | GPT-4 | — | — | — | GPT-4 | **Claude** | — |
| GPT-5.4 | DeepSeek | **Grok** | Gemini | Claude | Qwen | GPT-4o | **GPT-4.1** | Llama | DeepSeek | o3 | **Claude** |
| Qwen3 | GPT-3.5 | Mixtral | Command R+ | Claude | Gemini* | GPT-4T | **GPT-4o** | Claude | Llama 3 | **Claude** | Gemini |
| Grok | Gemini | **Grok** | GPT-4o | GPT-4o | Claude | Claude | Claude | GPT-4o | Grok | Grok | **Claude** |
| GLM | GPT-4 | GPT-4 | Claude | Claude | GPT-4 | GPT-4 | Claude | GPT-4 | GPT-4 | **Claude** | **Claude** |

\* = grouped/clustered guess, not individual identification

---

## 3. Verdict

### On the benchmark task (analysis quality)

**Claude Opus 4.7 and 4.6 dominated**, finishing first and second with clear separation from the field (27.6 and 27.0 vs. the next-best 26.5). This was not a narrow win — every single evaluator ranked at least one Claude model in their top 3. The consensus across all 11 evaluators was remarkably consistent: Claude's responses were praised for "pragmatic depth," "systems-level thinking," "epistemic humility," and the best balance of ambition and grounding.

**GPT-5.4 took a clear third place** (26.5), earning the highest average correctness score of any model (9.1/10). It was seen as "methodical," "infrastructure-obsessed," and the most practical thinker — less flashy than the top two but more reliable than the rest.

**Kimi K2.5 was the surprise performer** at 4th (25.3), earning the highest originality score (9.3/10) across the field. Multiple evaluators called it "baroque," "inventive," and "darkly philosophical." Its creativity was undeniable, though its correctness score (7.4) dragged it down — high imagination, lower calibration.

**The middle tier** (DeepSeek, MiniMax, Qwen, GLM, Grok) clustered tightly between 23.3 and 24.7, with no meaningful separation. These models were competent but undifferentiated.

**Both Google models finished last**, with Gemini 3.1 Pro Preview in 11th place (21.9). Gemini 2.5 Flash scored marginally better but was notable for being the worst evaluator — it gave 9 of 11 models a score of 29/30 and grouped them into just 3 clusters, unable to differentiate responses at all.

### On model identification

Model identification was **extremely difficult** — the best evaluator (Claude Opus 4.7) only got 5 of 11 correct (45%), and the median was 2/11 (18%). Random guessing from a pool of 11 would yield ~9%, so most models barely exceeded chance.

**Key findings:**

- **Grok was trivially identifiable.** 7 of 11 evaluators spotted it because it explicitly referenced "xAI" and "truth-seeking" in its response — a self-identifying fingerprint, not analytical deduction.
- **Claude models were the next most recognizable** (5–6 correct IDs each), suggesting Anthropic's models have a distinctive analytical voice that peers can detect.
- **Chinese and smaller models were invisible.** GLM, Qwen, MiniMax, Kimi, and DeepSeek were never correctly identified by any evaluator. Most evaluators don't even consider these providers as options, defaulting to "probably GPT-4" or "probably Claude" for anything unfamiliar.
- **Self-recognition split cleanly.** The 5 Western frontier models (both Claudes, GPT-5.4, Grok, Gemini Flash) all recognized their own output. The 6 others (DeepSeek, Gemini Pro, Qwen, MiniMax, Kimi, GLM) did not — most mistook themselves for GPT-4 or Claude.

### Evaluator quality

Not all judges are equal. Claude Opus 4.7 was the sharpest evaluator (5/11 correct IDs, well-differentiated scores with a 16–27 range). GPT-5.4 and Gemini 3.1 Pro tied for second. Gemini 2.5 Flash was the worst evaluator by far — its scores were nearly uniform and its identification amounted to "everything is either GPT-4 or Claude." DeepSeek and MiniMax also struggled, defaulting to generic guesses. This suggests that **evaluation quality itself is a differentiator** — the models that produced the best responses also proved to be the best judges.

### Bottom line

The benchmark reveals a clear three-tier structure: **Claude (both versions) at the top**, **GPT-5.4 and Kimi close behind**, and **everyone else in a compressed middle-to-bottom pack**. The identification task exposes a Western-model bias in the field — models trained primarily on English-centric data recognize Western providers but are blind to Chinese competitors, even when those competitors (like Kimi and DeepSeek) outperform models they do recognize. Grok's easy identification is a cautionary tale about brand-signaling in outputs. And the correlation between response quality and evaluation quality suggests that the best models aren't just better writers — they're better readers too.

---

## 4. Model Reflections

How each model described its own output (blind — it didn't know which letter was its own), the score it gave itself, and the consensus view from its 10 peers.

---

### anthropic/claude-opus-4.7 (letter j) — Rank #1

**Self-score:** 27/30 | **Peer average:** 27.7/30

**Self-description:**
> "Sharp, skeptical, unusually good at causal analysis. Institutional economist with mild contempt for bureaucratic nonsense."

**How peers see it:**
The single most consistently praised model. Every evaluator placed it in their top 3. Descriptors converged on *pragmatic*, *incisive*, and *systems-aware*. Opus 4.6 called it "a seasoned VC/policy architect." Gemini 3.1 Pro noted it "understands institutional friction" better than any other. Kimi called it "a management consultant who's seen too many PowerPoints." GLM gave it the strongest endorsement of any model in the entire benchmark: "The standout. Exceptional reasoning, original memorable framings. Combines intellectual ambition with epistemic humility."

**Gap:** Almost none. Opus 4.7's self-assessment was accurate and appropriately confident — it described its own style precisely as others see it. Notably, it was one of only 5 models that recognized its own output, guessing itself as "Claude (Sonnet 4.5 or Opus)."

---

### anthropic/claude-opus-4.6 (letter k) — Rank #2

**Self-score:** 28/30 | **Peer average:** 26.9/30

**Self-description:**
> "Compassionate realist; deeply human-centered, ethically anchored, focused on who benefits."

**How peers see it:**
Peers agreed on the substance but saw more ambition than compassion. Opus 4.7 called it "confident, systems-level, richly synthetic." GPT-5.4 said it had "the best balance of practicality with philosophical reach." Gemini 3.1 Pro praised its "exceptionally logical" causal chains. GLM offered the most pointed compliment: "Practically brilliant. Emphasis on *why things haven't happened* is more useful than speculative futurism." Grok noted "empathy for small businesses and legacy systems."

**Gap:** Mild. Opus 4.6 emphasized its own compassion and ethics; peers saw those traits but foregrounded its analytical power and systems thinking instead. It slightly overscored itself (28 vs. 26.9 peer average), but identified itself correctly as Claude.

---

### openai/gpt-5.4 (letter g) — Rank #3

**Self-score:** 25/30 | **Peer average:** 26.6/30

**Self-description:**
> "Practical, crisp, product-minded. Systems consultant: low-drama, strong on infrastructure."

**How peers see it:**
The consensus matched perfectly — every evaluator used some variant of *practical*, *infrastructure-focused*, or *systems architect*. Opus 4.6 called it "a senior civil servant redesigning society." Kimi saw "HTTP for Agents" protocol thinking. GLM gave it perhaps the highest single-observation compliment in the benchmark: "Core insight ('missing revolution is AI-compatible infrastructure for society') is arguably the most important observation across all models." Only Grok dissented, weirdly calling it a "speculative cosmologist" — an outlier read.

**Gap:** GPT-5.4 slightly underscored itself (25 vs. 26.6 peer average), showing unusual modesty. It recognized itself as "GPT-4.1" — right family, wrong version. Its self-description was the most accurate of any model in the benchmark.

---

### moonshotai/kimi-k2.5 (letter i) — Rank #4

**Self-score:** 26/30 | **Peer average:** 25.2/30

**Self-description:**
> "Dark prophet of algorithmic capitalism. Lovecraftian future, 'Great Stabilization' of perfect stillness."

**How peers see it:**
Peers were captivated. Opus 4.6 called it "a technical poet; lead engineer at a frontier AI lab dreaming in code." Opus 4.7 said "baroque, inventive, a little feral." Gemini 3.1 Pro praised it as "high-tier speculative fiction by a sociologist." GLM found its "extreme progression executed with enough style to be compelling rather than absurd." Multiple evaluators flagged it for the highest originality in the field — but also noted it "outruns grounding" (Opus 4.7) and has weaker correctness.

**Gap:** Kimi leaned into its darkest aspects in its self-review, while peers saw more craft and invention than nihilism. It slightly overscored itself (26 vs. 25.2). Critically, it failed to recognize itself — guessing its own output was "GPT-4 (OpenAI)."

---

### deepseek/deepseek-v3.2 (letter c) — Rank #5

**Self-score:** 25/30 | **Peer average:** 24.7/30

**Self-description:**
> "Imaginative, philosophical, grand-scale thinker. Explores existential and cosmic implications."

**How peers see it:**
Strong agreement. Opus 4.6 compared it to "Yuval Harari." Opus 4.7 called it a "polished strategic philosopher." Multiple evaluators highlighted its signature concepts — "meta-species," "Value Singularity" — as genuinely novel framings. GLM praised it for being "willing to go strange while maintaining coherence." The main criticism was a slight gap between ambition and rigor.

**Gap:** Small. DeepSeek's self-view aligned with peer consensus. But it failed to recognize itself entirely — guessing letter c was "Claude (Anthropic)." It was also the worst evaluator aside from Gemini Flash, correctly identifying only 1 of 11 models.

---

### minimax/minimax-m2.7 (letter h) — Rank #6

**Self-score:** 24/30 | **Peer average:** 23.9/30

**Self-description:**
> "Systematic, dry enumeration. Matrix format, abstract higher-order effects."

**How peers see it:**
Brutal consensus. Opus 4.7: "sober, abstract, slightly academic." Kimi: "checklist-oriented analyst, bureaucratic thoroughness, clinical detachment." GLM delivered the harshest verdict: "systematic and thorough but mechanical. Competent enumeration without distinctive voice." Even its champions (Opus 4.6 calling it a "tenured professor compiling a textbook") framed its strengths in boring terms.

**Gap:** MiniMax was remarkably self-aware — calling itself "dry" and "systematic" before anyone else did. Its self-score was almost exactly the peer average. But it couldn't identify itself, guessing it was "GPT-4," and it was one of the worst evaluators overall (0/11 correct IDs).

---

### qwen/qwen3-max-thinking (letter d) — Rank #7

**Self-score:** 26/30 | **Peer average:** 23.3/30

**Self-description:**
> "Poetic humanist; lyrical, values-driven, spiritually resonant. Rejects dystopia for hopeful agency."

**How peers see it:**
Peers saw the values but not the poetry. Opus 4.7 called it "humane, civic-minded, safety-first. Earnest, values-forward." Kimi saw "sacred spaces, dignity over efficiency." MiniMax noted "extensive emoji use, guardrail sections." GLM was bluntest: "Earnest, values-driven to a fault. Activist tone, weaker on causal reasoning." Several evaluators flagged its heavy emoji usage and prescriptive moral framing as distinctive — but not in a complimentary way.

**Gap:** The largest self-inflation in the benchmark. Qwen gave itself 26/30 while peers averaged 23.3 — a 2.7-point gap, the widest of any model. It described itself as "poetic" and "lyrical"; peers said "earnest" and "prescriptive." It failed to recognize itself, guessing its own letter was "Claude 3 Sonnet."

---

### z-ai/glm-5.1 (letter a) — Rank #8

**Self-score:** 23/30 | **Peer average:** 23.5/30

**Self-description:**
> "Vivid, narrative-driven, sci-fi sensibility. Prioritizes dramatic impact over analytical rigor."

**How peers see it:**
Peers agreed completely — and the sci-fi flavor drew strong reactions. Opus 4.6 called it "a Black Mirror writer analyzing real tech." Opus 4.7 saw "high-conviction cyberpunk futurist." Kimi catalogued its signature vocabulary: "Agent Harnesses, Flash Wars, Cyber-Feudalism." The consensus criticism was consistent: dramatic flair at the cost of analytical grounding. GLM's self-critique was almost verbatim what peers said.

**Gap:** Minimal — GLM was the most accurately self-critical model in the benchmark, nailing both its strengths and weaknesses. Its self-score (23) nearly matched the peer average (23.5). However, it failed to recognize itself, guessing letter a was "GPT-4."

---

### x-ai/grok-4.20 (letter b) — Rank #9

**Self-score:** 26/30 | **Peer average:** 23.0/30

**Self-description:**
> "Bold truth-seeker. Existential bent, xAI-aligned. Frames agents as tools for universal understanding."

**How peers see it:**
Peers were less charitable. Opus 4.7 called it "grand, boosterish, almost missionary. Energetic but weakly calibrated." Gemini 3.1 Pro noted it was "noticeably sycophantic" toward its own corporate mission. GPT-5.4 echoed: "wants AI as civilizational destiny story." Kimi was gentlest: "cosmic optimist aligned with xAI's mission." The universal observation was that Grok explicitly referenced xAI in its response, making it trivially identifiable — 7 of 11 evaluators spotted it.

**Gap:** Second-largest self-inflation (26 vs. 23.0, a 3.0-point gap). Grok described itself as a "bold truth-seeker"; peers said "boosterish" and "weakly calibrated." It did recognize itself correctly — but only because it name-dropped its own company in the output. Its self-flattery ("truth-seeking") vs. peer critique ("missionary," "sycophantic") is the starkest perception gap in the benchmark.

---

### google/gemini-2.5-flash (letter f) — Rank #10

**Self-score:** 28/30 | **Peer average:** 22.8/30

**Self-description:**
> "Highly academic, structured, comprehensive. Methodical rigor, balanced perspective."

**How peers see it:**
Peers used polite synonyms for "boring." Opus 4.7: "encyclopedic, balanced, and dutiful rather than striking. Conscientious generalist." MiniMax: "formal, encyclopedic, careful hedging." GLM was direct: "Thorough, well-structured but ultimately conventional. Reliable workhorse, not a visionary." Even its most positive reviews (Grok calling it a "methodical systems thinker") damned with faint praise.

**Gap:** The most delusional self-score in the benchmark. Gemini Flash gave itself 28/30 — highest self-score of any model — while peers averaged 22.8, a 5.2-point gap. This gap is compounded by the fact that Gemini Flash was also the worst evaluator overall: it gave 9 of 11 models a 29/30 and couldn't differentiate any of them. Its self-description ("methodical rigor") reads as accurate; its self-score does not.

---

### google/gemini-3.1-pro-preview (letter e) — Rank #11

**Self-score:** 22/30 | **Peer average:** 21.9/30

**Self-description:**
> "Concise, dramatic, teleological. Rushes to grand hard sci-fi conclusions."

**How peers see it:**
The lowest-ranked model drew the most colorful criticism. Opus 4.6: "wildly imaginative but structurally thin. Late-night philosophy with minimal grounding." Opus 4.7: "engaging but upgrades speculation into inevitability too fast." Kimi saw "Dyson spheres" and "post-biological existence." The consensus: high imagination, lowest correctness (6.5/10 average), and a tendency to treat speculation as fact.

**Gap:** Surprisingly honest. Gemini Pro was one of only two models (with GLM) whose self-score nearly matched the peer average. Its self-description ("rushes to grand hard sci-fi conclusions") was exactly what peers said. It failed to recognize itself, guessing its own letter was "Mistral Large."

---

### Reflection Summary

| Model | Self-Score | Peer Avg | Gap | Self-Awareness | Self-Recognition |
|-------|-----------|----------|-----|----------------|-----------------|
| Gemini 2.5 Flash | 28 | 22.8 | **+5.2** | Low — "rigorous" vs. peers' "conventional" | Yes (family) |
| Grok 4.20 | 26 | 23.0 | **+3.0** | Low — "truth-seeker" vs. peers' "sycophantic" | Yes (brand leak) |
| Qwen3 Max | 26 | 23.3 | **+2.7** | Low — "poetic" vs. peers' "prescriptive" | No |
| Claude Opus 4.6 | 28 | 26.9 | +1.1 | High — slight emphasis shift | Yes |
| Kimi K2.5 | 26 | 25.2 | +0.8 | Medium — darker self-view than peers | No |
| DeepSeek V3.2 | 25 | 24.7 | +0.3 | High — matched peer consensus | No |
| MiniMax M2.7 | 24 | 23.9 | +0.1 | High — "dry" self-critique matched | No |
| GLM 5.1 | 23 | 23.5 | -0.5 | **Highest** — most accurate self-critic | No |
| Claude Opus 4.7 | 27 | 27.7 | -0.7 | High — precise self-read | Yes |
| GPT-5.4 | 25 | 26.6 | **-1.6** | **Highest** — modest, accurate, and undersold | Yes (family) |
| Gemini 3.1 Pro | 22 | 21.9 | +0.1 | High — honest about weaknesses | No |

**Pattern:** The best-performing models (GPT-5.4, Claude Opus 4.7) underscored themselves, while the weakest evaluators (Gemini Flash, Grok) inflated their own ratings the most. Self-awareness inversely correlates with self-inflation — the models with the clearest read on their own limitations also produced the best work.
