-- ============================================================
-- カヌーツアー CRM — 初期スキーマ
-- ============================================================

-- --------------------------------
-- profiles（スタッフ）
-- --------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name          text NOT NULL,
  role          text NOT NULL CHECK (role IN ('owner', 'instructor', 'office')),
  status        text NOT NULL DEFAULT 'office' CHECK (status IN ('tour', 'office', 'break')),
  avatar_color  text NOT NULL DEFAULT '#E1F5EE',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------
-- customers（顧客）
-- --------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  name_kana      text,
  phone          text,
  email          text,
  tour_count     integer NOT NULL DEFAULT 0,
  last_tour_date date,
  tags           text[] NOT NULL DEFAULT '{}',
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------
-- tours（ツアー）
-- --------------------------------
CREATE TABLE IF NOT EXISTS tours (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_date         date NOT NULL,
  start_time        time NOT NULL,
  tour_type         text NOT NULL,
  guide_id          uuid REFERENCES profiles,
  capacity          integer NOT NULL,
  participant_count integer NOT NULL DEFAULT 0,
  status            text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'done', 'cancelled')),
  photos_uploaded   boolean NOT NULL DEFAULT false,
  photos_sent       boolean NOT NULL DEFAULT false,
  photos_sent_at    timestamptz,
  photos_sent_by    uuid REFERENCES profiles,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------
-- tour_participants（ツアー参加者）
-- --------------------------------
CREATE TABLE IF NOT EXISTS tour_participants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id     uuid NOT NULL REFERENCES tours ON DELETE CASCADE,
  customer_id uuid REFERENCES customers,
  party_size  integer NOT NULL DEFAULT 1,
  status      text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'late', 'cancelled')),
  late_minutes integer
);

-- --------------------------------
-- inquiries（問い合わせ）
-- --------------------------------
CREATE TABLE IF NOT EXISTS inquiries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  received_at     timestamptz NOT NULL DEFAULT now(),
  channel         text NOT NULL CHECK (channel IN ('phone', 'email', 'callback', 'web')),
  customer_id     uuid REFERENCES customers,
  customer_name   text NOT NULL,
  phone           text,
  email           text,
  category        text NOT NULL CHECK (category IN ('new_booking', 'change', 'cancel', 'clothes', 'photo', 'other')),
  content         text NOT NULL,
  urgency         text NOT NULL DEFAULT 'today' CHECK (urgency IN ('immediate', 'today', 'later')),
  status          text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'done')),
  assigned_to     uuid REFERENCES profiles,
  nutmeg_required boolean NOT NULL DEFAULT false,
  resolved_at     timestamptz,
  created_by      uuid REFERENCES profiles
);

-- --------------------------------
-- handoffs（引き継ぎノート）
-- --------------------------------
CREATE TABLE IF NOT EXISTS handoffs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   uuid REFERENCES customers,
  inquiry_id    uuid REFERENCES inquiries,
  summary       text NOT NULL,
  history       text NOT NULL,
  next_action   text NOT NULL,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('urgent', 'pending', 'done')),
  from_staff_id uuid REFERENCES profiles,
  to_staff_id   uuid REFERENCES profiles,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT next_action_not_empty CHECK (char_length(trim(next_action)) > 0)
);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handoffs_updated_at
  BEFORE UPDATE ON handoffs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- --------------------------------
-- photo_sends（写真送付ログ）
-- --------------------------------
CREATE TABLE IF NOT EXISTS photo_sends (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id             uuid NOT NULL REFERENCES tours,
  check_recipients    boolean NOT NULL DEFAULT false,
  check_photo_count   integer,
  sent_at             timestamptz,
  sent_by             uuid REFERENCES profiles,
  recipient_count     integer,
  is_resend           boolean NOT NULL DEFAULT false,
  resend_reason       text,
  created_at          timestamptz NOT NULL DEFAULT now(),

  -- Step1・Step2が完了しないと sent_at を設定できない
  CONSTRAINT send_requires_checks CHECK (
    sent_at IS NULL OR (
      check_recipients = true
      AND check_photo_count IS NOT NULL
      AND check_photo_count > 0
    )
  )
);

-- --------------------------------
-- field_requests（フィールドリクエスト）
-- --------------------------------
CREATE TABLE IF NOT EXISTS field_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_staff_id uuid NOT NULL REFERENCES profiles,
  request_type  text NOT NULL CHECK (request_type IN ('availability', 'callback', 'booking_check', 'urgent', 'sos')),
  tour_id       uuid REFERENCES tours,
  message       text,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  resolved_by   uuid REFERENCES profiles,
  resolved_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------
-- field_notifications（フィールドへの通知）
-- --------------------------------
CREATE TABLE IF NOT EXISTS field_notifications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_staff_ids uuid[] NOT NULL DEFAULT '{}',
  type         text NOT NULL CHECK (type IN ('late', 'cancel', 'change', 'availability', 'info', 'emergency')),
  message      text NOT NULL,
  no_reply     boolean NOT NULL DEFAULT true,
  tour_id      uuid REFERENCES tours,
  sent_by      uuid REFERENCES profiles,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------
-- reviews（顧客評価）
-- --------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id       uuid REFERENCES tours,
  customer_id   uuid REFERENCES customers,
  guide_id      uuid REFERENCES profiles,
  score         integer NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment       text,
  google_posted boolean NOT NULL DEFAULT false,
  google_nudged boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------
-- google_reviews（Google口コミ管理）
-- --------------------------------
CREATE TABLE IF NOT EXISTS google_reviews (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id               text UNIQUE,
  reviewer_name           text,
  score                   integer CHECK (score BETWEEN 1 AND 5),
  comment                 text,
  review_date             date,
  reply_status            text NOT NULL DEFAULT 'none' CHECK (reply_status IN ('none', 'draft', 'replied')),
  reply_text              text,
  replied_at              timestamptz,
  replied_by              uuid REFERENCES profiles,
  owner_approval_required boolean NOT NULL DEFAULT false,
  created_at              timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------
-- staff_shifts（シフト）
-- --------------------------------
CREATE TABLE IF NOT EXISTS staff_shifts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id     uuid NOT NULL REFERENCES profiles,
  shift_date   date NOT NULL,
  role         text NOT NULL CHECK (role IN ('tour', 'office', 'off')),
  tour_id      uuid REFERENCES tours,
  hours_worked numeric(4,1),
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(staff_id, shift_date)
);

-- ============================================================
-- tour_count 自動更新トリガー
-- ============================================================
CREATE OR REPLACE FUNCTION update_customer_tour_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE customers
    SET tour_count = tour_count + 1,
        last_tour_date = (SELECT MAX(t.tour_date) FROM tours t JOIN tour_participants tp ON t.id = tp.tour_id WHERE tp.customer_id = NEW.customer_id)
    WHERE id = NEW.customer_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE customers
    SET tour_count = GREATEST(tour_count - 1, 0)
    WHERE id = OLD.customer_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tour_participants_count
  AFTER INSERT OR DELETE ON tour_participants
  FOR EACH ROW EXECUTE FUNCTION update_customer_tour_count();

-- ============================================================
-- RLS（Row Level Security）
-- ============================================================

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours              ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_participants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE handoffs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_sends        ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_requests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews            ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_reviews     ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts       ENABLE ROW LEVEL SECURITY;

-- profiles: 認証済みユーザーは全員参照可。自分のレコードのみ更新可。
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- customers: 認証済みユーザーは全操作可
CREATE POLICY "customers_all" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- tours: 認証済みユーザーは全操作可
CREATE POLICY "tours_all" ON tours FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- tour_participants: 認証済みユーザーは全操作可
CREATE POLICY "tour_participants_all" ON tour_participants FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- inquiries: 認証済みユーザーは全操作可
CREATE POLICY "inquiries_all" ON inquiries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- handoffs: 認証済みユーザーは全操作可
CREATE POLICY "handoffs_all" ON handoffs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- photo_sends: 認証済みユーザーは全操作可
CREATE POLICY "photo_sends_all" ON photo_sends FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- field_requests: 認証済みユーザーは全操作可
CREATE POLICY "field_requests_all" ON field_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- field_notifications: 認証済みユーザーは全操作可
CREATE POLICY "field_notifications_all" ON field_notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- reviews: 認証済みユーザーは全操作可
CREATE POLICY "reviews_all" ON reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- google_reviews: 認証済みユーザーは全操作可
CREATE POLICY "google_reviews_all" ON google_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- staff_shifts: 認証済みユーザーは全操作可
CREATE POLICY "staff_shifts_all" ON staff_shifts FOR ALL TO authenticated USING (true) WITH CHECK (true);
