# HuggingFace モデルカード修正テンプレート

このファイルは HuggingFace AEGIS モデルカードの修正用テンプレートです。

---

## P0: v2.0 の `your-username` 置換箇所

以下をすべて実際のリンクに置換してください：

### Transformers 使用例

```python
# 変更前
model_name = "your-username/AEGIS-Phi-3.5-Instruct-v2.0"

# 変更後
model_name = "zapabobouj/AEGIS-Phi-3.5-Instinct-JP-v2.0"
```

### GGUF ダウンロード例

```bash
# 変更前
wget https://huggingface.co/your-username/AEGIS-Phi-3.5-Instruct-v2.0/resolve/main/AEGIS-Phi-3.5-Instruct-v2.0-Q4_K_M.gguf

# 変更後
wget https://huggingface.co/zapabobouj/AEGIS-Phi-3.5-Instinct-JP-v2.0/resolve/main/AEGIS-Phi-3.5-Instinct-JP-v2.0-Q4_K_M.gguf
```

### Citation

```bibtex
# 変更前
@misc{AEGIS-Phi,
  author = {{AI Research Team}},
  title = {AEGIS-Phi-3.5-Instruct: Japanese-optimized Phi-3.5 variant},
  year = {2024},
  url = {https://huggingface.co/your-username/AEGIS-Phi-3.5-Instruct-v2.0}
}

# 変更後
@misc{AEGIS-Phi,
  author = {Minegishi, Ryo},
  title = {AEGIS-Phi-3.5-Instinct-JP: Japanese-optimized Phi-3.5 variant with SO(8)T adaptation},
  year = {2026},
  url = {https://huggingface.co/zapabobouj/AEGIS-Phi-3.5-Instinct-JP-v2.0}
}
```

---

## P0: v2.2 ライセンス整合

### 現状の問題

- HF 上部タグ: `apache-2.0`
- ベースモデル (Phi-3.5-mini-instruct): MIT

### 推奨対応

1. HF ライセンスタグを `MIT` に変更
2. または、以下を Model Card に明記:

```markdown
## License

This model is released under MIT license, following the base model
[microsoft/Phi-3.5-mini-instruct](https://huggingface.co/microsoft/Phi-3.5-mini-instruct).

The fine-tuning data and training scripts are available under Apache-2.0.
```

---

## P0: v2.2 タグ整理

### 削除すべきタグ

- `multimodal` (テキストモデルなら不要)

### 追加推奨タグ

- `japanese`
- `instruct`
- `phi-3`
- `fine-tuned`

---

## P1: 評価の一本化 (lm-eval-harness)

### 再現可能な評価コマンド

```bash
# 環境
# - lm-eval: v0.4.x
# - HuggingFace Transformers: 4.40+
# - GPU: NVIDIA A100 80GB (or equivalent)

# AEGIS v2.2 評価
lm_eval --model hf \
  --model_args pretrained=zapabobouj/AEGIS-Phi3.5-v2.2,dtype=bfloat16 \
  --tasks mmlu,jcommonsenseqa,elyza_tasks_100 \
  --batch_size auto \
  --num_fewshot 5 \
  --output_path ./results/aegis-v2.2 \
  --log_samples

# ベースライン (Phi-3.5-mini-instruct) 評価
lm_eval --model hf \
  --model_args pretrained=microsoft/Phi-3.5-mini-instruct,dtype=bfloat16 \
  --tasks mmlu,jcommonsenseqa,elyza_tasks_100 \
  --batch_size auto \
  --num_fewshot 5 \
  --output_path ./results/phi35-baseline \
  --log_samples
```

### 評価結果テーブルのテンプレート

| Model                            | MMLU (5-shot) | JCommonsenseQA (5-shot) | ELYZA-100 (avg) | N   |
| -------------------------------- | ------------- | ----------------------- | --------------- | --- |
| Phi-3.5-mini-instruct (baseline) | XX.X%         | XX.X%                   | XX.X            | -   |
| AEGIS-Phi3.5-v2.2                | XX.X%         | XX.X%                   | XX.X            | -   |
| Δ (improvement)                  | +X.X%         | +X.X%                   | +X.X            | -   |

**Evaluation conditions:**

- Framework: lm-eval-harness v0.4.x
- Precision: bfloat16
- Hardware: NVIDIA A100 80GB
- Commit: `zapabobouj/AEGIS-Phi3.5-v2.2@<commit_hash>`

---

## P1: Context Length 明確化

### 現状の問題

`Context Length: 4096 tokens (131072 max)` は曖昧

### 推奨表記

```markdown
## Technical Specifications

| Specification                   | Value          |
| ------------------------------- | -------------- |
| Recommended context length      | 4,096 tokens   |
| Maximum context (RoPE extended) | 131,072 tokens |
| Training context                | 4,096 tokens   |

> **Note**: Performance is validated up to 4,096 tokens. Extended context (>4K)
> uses RoPE scaling and may have degraded quality for very long sequences.
```

---

## P2: GitHub リンク追加

Model Card の「Related Resources」に追加:

```markdown
## Related Resources

- **Training framework**: [zapabob/SO8T](https://github.com/zapabob/SO8T) -
  SO(8) symmetry-based residual adapter
- **Agent integration**:
  [zapabob/gemini-cli](https://github.com/zapabob/gemini-cli) - Terminal AI
  agent with DeepResearch
- **Evaluation scripts**: [Available in model repo files](./eval/)
```
