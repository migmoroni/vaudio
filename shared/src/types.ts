export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

export interface AudioFile {
  id: string
  name: string
  url: string
  duration: number
  size: number
}

export interface AppConfig {
  version: string
  platform: 'web' | 'mobile' | 'desktop'
  features: string[]
}

export type Platform = 'web' | 'mobile' | 'desktop'

export enum AppStatus {
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error'
}
