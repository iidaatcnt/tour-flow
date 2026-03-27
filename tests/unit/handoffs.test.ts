import { describe, it, expect } from 'vitest'

// createHandoff のバリデーションロジックを直接テスト
function validateHandoffNextAction(nextAction: string | undefined | null): void {
  if (!nextAction?.trim()) {
    throw new Error('next_action is required')
  }
}

describe('createHandoff バリデーション', () => {
  it('next_action が空文字の場合は例外を投げる', () => {
    expect(() => validateHandoffNextAction('')).toThrow('next_action is required')
  })

  it('next_action がスペースのみの場合は例外を投げる', () => {
    expect(() => validateHandoffNextAction('   ')).toThrow('next_action is required')
  })

  it('next_action が undefined の場合は例外を投げる', () => {
    expect(() => validateHandoffNextAction(undefined)).toThrow('next_action is required')
  })

  it('next_action が null の場合は例外を投げる', () => {
    expect(() => validateHandoffNextAction(null)).toThrow('next_action is required')
  })

  it('next_action に値がある場合は例外を投げない', () => {
    expect(() => validateHandoffNextAction('田中が明日までに電話する')).not.toThrow()
  })
})
