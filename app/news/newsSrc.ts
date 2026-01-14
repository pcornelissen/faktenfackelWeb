export interface NewsItem {
  date: Date
  title: string
}

export const newsSrc: NewsItem[] = [
  {
    date: new Date('2025-12-17'),
    title: 'Start der Webseite mit einem kleinen Angebot an Faktenchecks',
  },
  {
    date: new Date('2025-12-29'),
    title: 'Kleinere Updates in den letzten Tagen',
  },
  {
    date: new Date('2025-12-30'),
    title: 'Glossareintrag zu Demonstrationsrecht und Verlinkung im Polizeigewalt Artikel',
  },
  {
    date: new Date('2026-01-02'),
    title: 'Neuer Artikel: Krise im Rentensystem',
  },
  {
    date: new Date('2026-01-11'),
    title: 'Ausführliche Quellenlinks eingeführt, beginnend mit dem Rentenkrise Artikel',
  },
  {
    date: new Date('2026-01-14'),
    title: 'Ausführliche Quellenlinks eingeführt, bei "Kriminalität bei Ausländern und Deutschen"',
  },
]
