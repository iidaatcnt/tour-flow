# PROMPT_PLAN.md — カヌーツアー CRM 実装プロンプト計画

> **使い方**: Claude Code に以下のプロンプトを上から順に実行させる。
> 各プロンプトが完了したら `[x]` に更新してコミットする。
> 次のセッション開始時は「PROMPT_PLAN.md の未完了プロンプトを順番に実行してください」と伝えるだけ。

---

## Phase 1 — MVP（M1〜M7）

### 🏗️ セットアップ

- [x] **P1-01: プロジェクト初期化**
  ```
  Next.js 14 (App Router, TypeScript strict) プロジェクトを作成してください。
  依存パッケージ: @supabase/ssr, @supabase/supabase-js, tailwindcss, shadcn/ui, resend, zod, react-hook-form
  CLAUDE.md に記載のディレクトリ構成を作成し、
  env.ts で zod を使って環境変数をバリデーションする仕組みを作ってください。
  完了後 git commit してください。
  ```

- [x] **P1-02: Supabase セットアップ**
  ```
  SPEC.md のデータベース設計に基づいて Supabase マイグレーションファイルを作成してください。
  全テーブル・制約・RLS ポリシーを含めてください。
  特に photo_sends テーブルの CHECK 制約と handoffs の next_action_not_empty 制約は
  マイグレーションSQL に含めてください。
  /supabase/seed/ にテスト用シードデータ（スタッフ4名・顧客10名・ツアー8件）を作成してください。
  完了後 npm run db:migrate && npm run db:seed が通ることを確認し、git commit してください。
  ```

- [x] **P1-03: 認証フロー**
  ```
  Supabase Auth を使ったログインページ（/login）と middleware.ts を実装してください。
  - 未ログインは /login にリダイレクト
  - /kpi/* と /export/* は role='owner' のみアクセス可
  - ログイン後は /(dashboard) にリダイレクト
  Playwright で「未ログイン → /login にリダイレクト」のE2Eテストを書いてください。
  完了後 git commit してください。
  ```

---

### 📊 M1: ダッシュボード

- [ ] **P1-04: ダッシュボード基本レイアウト**
  ```
  /(dashboard)/page.tsx にダッシュボードを実装してください。
  SPEC.md のコンポーネント設計に従い、以下を含めてください:
  - MetricsBar（今日のツアー数・未対応問い合わせ数・写真送付進捗）
  - TeamStatusBar（全スタッフの status をリアルタイム表示）
  - TodayTourList（本日ツアー一覧）
  - UrgentInquiries（channel='callback' かつ status='new' を赤バッジで最上部表示）
  Supabase Realtime で inquiries と tours の変更を自動反映させてください。
  完了後 git commit してください。
  ```

- [ ] **P1-05: ユーザー状態切り替え**
  ```
  ダッシュボードのヘッダーに「今日の状態」セレクタ（tour / office / break）を実装してください。
  状態変更時に profiles.status を更新し、
  status='tour' の場合はフィールド画面（/field）への案内バナーを表示してください。
  TeamStatusBar がリアルタイムで全員の状態を反映することを確認してください。
  完了後 git commit してください。
  ```

---

### 📞 M2: 問い合わせ管理

- [ ] **P1-06: 問い合わせ一覧・フィルタ**
  ```
  /inquiries ページを実装してください。
  - チャネル・ステータス・緊急度でフィルタ
  - channel='callback' かつ status='new' は赤バッジで上部に固定表示
  - 2時間以上未対応の案件にアラート表示
  Vitest で「channel='callback' の案件がリスト上部に来ること」を unit test してください。
  完了後 git commit してください。
  ```

- [ ] **P1-07: 問い合わせ起票・担当割り当て**
  ```
  問い合わせ新規起票フォームを実装してください（SPEC.md の必須入力項目を参照）。
  「担当する」ボタンは assigned_to が未設定の場合のみ表示。
  同時に2人が割り当てられないよう、Supabase の SELECT FOR UPDATE または
  楽観的ロックで競合を防いでください。
  Server Action createInquiry と assignInquiry を実装してください。
  完了後 git commit してください。
  ```

- [ ] **P1-08: 問い合わせ 3ステータス管理**
  ```
  問い合わせのステータス（new → in_progress → done）をUI上で更新できるようにしてください。
  done にしたとき「引き継ぎメモを作成しますか？」のプロンプトを表示し、
  OKで /handoff/new に顧客名・用件をクエリパラメータ付きで遷移してください。
  完了後 git commit してください。
  ```

---

### 🚣 M3: ツアー管理

- [ ] **P1-09: 本日のツアー一覧**
  ```
  /tours ページを実装してください。
  - 今日の日付でフィルタされたツアー一覧を時刻順に表示
  - 各ツアーのステータス（waiting/active/done/cancelled）をバッジで表示
  - 担当ガイド・参加者数・特記事項を表示
  - 遅刻者がいる場合（tour_participants.status='late'）はアンバーバッジで表示
  完了後 git commit してください。
  ```

- [ ] **P1-10: 遅刻連絡受付**
  ```
  ツアー詳細画面に遅刻連絡受付フォームを実装してください。
  - 参加者を選択 → 遅刻見込み分数を入力 → tour_participants.status='late', late_minutes=N に更新
  - 更新と同時に field_notifications にレコードを作成（message: 「○○様 N分遅刻の見込みです。先に安全説明を進めてください。返信不要。」）
  - 担当ガイドのスマホに Supabase Realtime で即時通知
  完了後 git commit してください。
  ```

---

### 📷 M4: 写真送付

- [ ] **P1-11: 写真送付3ステップUI**
  ```
  /photos ページを実装してください。
  本日のツアーごとにカードを表示し、各カードに3ステップチェックリストを実装してください。

  Step1（宛先確認）:
    - 参加者メールアドレス一覧を表示
    - 「宛先を確認しました」チェックボックス → ON で confirmRecipients() 呼び出し

  Step2（写真枚数確認）:
    - Step1完了後のみ表示
    - 枚数入力フィールド → 「確認しました」ボタン → confirmPhotoCount() 呼び出し

  Step3（送付実行）:
    - Step1・Step2 完了後のみ送付ボタンを enabled にする
    - ボタンは disabled 時は視覚的にグレーアウト（cursor-not-allowed も設定）
    - 送付ボタンクリック → 確認ダイアログ → executeSend() 呼び出し

  Vitest で「Step1・Step2 未完了時に executeSend() が 400 を返すこと」を unit test してください。
  完了後 git commit してください。
  ```

- [ ] **P1-12: 写真送付ログ**
  ```
  /photos ページ下部に本日の送付ログを実装してください。
  - 送付日時・担当者・ツアー名・送付先人数・写真枚数を表示
  - 再送の場合は「再送: 理由○○」を表示
  - 送付完了ツアーのカードは完了スタイル（緑のボーダー・チェックマーク）に変更
  完了後 git commit してください。
  ```

---

### 📋 M5: 引き継ぎノート

- [ ] **P1-13: 引き継ぎノート一覧・作成**
  ```
  /handoff ページと引き継ぎメモ作成フォームを実装してください。

  フォームの必須項目:
    - 顧客名（customers から検索・選択）
    - 1行サマリー
    - 対応経緯
    - 次のアクション（誰が・何を・いつまでに）← 必須、空白禁止
    - ステータス（urgent/pending）
    - 引き継ぎ先スタッフ

  バリデーション:
    - next_action が空の場合はフォーム送信を拒否（クライアント）
    - Server Action でも next_action の空チェックを行い、空の場合は Error を throw（サーバー）

  Vitest で「next_action が空の createHandoff() が例外を投げること」を unit test してください。
  完了後 git commit してください。
  ```

- [ ] **P1-14: 引き継ぎノート ステータス管理**
  ```
  引き継ぎノートのステータス色分けを実装してください:
    - urgent: 赤ボーダー（左側3px）
    - pending: アンバーボーダー
    - done: グレー・半透明

  「完了にする」ボタンで completeHandoff() を呼び出し、ステータスを done に更新。
  Supabase Realtime で全クライアントにリアルタイム反映。
  完了後 git commit してください。
  ```

---

### 👥 M6: 顧客リスト

- [ ] **P1-15: 顧客リスト・検索**
  ```
  /customers ページを実装してください。
  - 氏名・フリガナ・電話・メールで検索（インクリメンタル検索）
  - tour_count（参加回数）・tags（リピーター/VIP等）を表示
  - 顧客カードをクリックして対応ログ・過去参加ツアーを表示
  - 新規顧客登録フォーム（問い合わせ起票時にも呼び出せる形にする）
  完了後 git commit してください。
  ```

---

### 📱 M7: フィールド連携

- [ ] **P1-16: フィールド画面（スマホ最適化）**
  ```
  /field ページを実装してください。
  SPEC.md のフィールド画面制約を厳守:
    - テキスト入力フォームを置かない
    - 全ての操作はタップのみ

  実装コンポーネント:
    - FieldNoticeList: field_notifications を新着順で表示（既読/未読なし、読むだけ）
    - MyTourCard: 自分の現在のツアー・参加者リスト（遅刻者はアンバー表示）
    - NextTourCard: 次のツアー（薄いスタイル）
    - TodayTourOverview: 全ツアーの簡易進行状況
    - OneTabRequestButtons: 以下のボタン（タップで即送信）
        「空き状況を確認してほしい」
        「折り返しをオフィスに任せたい」
        「予約内容を確認してほしい」
        「急ぎの対応をお願いしたい」
    - SosButton: 「SOS（緊急事態）」赤・大きいボタン

  Playwright で「/field ページに input[type=text] が存在しないこと」をE2Eテストしてください。
  完了後 git commit してください。
  ```

- [ ] **P1-17: オフィス→フィールド通知送信UI**
  ```
  オフィス画面のサイドバーに「フィールドへ送信」パネルを実装してください。
  - 送信先（全員 / 個別選択）
  - 通知種別プリセット（遅刻/キャンセル/変更/空き回答/情報）→ テンプレートメッセージを自動入力
  - メッセージ末尾に「返信不要。」を自動付与（編集不可）
  - 送信ボタン → sendFieldNotification() 呼び出し
  - /field の FieldNoticeList にリアルタイム反映

  Vitest で「sendFieldNotification() が message に必ず"返信不要。"を含むこと」をunit test。
  完了後 git commit してください。
  ```

---

### ✅ Phase 1 最終確認

- [ ] **P1-18: Phase 1 統合テスト・完了確認**
  ```
  以下の確認をすべて実施してください:

  1. npm run typecheck が全エラー0でパスすること
  2. npm run test が全テストパスすること（以下を含む）:
     - 写真送付: Step1・Step2未完了時にAPIが400を返すこと
     - 引き継ぎ: next_action空でAPIが例外を投げること
     - 通知: "返信不要。"が必ず含まれること
  3. Playwright E2E:
     - 未ログインリダイレクト
     - /field にテキスト入力フォームが存在しないこと
  4. スマートフォン幅（375px）で全ページをチェック
  5. 全コンポーネントで TypeScript エラーが0であること

  問題があれば修正してから git commit し、
  「Phase 1 完了。全テストパス。」と報告してください。
  ```

---

## Phase 2 — 成長（M8〜M11）
> Phase 1 完了後に着手。各プロンプトを追記・実行する。

- [ ] **P2-01: スタッフ稼働管理（M8）**
  ```
  /staff ページを実装してください。
  - 月選択 → 個人別稼働時間・ツアー回数・累計ツアー回数（習熟度）を表示
  - シフトカレンダー（週単位、tour/office/off の色分け）
  - 代表の稼働割合が30%超でアラートバナーを表示
  CSV エクスポート機能（オーナーのみ）も実装してください。
  完了後 git commit してください。
  ```

- [ ] **P2-02: 顧客評価収集（M9）**
  ```
  /reviews ページを実装してください。
  - ツアー終了後に評価依頼メール送信（手動トリガー → Phase 3で自動化）
  - 評価スコア入力フォーム（1〜5星 + コメント）
  - ガイド別の平均評価を表示
  - ★4以上の回答者に「Googleへの投稿を促すボタン」を表示
  完了後 git commit してください。
  ```

- [ ] **P2-03: Google口コミ・MEO（M10）**
  ```
  /meo ページを実装してください。
  - google_reviews テーブルの一覧表示（手動入力フロー）
  - 未返信口コミのアラート（★2以下は48時間以内返信・オーナー承認必須）
  - 返信文作成フォーム
  - MEO改善チェックリスト（静的コンテンツ）
  - 口コミ数の目標進捗バー
  完了後 git commit してください。
  ```

- [ ] **P2-04: 経営KPI（M11、オーナーのみ）**
  ```
  /kpi ページを実装してください（owner ロールのみアクセス可）。
  - 月次KPI: 参加者数・稼働率・キャンセル率・転換率・満足度・Google評価・リピーター率
  - スタッフKPI: 代表稼働割合・引き継ぎミス数・写真送付ミス数
  - 3シーズントレンド（年次比較）
  - KPIがアラート条件を満たした場合に警告バナーを表示
  - 社長メモ（textarea、Supabaseに保存）
  完了後 git commit してください。
  ```

---

## Phase 3 — 自動化
> Phase 2 完了後に着手。

- [ ] **P3-01: 評価メール自動送信**
  ```
  Supabase Edge Function を使って、ツアー完了から2時間後に評価依頼メールを
  自動送信する仕組みを実装してください（Resend API 使用）。
  送信対象: そのツアーの参加者メールアドレス
  完了後 git commit してください。
  ```

- [ ] **P3-02: Chatwork Webhook 自動通知**
  ```
  field_notifications テーブルに INSERT が発生したとき、
  Supabase Database Webhook → Next.js API Route → Chatwork Webhook の流れで
  自動通知が飛ぶようにしてください。
  完了後 git commit してください。
  ```

- [ ] **P3-03: テンプレート管理（M12）**
  ```
  /templates ページで以下のテンプレートを管理できるようにしてください:
  - メール返信テンプレート（服装案内・日程変更・写真送付）
  - Google口コミ返信テンプレート
  - フィールド通知テンプレート（遅刻・キャンセル等）
  問い合わせ対応画面と口コミ返信画面でテンプレートを選択・適用できるようにしてください。
  完了後 git commit してください。
  ```

---

## 運用メモ

### セッション開始時のプロンプト
```
PROMPT_PLAN.md を読んで、未完了（[ ]）のプロンプトのうち
最初のものを実行してください。完了したら [x] に更新してコミットし、
次のプロンプトに進む前に確認を取ってください。
```

### 行き詰まったとき
```
現在の実装状況を確認して、SPEC.md と CLAUDE.md と照らし合わせて
何が足りていないか、何が間違っているかを報告してください。
```

### テスト強制実行
```
npm run typecheck && npm run test && npm run test:e2e を実行して
全テストがパスすることを確認してください。失敗があれば修正してください。
```
