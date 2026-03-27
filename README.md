# tour-flow

カヌーツアー事業者向け顧客管理システム（CRM）。
小規模チーム（代表 + インストラクター2〜3名 + オンライン秘書2〜3名）が
繁忙期でも安全・正確に運営できる業務支援ツール。

モデル事業者: いいでカヌークラブ / YAMAGATA EXPERIENCE（山形県）
想定横展開先: カヤック・乗馬・トレッキング等の小規模アウトドア体験事業者

- GitHub: https://github.com/iidaatcnt/tour-flow
- デプロイ先: Vercel（予定）
- DB: Supabase（予定）

---

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **バックエンド**: Next.js API Routes / Server Actions
- **DB**: Supabase (PostgreSQL) + Supabase Realtime
- **認証**: Supabase Auth
- **メール送信**: Resend API
- **通知**: Chatwork Webhook
- **ホスティング**: Vercel

---

## セットアップ

### 1. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` に以下を設定してください:

```
NEXT_PUBLIC_SUPABASE_URL=        # SupabaseプロジェクトのURL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key
RESEND_API_KEY=                  # Resend APIキー
CHATWORK_API_TOKEN=              # Chatwork APIトークン
CHATWORK_ROOM_ID=                # ChatworkルームID
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. shadcn/ui の初期化（初回のみ）

```bash
npx shadcn@latest init
```

### 4. Supabase のローカル起動

```bash
npx supabase start
npm run db:migrate
npm run db:seed
```

### 5. 開発サーバー起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く。

---

## コマンド一覧

```bash
npm run dev          # 開発サーバー起動 (port 3000)
npm run build        # プロダクションビルド
npm run test         # Vitest テスト実行
npm run test:e2e     # Playwright E2Eテスト
npm run lint         # ESLint
npm run typecheck    # TypeScript型チェック
npm run db:migrate   # Supabase マイグレーション実行
npm run db:seed      # テストデータ投入
```

---

## 実装状況

### ✅ 完了（P1-01）
- Next.js 14 (App Router + TypeScript strict) プロジェクト作成
- 全依存パッケージインストール済み
  - @supabase/ssr, @supabase/supabase-js
  - resend, zod, react-hook-form
  - tailwindcss（設定済み）
- CLAUDE.md 記載のディレクトリ構成を作成済み
- `lib/env.ts` — zod による環境変数バリデーション
- `lib/supabase/client.ts` — ブラウザ用 Supabase クライアント
- `lib/supabase/server.ts` — サーバー用 Supabase クライアント
- `lib/supabase/types.ts` — DB 型定義（プレースホルダー）
- `middleware.ts` — 認証チェック・オーナーロール制限
- `.env.local.example` — 環境変数テンプレート
- `.gitignore` — .env / supabase temp 除外設定済み

### ⬜ 未着手（次のタスク）
- P1-02: Supabase マイグレーション・RLS・シードデータ
- P1-03: 認証フロー（ログインページ・E2Eテスト）
- P1-04〜P1-18: 各モジュール実装

> 詳細は `PROMPT_PLAN.md` を参照。セッション開始時は:
> 「PROMPT_PLAN.md を読んで、未完了（[ ]）のプロンプトのうち最初のものを実行してください」

---

## Claude Code での継続方法

```bash
cd ~/MyProject/tour-flow
claude
```

→ 「PROMPT_PLAN.md の未完了プロンプトを順番に実行してください」と伝えるだけ。

---

## ドキュメント

| ファイル | 内容 |
|---|---|
| `CLAUDE.md` | プロジェクト設定・コーディング規約・ビジネスルール |
| `SPEC.md` | DB設計・API設計・コンポーネント設計 |
| `PROMPT_PLAN.md` | Phase 1〜3 の実装プロンプト計画（進捗管理） |
| `docs/canoe_crm_spec.docx` | ビジネス仕様書（詳細） |

---

*最終更新: 2026年3月27日*
