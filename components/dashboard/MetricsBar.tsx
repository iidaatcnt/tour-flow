type MetricsBarProps = {
  todayTourCount: number
  pendingInquiryCount: number
  photoProgress: string
  doneTourCount: number
  sentTourCount: number
}

export function MetricsBar({
  todayTourCount,
  pendingInquiryCount,
  photoProgress,
  doneTourCount,
  sentTourCount,
}: MetricsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <p className="text-xs text-gray-500">今日のツアー</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{todayTourCount}件</p>
      </div>
      <div className={`bg-white rounded-lg p-4 shadow-sm border ${pendingInquiryCount > 0 ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
        <p className="text-xs text-gray-500">未対応問い合わせ</p>
        <p className={`text-2xl font-bold mt-1 ${pendingInquiryCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
          {pendingInquiryCount}件
        </p>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <p className="text-xs text-gray-500">写真送付進捗</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{photoProgress}</p>
        <p className="text-xs text-gray-400">完了ツアー/送付済み</p>
      </div>
    </div>
  )
}
