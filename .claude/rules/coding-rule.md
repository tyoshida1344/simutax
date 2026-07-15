---
description: CSS のコーディングルール（margin 方向・余白値の制約）
paths:
  - "src/ui/styles/**/*.css"
---

# CSS コーディングルール

- **margin は原則 `margin-bottom` を使う**。`margin-top` は、フッターの押し下げや `p + p` の隣接兄弟パターンなど意味的に正当な場合のみ許容
- **margin / padding の値は4px区切り**（4, 8, 12, 16, 20, 24, 32, 48 …）。2px は許容するが、6px・10px・14px 等は使わない
