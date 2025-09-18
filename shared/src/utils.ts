export function getSharedMessage(): string {
  return 'Aplicação multiplataforma com código compartilhado!'
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR')
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}
