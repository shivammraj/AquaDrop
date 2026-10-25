import { StorageMemento } from '../storage'

export class MockMemento implements StorageMemento {
  private store: Map<string, unknown> = new Map()

  constructor(initialData?: Record<string, unknown>) {
    if (initialData) {
      for (const [k, v] of Object.entries(initialData)) {
        this.store.set(k, v)
      }
    }
  }

  public get<T>(key: string): T | undefined
  public get<T>(key: string, defaultValue: T): T
  public get<T>(key: string, defaultValue?: T): T | undefined {
    if (this.store.has(key)) {
      return this.store.get(key) as T
    }
    return defaultValue
  }

  public update(key: string, value: unknown): Thenable<void> {
    if (value === undefined) {
      this.store.delete(key)
    } else {
      this.store.set(key, value)
    }
    return Promise.resolve()
  }

  public rawStore(): Map<string, unknown> {
    return this.store
  }
}
