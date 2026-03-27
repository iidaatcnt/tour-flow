export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ヘッダー */}
      <div className="bg-green-700 text-white rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2">📖 カヌーCRM 使い方マニュアル</h1>
        <p className="text-green-100">カヌーツアー会社のスタッフ向け業務管理システムの使い方をご説明します。</p>
      </div>

      {/* 目次 */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">📋 目次</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            { href: '#dashboard', label: '1. ダッシュボード' },
            { href: '#inquiries', label: '2. 問い合わせ管理' },
            { href: '#tours', label: '3. ツアー管理' },
            { href: '#photos', label: '4. 写真送付' },
            { href: '#handoff', label: '5. 引き継ぎノート' },
            { href: '#customers', label: '6. 顧客リスト' },
            { href: '#field', label: '7. フィールド画面' },
            { href: '#status', label: '8. スタッフ状況管理' },
          ].map(({ href, label }) => (
            <a key={href} href={href} className="text-green-700 hover:underline py-1">
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* 1. ダッシュボード */}
      <section id="dashboard" className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-2">1. ダッシュボード</h2>
        <p className="text-gray-600 text-sm">ログイン後に最初に表示される画面です。今日の業務状況が一目でわかります。</p>

        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">📊 上部の3つの指標</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li><strong>今日のツアー</strong>：本日予定されているツアーの件数</li>
              <li><strong>未対応問い合わせ</strong>：まだ誰も対応していない問い合わせの数（赤表示は要注意）</li>
              <li><strong>写真送付進捗</strong>：完了ツアーのうち写真を送付済みの割合</li>
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 折り返し電話アラート</h3>
            <p className="text-sm text-yellow-700">折り返し電話が必要なお客様がいる場合、赤いバナーで表示されます。最優先で対応してください。</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">📅 本日のツアー一覧</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">進行中</span> ツアーが今まさに実施中</li>
              <li><span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">待機中</span> これから始まるツアー</li>
              <li><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">完了</span> 終了したツアー</li>
              <li><span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-medium">キャンセル</span> 中止になったツアー</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">👥 チーム状況</h3>
            <p className="text-sm text-gray-600">スタッフ全員の現在の状況（ツアー中・オフィス・休憩中）がリアルタイムで確認できます。</p>
          </div>
        </div>
      </section>

      {/* 2. 問い合わせ管理 */}
      <section id="inquiries" className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-2">2. 問い合わせ管理</h2>
        <p className="text-gray-600 text-sm">お客様からの電話・メール・Webフォームなどの問い合わせを一元管理します。</p>

        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">📞 問い合わせを受けたら</h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>「問い合わせ」メニューを開く</li>
              <li>右上の「新規登録」ボタンをクリック</li>
              <li>チャネル（電話・メール・折り返し・Web）を選択</li>
              <li>顧客名・内容・カテゴリを入力して保存</li>
            </ol>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">🏷️ ステータスの使い方</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">未対応</span> 　まだ誰も対応していない状態。早めに「担当する」ボタンを押して担当者を設定しましょう</li>
              <li><span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">対応中</span> 　担当者が対応中。完了したら「完了にする」を押す</li>
              <li><span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs font-medium">完了</span> 　　対応が終わった問い合わせ。引き継ぎが必要な場合はポップアップで確認されます</li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">💡 ヒント：折り返し電話</h3>
            <p className="text-sm text-blue-700">チャネルを「折り返し電話」にすると、ダッシュボードのアラートに表示されます。緊急度を「今すぐ」にすると目立つ表示になります。</p>
          </div>
        </div>
      </section>

      {/* 3. ツアー管理 */}
      <section id="tours" className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-2">3. ツアー管理</h2>
        <p className="text-gray-600 text-sm">ツアーの予定・実施状況・参加者を管理します。</p>

        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">📅 ツアー一覧の見方</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>日付・時間・ツアー種類・担当ガイド・参加人数/定員が一覧で確認できます</li>
              <li>今日のツアーが上部に表示されます</li>
              <li>ツアー名をクリックすると詳細（参加者リスト）が見られます</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">🚣 ツアーのステータス変更</h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>ツアー開始時：「待機中」→「進行中」に変更</li>
              <li>ツアー終了時：「進行中」→「完了」に変更</li>
              <li>中止の場合：「キャンセル」に変更（理由をメモ欄に記入）</li>
            </ol>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">💡 写真送付との連携</h3>
            <p className="text-sm text-blue-700">ツアーが「完了」になると、写真送付ページでそのツアーが対象として表示されます。忘れずに写真を送付しましょう。</p>
          </div>
        </div>
      </section>

      {/* 4. 写真送付 */}
      <section id="photos" className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-2">4. 写真送付</h2>
        <p className="text-gray-600 text-sm">ツアー終了後にお客様へ写真を送付する際の確認フローです。送付漏れを防ぎます。</p>

        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">📸 写真送付の手順</h3>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li><strong>Step 1：宛先確認</strong>　参加者のメールアドレス・LINE等を確認しチェック</li>
              <li><strong>Step 2：枚数確認</strong>　送付する写真の枚数を入力</li>
              <li><strong>Step 3：送付実行</strong>　実際にお客様へ写真を送付し、「送付完了」ボタンを押す</li>
            </ol>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 再送付の場合</h3>
            <p className="text-sm text-yellow-700">お客様から「写真が届かない」などの連絡があった場合は「再送付」として記録できます。理由を入力してください。</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">📊 進捗の確認</h3>
            <p className="text-sm text-gray-600">ダッシュボードの「写真送付進捗」に「完了ツアー数/送付済みツアー数」が表示されます。未送付のツアーが残っていないか毎日確認しましょう。</p>
          </div>
        </div>
      </section>

      {/* 5. 引き継ぎノート */}
      <section id="handoff" className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-2">5. 引き継ぎノート</h2>
        <p className="text-gray-600 text-sm">シフト交代時やスタッフ間での業務引き継ぎ情報を記録します。口頭での伝達ミスを防ぎます。</p>

        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">📝 引き継ぎを作成する場面</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>問い合わせ対応中に別のスタッフに引き継ぐとき</li>
              <li>お客様との約束（折り返し電話・確認事項など）を記録したいとき</li>
              <li>シフト終了時に次のスタッフへ伝えたいことがあるとき</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">🏷️ ステータスの使い方</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li><span className="border-l-4 border-red-500 pl-2 text-xs font-medium text-red-700">緊急</span>　今すぐ対応が必要なもの（例：折り返し電話・クレーム対応）</li>
              <li><span className="border-l-4 border-amber-400 pl-2 text-xs font-medium text-amber-700">保留</span>　確認中・対応予定のもの</li>
              <li><span className="border-l-4 border-gray-200 pl-2 text-xs font-medium text-gray-500">完了</span>　対応が終わったもの</li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">💡 問い合わせからの自動作成</h3>
            <p className="text-sm text-blue-700">問い合わせを「完了」にした際に「引き継ぎメモを作成しますか？」と表示されます。そこからワンクリックで引き継ぎノートを作れます。</p>
          </div>
        </div>
      </section>

      {/* 6. 顧客リスト */}
      <section id="customers" className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-2">6. 顧客リスト</h2>
        <p className="text-gray-600 text-sm">お客様の情報・参加履歴を管理します。リピーターの把握に役立ちます。</p>

        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">👤 顧客タグの使い方</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li><span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">VIP</span>　　　特別対応が必要な大切なお客様</li>
              <li><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">リピーター</span>　複数回参加しているお客様</li>
              <li><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">要注意</span>　　キャンセル歴・遅刻歴があるお客様（念押し確認を忘れずに）</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">🔍 顧客の検索と確認</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>名前・電話番号・メールで検索できます</li>
              <li>顧客詳細では参加回数・最終参加日・メモが確認できます</li>
              <li>問い合わせ登録時に顧客を紐付けると履歴が自動で記録されます</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7. フィールド画面 */}
      <section id="field" className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-2">7. フィールド画面</h2>
        <p className="text-gray-600 text-sm">ツアーガイドがフィールド（屋外）で使う専用の画面です。スマートフォンでの利用を想定しています。</p>

        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">📱 フィールド画面でできること</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>オフィスからの通知を受け取る（遅刻情報・キャンセル連絡など）</li>
              <li>オフィスへ空き状況・コールバック依頼などをリクエスト送信</li>
              <li>緊急時のSOSボタン</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">🚣 ツアー中モードの使い方</h3>
            <p className="text-sm text-green-700">ナビバー右上のステータスを「ツアー中」に変更すると、緑のバナーが表示され「フィールド画面を開く」リンクが出ます。ツアー開始時に必ず変更しましょう。</p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 注意事項</h3>
            <p className="text-sm text-yellow-700">フィールド画面はリアルタイムで更新されます。通知を見逃さないよう、ツアー中はこまめに確認してください。</p>
          </div>
        </div>
      </section>

      {/* 8. スタッフ状況管理 */}
      <section id="status" className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-2">8. スタッフ状況管理</h2>
        <p className="text-gray-600 text-sm">自分の現在の状況をチーム全員に共有します。</p>

        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">🔄 ステータスの切り替え</h3>
            <p className="text-sm text-gray-600 mb-2">画面右上の名前の横にあるバッジをクリックして切り替えます。</p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li><span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">ツアー中</span>　ツアーに出ているとき。フィールドバナーが表示されます</li>
              <li><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">オフィス</span>　オフィスで勤務中</li>
              <li><span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">休憩中</span>　　休憩中・一時離席</li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">💡 チームコミュニケーションのコツ</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>出勤したらすぐにステータスを「オフィス」に変更する</li>
              <li>ツアー開始前に「ツアー中」に変更する</li>
              <li>ダッシュボードのチーム状況で他のスタッフの状況を確認してから連絡する</li>
            </ul>
          </div>
        </div>
      </section>

      {/* フッター */}
      <div className="bg-gray-50 rounded-xl p-6 text-center text-sm text-gray-500">
        <p>ご不明な点があれば代表（飯田）までご連絡ください。</p>
        <p className="mt-1">カヌーCRM v1.0 — {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
