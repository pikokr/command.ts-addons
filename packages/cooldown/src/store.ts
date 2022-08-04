import { Collection } from 'discord.js'

export abstract class AbstractCooldownStore {
  async set(key: string, endsAt: number): Promise<void> {
    throw new Error('Not implemented')
  }

  async get(key: string): Promise<number | null> {
    throw new Error('Not implemented')
  }
}

export class CollectionCooldownStore extends AbstractCooldownStore {
  collection = new Collection<string, number>()

  async get(key: string): Promise<number | null> {
    return this.collection.get(key) || null
  }

  async set(key: string, value: number): Promise<void> {
    this.collection.set(key, value)
  }
}

let store: AbstractCooldownStore = new CollectionCooldownStore()

export const getStore = (): AbstractCooldownStore => {
  return store
}

export const setStore = (s: AbstractCooldownStore) => {
  store = s
}
