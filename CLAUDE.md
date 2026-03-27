# カヌーツアー CRM — Claude Code プロジェクト設定

## プロジェクト概要
カヌーツアー事業者向け顧客管理システム。
小規模チーム（代表 + インストラクター2〜3名 + オンライン秘書2〜3名）が
繁忙期でも安全・正確に運営できる業務支援ツール。

モデル事業者: いいでカヌークラブ / YAMAGATA EXPERIENCE（山形県）
想定横展開先: カヤック・乗馬・トレッキング等の小規模アウトドア体験事業者

## 技術スタック
- **フロントエンド**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **バックエンド**: Next.js API Routes
- **DB**: Supabase (PostgreSQL) + Supabase Realtime（リアルタイム共有）
- **認証**: Supabase Auth
- **メール送信**: Resend API（BCC一斉送信）
- **通知**: Chatwork Webhook
- **ホスティング**: Vercel

## コマンド
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

## ディレクトリ構成
```
/app
  /(auth)/          # ログイン・認証ページ
  /(dashboard)/     # メインダッシュボード
    /inquiries/     # M2: 問い合わせ管理
    /tours/         # M3: ツアー管理
    /photos/        # M4: 写真送付
    /handoff/       # M5: 引き継ぎノート
    /customers/     # M6: 顧客リスト
    /field/         # M7: フィールド画面（スマホ向けシンプル版）
    /staff/         # M8: スタッフ稼働管理
    /reviews/       # M9: 顧客評価
    /meo/           # M10: Google口コミ・MEO
    /kpi/           # M11: 経営KPI（オーナーのみ）
/components
  /ui/              # 汎用UIコンポーネント（shadcn/ui ベース）
  /dashboard/       # ダッシュボード専用コンポーネント
  /field/           # フィールド画面専用（スマホ最適化）
/lib
  /supabase/        # DB クライアント・型定義
  /actions/         # Server Actions
  /hooks/           # カスタムフック
/supabase
  /migrations/      # DBマイグレーション
  /seed/            # シードデータ
```

## コーディング規約
- TypeScript strict モード。`any` 型禁止
- named export のみ（default export 禁止）
- Server Components 優先。クライアント処理は `'use client'` を明示
- DB アクセスは `/lib/actions/` の Server Actions 経由のみ
- エラーは必ず型付きで処理（`unknown` でキャッチして型ガード）
- 環境変数は `env.ts` で zod バリデーション済みものを使う

## 重要なビジネスルール（コードに反映必須）

### 写真送付の3ステップ強制
Step1（宛先確認）+ Step2（写真枚数確認）のチェックが両方 `true` にならないと
送付ボタンを `disabled` のままにする。これはUIルールではなく **技術的強制**。
サーバーサイドでも同条件を検証してAPIを拒否すること。

### フィールド画面の制約
フィールドモード中は「読む」と「ワンタップ送信」のみ。
テキスト入力フォームを表示してはいけない。
通知はすべて「返信不要」を明示する。

### 役割ベースの画面切り替え
同一アカウントでも `user_status`（tour / office / break）によって
表示コンポーネントを切り替える。DBのロールではなく **当日の状態** で制御。

### 引き継ぎメモの必須項目
`next_action` フィールドが空の場合、保存APIが400を返す。
フロントでも保存前に検証するが、バックエンドが最終ゲートキーパー。

## NEVER やってはいけないこと
- `.env` ファイルをコミット
- `any` 型の使用
- 写真送付APIをチェックなしで呼び出せる状態にする
- オーナー以外がKPIページや顧客データエクスポートにアクセスできる状態にする
- フィールド画面にテキスト入力フォームを置く

## テスト方針
- ビジネスルール（写真送付3ステップ・引き継ぎ必須項目）は **unit test 必須**
- 各ページの基本動作は Playwright E2E で smoke test
- 新機能は test → implement の順（TDD）
- PR前に `npm run typecheck && npm run test` が通ること

## 環境変数（.env.local に設定）
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
CHATWORK_API_TOKEN=
CHATWORK_ROOM_ID=
```

## 実装フェーズ（詳細は SPEC.md・PROMPT_PLAN.md を参照）
- **Phase 1 (MVP)**: M1〜M7 — 引き継ぎミス0件・写真送付ミス0件を実現
- **Phase 2**: M8〜M11 — KPI可視化・MEO対応
- **Phase 3**: 自動化（評価メール・通知Webhook）

現在の実装フェーズ: **Phase 1**
次のタスク: PROMPT_PLAN.md の未完了プロンプトを順番に実行
