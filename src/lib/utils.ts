export const formatPrice = (value: number) => `PKR ${value.toLocaleString()}`

export const formatDate = (value: string) =>
  new Date(value).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })
