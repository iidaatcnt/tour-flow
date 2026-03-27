# SPEC.md — カヌーツアー CRM 実装仕様

> Claude Code が実装時に参照する技術仕様書。
> ビジネス背景の詳細は `docs/business_spec.docx` を参照。

---

## データベース設計（Supabase / PostgreSQL）

### テーブル一覧

#### `profiles`（スタッフ）
```sql
id            uuid PRIMARY KEY REFERENCES auth.users
name          text NOT NULL
role          text CHECK (role IN ('owner', 'instructor', 'office')) NOT NULL
status        text CHECK (status IN ('tour', 'office', 'break')) DEFAULT 'office'
avatar_color  text DEFAULT '#E1F5EE'
created_at    timestamptz DEFAULT now()
```

#### `customers`（顧客）
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
name          text NOT NULL
name_kana     text
phone         text
email         text
tour_count    integer DEFAULT 0  -- 自動集計トリガーで更新
last_tour_date date
tags          text[] DEFAULT '{}'   -- 'repeater','vip','caution'
notes         text
created_at    timestamptz DEFAULT now()
```

#### `tours`（ツアー）
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
tour_date       date NOT NULL
start_time      time NOT NULL
tour_type       text NOT NULL  -- '水没林','湖カヌー','雪山トレッキング'
guide_id        uuid REFERENCES profiles
capacity        integer NOT NULL
participant_count integer DEFAULT 0
status          text CHECK (status IN ('waiting','active','done','cancelled')) DEFAULT 'waiting'
photos_uploaded boolean DEFAULT false
photos_sent     boolean DEFAULT false
photos_sent_at  timestamptz
photos_sent_by  uuid REFERENCES profiles
notes           text
created_at      timestamptz DEFAULT now()
```

#### `tour_participants`（ツアー参加者）
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
tour_id       uuid REFERENCES tours ON DELETE CASCADE
customer_id   uuid REFERENCES customers
party_size    integer DEFAULT 1
status        text CHECK (status IN ('confirmed','late','cancelled')) DEFAULT 'confirmed'
late_minutes  integer  -- 遅刻見込み分数
```

#### `inquiries`（問い合わせ）
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
received_at     timestamptz DEFAULT now()
channel         text CHECK (channel IN ('phone','email','callback','web')) NOT NULL
customer_id     uuid REFERENCES customers
customer_name   text NOT NULL  -- 顧客未登録時の一時保存
phone           text
email           text
category        text CHECK (category IN ('new_booking','change','cancel','clothes','photo','other')) NOT NULL
content         text NOT NULL
urgency         text CHECK (urgency IN ('immediate','today','later')) DEFAULT 'today'
status          text CHECK (status IN ('new','in_progress','done')) DEFAULT 'new'
assigned_to     uuid REFERENCES profiles
nutmeg_required boolean DEFAULT false
resolved_at     timestamptz
created_by      uuid REFERENCES profiles
```

#### `handoffs`（引き継ぎノート）
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
customer_id   uuid REFERENCES customers
inquiry_id    uuid REFERENCES inquiries
summary       text NOT NULL      -- 1行サマリー
history       text NOT NULL      -- 対応経緯
next_action   text NOT NULL      -- 必須: 誰が・何を・いつまでに（空不可）
status        text CHECK (status IN ('urgent','pending','done')) DEFAULT 'pending'
from_staff_id uuid REFERENCES profiles
to_staff_id   uuid REFERENCES profiles
created_at    timestamptz DEFAULT now()
updated_at    timestamptz DEFAULT now()

-- バリデーション: next_action が空文字禁止
CONSTRAINT next_action_not_empty CHECK (char_length(trim(next_action)) > 0)
```

#### `photo_sends`（写真送付ログ）
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
tour_id             uuid REFERENCES tours NOT NULL
check_recipients    boolean DEFAULT false  -- Step1完了フラグ
check_photo_count   integer                -- Step2: 確認した写真枚数
sent_at             timestamptz
sent_by             uuid REFERENCES profiles
recipient_count     integer
is_resend           boolean DEFAULT false
resend_reason       text  -- is_resend=true の場合は必須
created_at          timestamptz DEFAULT now()

-- Step1・Step2が完了しないとsent_atを設定できない
CONSTRAINT send_requires_checks CHECK (
  sent_at IS NULL OR (check_recipients = true AND check_photo_count IS NOT NULL AND check_photo_count > 0)
)
```

#### `field_requests`（フィールドリクエスト）
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
from_staff_id uuid REFERENCES profiles NOT NULL
request_type  text CHECK (request_type IN ('availability','callback','booking_check','urgent','sos')) NOT NULL
tour_id       uuid REFERENCES tours
message       text
status        text CHECK (status IN ('pending','resolved')) DEFAULT 'pending'
resolved_by   uuid REFERENCES profiles
resolved_at   timestamptz
created_at    timestamptz DEFAULT now()
```

#### `field_notifications`（フィールドへの通知）
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
to_staff_ids  uuid[]  -- 送信先（空配列 = 全員）
type          text CHECK (type IN ('late','cancel','change','availability','info','emergency')) NOT NULL
message       text NOT NULL
no_reply      boolean DEFAULT true
tour_id       uuid REFERENCES tours
sent_by       uuid REFERENCES profiles
created_at    timestamptz DEFAULT now()
```

#### `reviews`（顧客評価）
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
tour_id       uuid REFERENCES tours
customer_id   uuid REFERENCES customers
guide_id      uuid REFERENCES profiles
score         integer CHECK (score BETWEEN 1 AND 5) NOT NULL
comment       text
google_posted boolean DEFAULT false
google_nudged boolean DEFAULT false  -- Google誘導済みか
created_at    timestamptz DEFAULT now()
```

#### `google_reviews`（Google口コミ管理）
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
google_id     text UNIQUE  -- Google の口コミID
reviewer_name text
score         integer CHECK (score BETWEEN 1 AND 5)
comment       text
review_date   date
reply_status  text CHECK (reply_status IN ('none','draft','replied')) DEFAULT 'none'
reply_text    text
replied_at    timestamptz
replied_by    uuid REFERENCES profiles
owner_approval_required boolean DEFAULT false  -- ★2以下はtrue
created_at    timestamptz DEFAULT now()
```

#### `staff_shifts`（シフト）
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
staff_id      uuid REFERENCES profiles NOT NULL
shift_date    date NOT NULL
role          text CHECK (role IN ('tour','office','off')) NOT NULL
tour_id       uuid REFERENCES tours  -- ツアー担当時
hours_worked  numeric(4,1)  -- 終業時に入力
created_at    timestamptz DEFAULT now()
UNIQUE(staff_id, shift_date)
```

---

## API 設計（Next.js Server Actions / Route Handlers）

### 問い合わせ管理

```typescript
// /lib/actions/inquiries.ts

// 新規起票
createInquiry(data: InquiryCreateInput): Promise<Inquiry>

// 担当者をアサイン（同時に2人がアサインできないよう楽観的ロック）
assignInquiry(id: string, staffId: string): Promise<Inquiry>

// ステータス更新
updateInquiryStatus(id: string, status: InquiryStatus): Promise<Inquiry>

// 一覧取得（フィルタ・ソート付き）
getInquiries(filters: InquiryFilters): Promise<Inquiry[]>
```

### 写真送付（3ステップ強制）

```typescript
// /lib/actions/photos.ts

// Step1: 宛先確認
confirmRecipients(photoSendId: string): Promise<PhotoSend>

// Step2: 写真枚数確認
confirmPhotoCount(photoSendId: string, count: number): Promise<PhotoSend>

// Step3: 送付実行（Step1・Step2未完了なら 400 を返す）
executeSend(photoSendId: string): Promise<PhotoSend>
// 内部バリデーション:
//   if (!record.check_recipients || !record.check_photo_count) throw new Error('400: checks incomplete')
//   BCC送信 → Resend API
//   tours テーブルの photos_sent = true, photos_sent_at = now() に更新
```

### フィールド連携

```typescript
// /lib/actions/field.ts

// ワンタップリクエスト送信
sendFieldRequest(type: RequestType, tourId?: string): Promise<FieldRequest>

// オフィス→フィールド通知（返信不要形式）
sendFieldNotification(data: FieldNotificationInput): Promise<void>
// message に「返信不要。」を自動付与する

// フィールドリクエストを処理済みにする
resolveRequest(requestId: string): Promise<FieldRequest>
```

### 引き継ぎノート

```typescript
// /lib/actions/handoffs.ts

// 作成（next_action 空の場合は throw）
createHandoff(data: HandoffCreateInput): Promise<Handoff>
// バリデーション: if (!data.next_action?.trim()) throw new Error('next_action is required')

// 完了にする
completeHandoff(id: string): Promise<Handoff>

// 一覧（ステータス・担当者でフィルタ）
getHandoffs(filters: HandoffFilters): Promise<Handoff[]>
```

---

## コンポーネント設計

### ページ別コンポーネント

#### ダッシュボード（`/app/(dashboard)/page.tsx`）
- `<MetricsBar />` — 今日のツアー数・未対応件数・写真送付進捗
- `<TeamStatusBar />` — 全スタッフの現在状態
- `<TodayTourList />` — 本日のツアー一覧（ステータスバッジ付き）
- `<UrgentInquiries />` — 未対応・折り返し電話のリスト（赤バッジ）
- `<ActivityFeed />` — チーム共有フィード（Supabase Realtime で自動更新）

#### フィールド画面（`/app/(dashboard)/field/page.tsx`）
**スマホ最適化。テキスト入力フォーム禁止。**
- `<FieldNoticeList />` — オフィスからの通知（読むだけ）
- `<MyTourCard />` — 自分の現在ツアー・参加者リスト
- `<NextTourCard />` — 次のツアー予定
- `<TodayTourOverview />` — 全体のツアー進行状況
- `<OneTabRequestButtons />` — ワンタップリクエスト（5種類のボタン群）
- `<SosButton />` — 緊急連絡ボタン（赤・大きく）

#### 写真送付（`/app/(dashboard)/photos/page.tsx`）
- `<PhotoSendChecklist />` — ツアー別3ステップチェックリスト
  - Step1ボタン → `confirmRecipients()` → Step2ボタンが出現
  - Step2ボタン → 枚数入力 → `confirmPhotoCount()` → 送付ボタンが出現
  - 送付ボタン → 確認ダイアログ → `executeSend()`
  - **送付ボタンは Step1・Step2 が完了するまで `disabled` かつ視覚的にグレーアウト**
- `<PhotoSendLog />` — 本日の送付ログ（誰が・いつ・何枚）

---

## 認証・認可

### ミドルウェア（`/middleware.ts`）
```typescript
// 未ログインは /login にリダイレクト
// /kpi/* と /export/* は role='owner' のみアクセス可
// /field/* は全ロールアクセス可（ただし status='tour' 時の自動リダイレクト）
```

### Row Level Security（Supabase RLS）
```sql
-- customers: 全スタッフが読み取り可。書き込みは office・owner のみ
-- inquiries: 全スタッフが読み取り可。assigned_to の変更は本人か owner のみ
-- staff_shifts: 本人と owner のみ編集可
-- google_reviews: 全スタッフが読み取り可。reply はオーナー承認後に office が投稿
```

---

## リアルタイム更新（Supabase Realtime）

以下のテーブルの変更を全クライアントにブロードキャスト:
- `inquiries` — 新規問い合わせ・ステータス変更
- `tours` — 参加者変更・写真送付完了
- `field_notifications` — フィールドへの通知
- `field_requests` — フィールドからのリクエスト
- `handoffs` — 引き継ぎメモの更新

```typescript
// /lib/hooks/useRealtimeFeed.ts
// Supabase Realtime チャンネルを subscribe して
// React state を更新する custom hook
```

---

## エラーハンドリング方針

```typescript
// Server Actions は Result 型で返す
type Result<T> = { success: true; data: T } | { success: false; error: string; code: number }

// フロントは result.success をチェックしてから data を使う
// toast でエラーをユーザーに通知
```

---

## 環境・デプロイ

### ローカル開発
```bash
npx supabase start          # ローカル Supabase 起動
npm run db:migrate           # マイグレーション適用
npm run db:seed              # テストデータ投入
npm run dev                  # Next.js 起動
```

### プロダクション
- Vercel に GitHub 連携でデプロイ
- Supabase はクラウド（Free プラン → 必要に応じて Pro）
- 環境変数は Vercel の Environment Variables に設定

---

## Phase 1 完了条件

1. M1〜M7 の全ページが動作する
2. 写真送付の3ステップがサーバーサイドでも強制される（テストで証明）
3. 引き継ぎメモの `next_action` 空保存が API レベルで拒否される（テストで証明）
4. フィールド画面にテキスト入力フォームが存在しない
5. Supabase Realtime で全クライアントがリアルタイム更新される
6. 全ページがスマートフォン（375px幅）で使用可能
7. `npm run typecheck && npm run test` がすべてパス

---

*最終更新: 2026年3月27日*
*次のフェーズ仕様は Phase 1 完了後に追記する*

---

## 実装状況ログ

### P1-01 完了 — 2026年3月27日（Coworkにて実施）

**実施内容:**
- Next.js 14 (App Router, TypeScript strict) プロジェクト作成
- 依存パッケージインストール: `@supabase/ssr` `@supabase/supabase-js` `resend` `zod` `react-hook-form`
- CLAUDE.md 記載のディレクトリ構成を全て作成
- `lib/env.ts` — zod による環境変数バリデーション実装
- `lib/supabase/client.ts` — ブラウザ用クライアント（createBrowserClient）
- `lib/supabase/server.ts` — サーバー用クライアント（createServerClient + cookies）
- `lib/supabase/types.ts` — 主要テーブルの型定義（profiles/customers/tours/inquiries/handoffs）
- `middleware.ts` — 未ログインリダイレクト・owner ロール制限（/kpi/* /export/*）
- `.env.local.example` — 環境変数テンプレート
- `.gitignore` — .env / .next / supabase temp 除外設定

**未実施（shadcn/ui）:**
- `npx shadcn@latest init` はネットワーク制限によりVM内で実行不可
- ローカルで初回のみ手動実行が必要: `npx shadcn@latest init`

**次のステップ: P1-02**
- Supabase マイグレーションファイル作成（全テーブル・制約・RLS）
- photo_sends の CHECK 制約・handoffs の next_action_not_empty 制約を含む
- シードデータ作成（スタッフ4名・顧客10名・ツアー8件）
- `npm run db:migrate && npm run db:seed` の動作確認
