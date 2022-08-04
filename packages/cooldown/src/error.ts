export class CooldownError extends Error {
  /**
   * @param endsAt Cooldown ends at this time
   */
  constructor(public endsAt: number) {
    super()
  }
}
