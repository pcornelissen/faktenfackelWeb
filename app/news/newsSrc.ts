export interface NewsItem {
  date: Date
  title: string
}

export const newsSrc: NewsItem[] = [
  {
    date: new Date('2025-11-26'),
    title: 'Start der Webseite mit einem kleinen Angebot an Faktenchecks'
  }
]
