import { describe, it, expect } from 'vitest'

// sendFieldNotification の「返信不要。」付与ロジックをテスト
function appendNoReply(message: string): string {
  const trimmed = message.trimEnd()
  return trimmed.endsWith('返信不要。') ? message : `${trimmed} 返信不要。`
}

describe('sendFieldNotification — 返信不要。付与', () => {
  it('メッセージ末尾に「返信不要。」を自動付与する', () => {
    const result = appendNoReply('遅刻の見込みです。')
    expect(result).toContain('返信不要。')
    expect(result).toBe('遅刻の見込みです。 返信不要。')
  })

  it('既に「返信不要。」が含まれている場合は二重付与しない', () => {
    const msg = '遅刻の見込みです。返信不要。'
    const result = appendNoReply(msg)
    const count = (result.match(/返信不要。/g) ?? []).length
    expect(count).toBe(1)
  })

  it('末尾にスペースがある場合でも正しく付与する', () => {
    const result = appendNoReply('空き状況について。  ')
    expect(result).toContain('返信不要。')
    expect(result.endsWith('返信不要。')).toBe(true)
  })

  it('空のメッセージにも「返信不要。」が付与される', () => {
    const result = appendNoReply('')
    expect(result).toContain('返信不要。')
  })

  it('複数の通知パターンで必ず「返信不要。」が含まれる', () => {
    const messages = [
      '○○様がN分遅刻の見込みです。',
      'キャンセルのご連絡をいただきました。',
      '本日の予約内容に変更があります。',
    ]
    for (const msg of messages) {
      const result = appendNoReply(msg)
      expect(result).toContain('返信不要。')
    }
  })
})
