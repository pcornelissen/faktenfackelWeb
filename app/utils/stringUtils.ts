export function capitalize(word: string) {
  if (word) {
    return word[0]?.toUpperCase() + word.substring(1)
  } else {
    return word
  }
}

export function dateString(date: string | Date) {
  return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
