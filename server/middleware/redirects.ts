// ─── Individual link redirects (must come before prefix redirects) ──────────
const linkRedirects: Record<string, string> = {
  // facebook-divers links with slug/target changes (override the -divers prefix)
  '/quellen/allgemein/facebook-divers/links/20251226.afd-nutzt-nazi-spr\u00fcche': '/quellen/politiker/andreas-audretsch/links/20251226.afd-nutzt-nazi-spr\u00fcche',
  '/quellen/allgemein/facebook-divers/links/20261226.gie\u00dfen-auto-f\u00e4hrt-in-menschenmenge': '/quellen/allgemein/facebook/links/20261226.tricks-der-afd',
  '/quellen/allgemein/facebook-divers/links/20260124.tricks-der-afd': '/quellen/allgemein/facebook/links/20251226.afd-missbraucht-rettungsgasse-siegen',

  // gaertner-gust link moved from facebook catch-all to own source
  '/quellen/allgemein/facebook/links/20260102.gaertner-gust-afd-verurteilungen': '/quellen/personen/andreas-gaertner-gust/links/20260102.gaertner-gust-afd-verurteilungen',

  // gegen-die-alternative-fur-deutschland link → facebook (source dissolved)
  '/quellen/allgemein/gegen-die-alternative-fur-deutschland/links/20260109.afd-w\u00e4hler-sind-nicht-alle-nazis': '/quellen/allgemein/facebook/links/20260109.afd-w\u00e4hler-sind-nicht-alle-nazis',

  // facebook → person/media sources (links currently at destination)
  '/quellen/allgemein/facebook/links/20251129.godless-gardener-kriminalitaet-christen': '/quellen/personen/godless-gardener/links/20251129.godless-gardener-kriminalitaet-christen',
  '/quellen/allgemein/facebook/links/20251231.in-the-know-mali-burkina-faso-travel-ban': '/quellen/medien/in-the-know/links/20251231.in-the-know-mali-burkina-faso-travel-ban',
  '/quellen/allgemein/facebook/links/20251231.in-the-know-trump-vetoes-bipartisan-bills': '/quellen/medien/in-the-know/links/20251231.in-the-know-trump-vetoes-bipartisan-bills',
  '/quellen/allgemein/facebook/links/20260108.justice-guy-ice-renee-nicole-good-arzt-blockiert': '/quellen/personen/the-justice-guy/links/20260108.justice-guy-ice-renee-nicole-good-arzt-blockiert',
  '/quellen/allgemein/facebook/links/20260123.yung-emil-nius-obsession-meinungsfreiheit-reichelt': '/quellen/personen/yung-emil/links/20260123.yung-emil-nius-obsession-meinungsfreiheit-reichelt',
  '/quellen/allgemein/facebook/links/20260201.justice-guy-trump-doj-fifagate': '/quellen/personen/the-justice-guy/links/20260201.justice-guy-trump-doj-fifagate',
  '/quellen/allgemein/facebook/links/20260201.pullupspastapolitics-miscarriage-help': '/quellen/personen/pullupspastapolitics/links/20260201.pullupspastapolitics-miscarriage-help',
  '/quellen/allgemein/facebook/links/20260201.steve-hofstetter-born-that-way': '/quellen/personen/steve-hofstetter/links/20260201.steve-hofstetter-born-that-way',
  '/quellen/allgemein/facebook/links/20260201.we-are-watching-you-afd-aussteiger-leschik': '/quellen/allgemein/we-are-watching-you/links/20260201.we-are-watching-you-afd-aussteiger-leschik',
  '/quellen/allgemein/facebook/links/20260201.we-are-watching-you-poschardt-video-teilen': '/quellen/allgemein/we-are-watching-you/links/20260201.we-are-watching-you-poschardt-video-teilen',
  '/quellen/allgemein/facebook/links/20260219.yung-emil-afd-wirtschaft-realitaet': '/quellen/personen/yung-emil/links/20260219.yung-emil-afd-wirtschaft-realitaet',

  // Existing sources with individual links moved to facebook/tiktok
  '/quellen/personen/skorpi-ya/links/20251102.380-milliarden-sondervermoegen': '/quellen/allgemein/facebook/links/20251102.380-milliarden-sondervermoegen',

  // Date corrections (wrong date prefix in old URL)
  '/quellen/allgemein/facebook/links/20260309.florian-dorn-afd-maerchenstunden-finanzierung': '/quellen/allgemein/facebook/links/20251215.florian-dorn-afd-maerchenstunden-finanzierung',
  '/quellen/allgemein/facebook/links/20260309.kai-whittaker-afd-buergergeldeigentor': '/quellen/allgemein/facebook/links/20251017.kai-whittaker-afd-buergergeldeigentor',
  '/quellen/allgemein/facebook/links/20260309.restzeit-afd-opfernarrativ-staatsanwaltschaft': '/quellen/allgemein/facebook/links/20251231.restzeit-afd-opfernarrativ-staatsanwaltschaft',
  '/quellen/allgemein/facebook/links/20260309.the-canary-reform-uk-farage-epstein': '/quellen/allgemein/facebook/links/20260102.the-canary-reform-uk-farage-epstein',
  '/quellen/allgemein/no-afd/links/20260309.no-afd-habeck-lacht-afd-aus': '/quellen/allgemein/no-afd/links/20251213.no-afd-habeck-lacht-afd-aus',
  '/quellen/personen/harry-sisson/links/20260309.harry-sisson-trump-reasons-make-no-sense': '/quellen/personen/harry-sisson/links/20260104.harry-sisson-trump-reasons-make-no-sense',
  '/quellen/personen/mutmacher/links/20260309.afd-ganz-still-buergergelddebatte': '/quellen/personen/mutmacher/links/20251108.afd-ganz-still-buergergelddebatte',
  '/quellen/wissenschaft/forrest-valkai/links/20260309.valkai-miriam-belmaker-biologie': '/quellen/wissenschaft/forrest-valkai/links/20251204.valkai-miriam-belmaker-biologie',
  '/quellen/wissenschaft/forrest-valkai/links/20260309.valkai-refuse-politics-privilege': '/quellen/wissenschaft/forrest-valkai/links/20260104.valkai-refuse-politics-privilege',

  // Slug corrections
  '/quellen/medien/compact/links/20251223.campact-fakenews-waffenlager-schwarzenberg': '/quellen/medien/compact/links/20251223.compact-fakenews-waffenlager-schwarzenberg',
  '/quellen/staatlich/gesetze-im-internet/links/20260115.asylg-paragraph-61': '/quellen/staatlich/gesetze-im-internet/links/20260115.asylg-artikel-61',

  // generation-deutschland link → facebook
  '/quellen/allgemein/generation-deutschland/links/20260131.generation-deutschland-auto-tatwaffe-rechtsextreme': '/quellen/allgemein/facebook/links/20260131.generation-deutschland-auto-tatwaffe-rechtsextreme',

  // Faktenchecks: moved articles and category listings (exact match only — articles remain at original paths)
  '/faktenchecks/gesellschaft/stadtbild': '/lagerfeuer/perspektiven/2025-12-12.merz-stadtbild',
  '/faktenchecks/gesellschaft/arbeitsmarkt/krise-im-rentensystem': '/lagerfeuer/perspektiven/2026-01-05.krise-im-rentensystem',
  '/faktenchecks/_vorlage': '/faktenchecks',
  '/faktenchecks/politik/parteien': '/faktenchecks',
}

// ─── Prefix redirects (source-level, applies to all sub-paths) ─────────────
const prefixRedirects: Record<string, string> = {
  // Existing prefix redirects
  '/quellen/allgemein/bluesky-divers': '/quellen/allgemein/bluesky',
  '/quellen/allgemein/facebook-divers': '/quellen/allgemein/facebook',
  '/quellen/allgemein/tiktok-divers': '/quellen/allgemein/tiktok',
  '/quellen/allgemein/x-divers': '/quellen/allgemein/x',
  '/quellen/portale/x-twitter': '/quellen/allgemein/x',
  '/quellen/medien/ndr/links': '/quellen/medien/ndr',
  '/quellen/nachrichten/tagesschau/links/quellen/tags/SPD': '/tags/spd',

  // Source renames
  '/quellen/personen/sabre': '/quellen/personen/sabre-bottleneckloser',
  '/quellen/personen/maurice-hofgen': '/quellen/personen/maurice-hoefgen',
  '/quellen/staatlich/lpb-rp': '/quellen/staatlich/lpb-rlp',
  '/quellen/personen/forrest-valkai': '/quellen/wissenschaft/forrest-valkai',

  // Umlaut → ASCII normalizations
  '/quellen/personen/maurice-h\u00f6ffgen': '/quellen/personen/maurice-hoefgen',
  '/quellen/personen/erik-t\u00fcrk': '/quellen/personen/erik-turk',
  '/quellen/personen/michael-br\u00fcck': '/quellen/personen/michael-bruck',
  '/quellen/politiker/clara-b\u00fcnger': '/quellen/politiker/clara-bunger',
  '/quellen/politiker/detlef-g\u00fcrth': '/quellen/politiker/detlef-gurth',
  '/quellen/staatlich/ausw\u00e4rtiges-amt': '/quellen/staatlich/auswartiges-amt',
  '/quellen/staatlich/vg-k\u00f6ln': '/quellen/staatlich/vg-koln',
  '/quellen/wissenschaft/dietrich-tr\u00e4nhardt': '/quellen/wissenschaft/dietrich-tranhardt',
  '/quellen/wissenschaft/gerhard-b\u00e4cker': '/quellen/wissenschaft/gerhard-backer',
  '/quellen/allgemein/gegen-die-alternative-f\u00fcr-deutschland': '/quellen/allgemein/gegen-die-alternative-fur-deutschland',

  // Dissolved sources (all content moved elsewhere)
  '/quellen/allgemein/gegen-die-alternative-fur-deutschland': '/quellen/allgemein',
  '/quellen/allgemein/generation-deutschland': '/quellen/allgemein/facebook',
  '/quellen/personen/b-sammy-davis': '/quellen/allgemein/facebook',
  '/quellen/personen/cedric-falter': '/quellen/allgemein/facebook',
  '/quellen/personen/chantel-alyssa': '/quellen/allgemein/facebook',
  '/quellen/personen/der-reichart': '/quellen/allgemein/facebook',
  '/quellen/personen/destiny-heckman': '/quellen/allgemein/facebook',
  '/quellen/personen/drayton-nay': '/quellen/allgemein/facebook',
  '/quellen/personen/hans-meiner': '/quellen/allgemein/facebook',
  '/quellen/personen/james-stew': '/quellen/allgemein/facebook',
  '/quellen/personen/john-halbach': '/quellen/allgemein/facebook',
  '/quellen/personen/ken-minyard': '/quellen/allgemein/facebook',
  '/quellen/personen/kopfkompass': '/quellen/allgemein/tiktok',
  '/quellen/personen/krassenstein-brothers': '/quellen/allgemein/facebook',
  '/quellen/personen/kris-and-dave': '/quellen/allgemein/facebook',
  '/quellen/personen/liam-layton': '/quellen/allgemein/facebook',
  '/quellen/personen/paige-white': '/quellen/allgemein/facebook',
  '/quellen/personen/pernille-haaland': '/quellen/allgemein/facebook',
  '/quellen/personen/politico-joe': '/quellen/allgemein/facebook',
  '/quellen/personen/sebastian-bohrn-mena': '/quellen/allgemein/facebook',
  '/quellen/personen/simon-rock': '/quellen/allgemein/facebook',
  '/quellen/personen/wonach-wir-suchen': '/quellen/allgemein/facebook',
}

// ─── 2-Segment sourceGroups: /quellen/SOURCE/... → /quellen/GROUP/SOURCE/... ──
const sourceGroups: Record<string, string> = {
  '2-millionen-stimmen-gegen-afd': 'allgemein',
  'bluesky': 'allgemein',
  'campact': 'allgemein',
  'facebook': 'allgemein',
  'giessen': 'allgemein',
  'moers-ist-bunt-nicht-braun': 'allgemein',
  'omas-gegen-rechts': 'allgemein',
  'tiktok': 'allgemein',
  'we-are-watching-you': 'allgemein',
  'x': 'allgemein',
  'youtube': 'allgemein',
  'correctiv': 'faktenchecks',
  'volksverpetzer': 'faktenchecks',
  'beck-aktuell': 'medien',
  'berlin-story': 'medien',
  'blackoutthesystem': 'medien',
  'bpk': 'medien',
  'cicero': 'medien',
  'compact': 'medien',
  'democratic-socialism-now': 'medien',
  'der-spiegel': 'medien',
  'die-Zeit': 'medien',
  'discover-san-diego': 'medien',
  'endstation-rechts': 'medien',
  'fakten-gegen-rechts': 'medien',
  'focus': 'medien',
  'geradeausdenker-plauen': 'medien',
  'gute-nacht-oesterreich': 'medien',
  'hawkpodcasts': 'medien',
  'hessenschau': 'medien',
  'in-the-know': 'medien',
  'indymedia': 'medien',
  'instagram-misc': 'medien',
  'labor-on-the-line': 'medien',
  'legal-tribune-online': 'medien',
  'markus-lanz': 'medien',
  'mdr': 'medien',
  'mediendienst-integration': 'medien',
  'monitor': 'medien',
  'ndr': 'medien',
  'nuernberger-nachrichten': 'medien',
  'phoenix': 'medien',
  'quer': 'medien',
  'swr-kultur': 'medien',
  't-online': 'medien',
  'taz': 'medien',
  'the-best-of-san-diego': 'medien',
  'the-history-wizard': 'medien',
  'the-oligarchy-is-here': 'medien',
  'the-rest-is-politics': 'medien',
  'welt': 'medien',
  'women-in-america': 'medien',
  'deutschlandfunk': 'nachrichten',
  'dts-nachrichtenagentur': 'nachrichten',
  'presseportal-de': 'nachrichten',
  'sueddeutsche-zeitung': 'nachrichten',
  'tagesschau': 'nachrichten',
  'aktion-deutschland-hilft': 'ngo',
  'amnesty': 'ngo',
  'frag-den-staat': 'ngo',
  'igmetall': 'ngo',
  'pro-asyl': 'ngo',
  'afd': 'parteien',
  'die-linke': 'parteien',
  'fraktion-die-linke-bundestag': 'parteien',
  'gruene-bayern': 'parteien',
  'spd-rheinland-pfalz': 'parteien',
  'spd-thueringen': 'parteien',
  'anna-connely': 'personen',
  'ashleytheebarroness': 'personen',
  'brian-tyler-cohen': 'personen',
  'chan-jo-jun': 'personen',
  'cheyenne-hunt': 'personen',
  'christoph-sieber': 'personen',
  'der-dara': 'personen',
  'dr-idz': 'personen',
  'erik-turk': 'personen',
  'erika-jordan': 'personen',
  'florian-schroeder': 'personen',
  'godless-gardener': 'personen',
  'harry-sisson': 'personen',
  'helen-webberley': 'personen',
  'its-daniel-brln': 'personen',
  'kim-hunt': 'personen',
  'klarsprech': 'personen',
  'klartext-mit-lilly': 'personen',
  'laura-high': 'personen',
  'marc-brost': 'personen',
  'marc-uwe-kling': 'personen',
  'marcant': 'personen',
  'maurice-hoefgen': 'personen',
  'mercedes-chandler': 'personen',
  'michael-bruck': 'personen',
  'michael-kraske': 'personen',
  'mutmacher': 'personen',
  'oliver-gastronomicus-riek': 'personen',
  'paul-klemm': 'personen',
  'philine-litzmann': 'personen',
  'pullupspastapolitics': 'personen',
  'rumgetrieben': 'personen',
  'sabre-bottleneckloser': 'personen',
  'sally-mcmanus': 'personen',
  'sarah-bosetti': 'personen',
  'sina-reisch': 'personen',
  'skorpi-ya': 'personen',
  'steve-hofstetter': 'personen',
  'the-justice-guy': 'personen',
  'tod-maffin': 'personen',
  'tristan-haerter': 'personen',
  'weichreite': 'personen',
  'who-did-what-now': 'personen',
  'wow-motherhood': 'personen',
  'yung-emil': 'personen',
  'aaron-spielmanns': 'politiker',
  'alice-mann': 'politiker',
  'alice-weidel': 'politiker',
  'andreas-audretsch': 'politiker',
  'andreas-winhart': 'politiker',
  'beatrix-von-storch': 'politiker',
  'clara-bunger': 'politiker',
  'cory-booker': 'politiker',
  'detlef-gurth': 'politiker',
  'dirk-wiese': 'politiker',
  'felix-banaszak': 'politiker',
  'felix-doering': 'politiker',
  'ferat-kocak': 'politiker',
  'franziska-brantner': 'politiker',
  'gregor-gysi': 'politiker',
  'heidi-reichinnek': 'politiker',
  'heiner-garg': 'politiker',
  'jens-maier': 'politiker',
  'kai-borrmann': 'politiker',
  'karoline-otte': 'politiker',
  'lamya-kaddor': 'politiker',
  'lena-kotre': 'politiker',
  'lisa-badum': 'politiker',
  'marcel-hopp': 'politiker',
  'marlene-schoenberger': 'politiker',
  'martin-hebner': 'politiker',
  'maximilian-krah': 'politiker',
  'petr-bystron': 'politiker',
  'rasha-nasr': 'politiker',
  'ricarda-lang': 'politiker',
  'robert-habeck': 'politiker',
  'robin-mesarosch': 'politiker',
  'sebastian-fiedler': 'politiker',
  'taylan-kurt': 'politiker',
  'till-steffen': 'politiker',
  'tim-achtermeyer': 'politiker',
  'tino-chrupalla': 'politiker',
  'toni-schuberl': 'politiker',
  'ulrich-siegmund': 'politiker',
  'chaos-computer-club': 'portale',
  'kontrast-at': 'portale',
  'personalwirtschaft': 'portale',
  'wikipedia': 'portale',
  'auswartiges-amt': 'staatlich',
  'bfa': 'staatlich',
  'bka': 'staatlich',
  'bmas': 'staatlich',
  'bmjv': 'staatlich',
  'bpb': 'staatlich',
  'bundeskanzler-de': 'staatlich',
  'bundestag': 'staatlich',
  'europarl': 'staatlich',
  'european-commission': 'staatlich',
  'gesetze-im-internet': 'staatlich',
  'iab': 'staatlich',
  'integrationsmonitoring-nrw': 'staatlich',
  'landtag-sachsen-anhalt': 'staatlich',
  'lpb-rlp': 'staatlich',
  'verfassungsschutz': 'staatlich',
  'vg-koln': 'staatlich',
  'destatis': 'statistik',
  'statista': 'statistik',
  'charles-mcbryde': 'wissenschaft',
  'dietrich-tranhardt': 'wissenschaft',
  'dr-noc': 'wissenschaft',
  'ernst-kistler': 'wissenschaft',
  'forrest-valkai': 'wissenschaft',
  'gerhard-backer': 'wissenschaft',
  'henrik-kleven': 'wissenschaft',
  'ifo': 'wissenschaft',
  'iw-koeln': 'wissenschaft',
  'jessica-knurick': 'wissenschaft',
  'jochen-pimpertz': 'wissenschaft',
  'mai-thi-nguyen-kim': 'wissenschaft',
  'martin-bujard': 'wissenschaft',
  'martina-sauer': 'wissenschaft',
  'professor-neil': 'wissenschaft',
  'uni-duisburg-essen': 'wissenschaft',
  'volker-quaschning': 'wissenschaft',
  // Umlaut variants for 2-segment URLs (single-hop to final destination)
  'ausw\u00e4rtiges-amt': 'staatlich',
  'erik-t\u00fcrk': 'personen',
  'gerhard-b\u00e4cker': 'wissenschaft',
  'dietrich-tr\u00e4nhardt': 'wissenschaft',
  'lpb-rp': 'staatlich',
}

const knownGroups = new Set([
  'allgemein', 'faktenchecks', 'medien', 'nachrichten', 'ngo',
  'parteien', 'personen', 'politiker', 'portale', 'staatlich', 'statistik', 'wissenschaft',
])

export default defineEventHandler((event) => {
  // Decode URL-encoded characters (especially umlauts like %C3%BC → ü)
  let url: string
  try {
    url = decodeURIComponent(event.path)
  } catch {
    url = event.path
  }

  // 1. Exact link redirects (highest priority)
  const linkTarget = linkRedirects[url]
  if (linkTarget) {
    return sendRedirect(event, linkTarget, 301)
  }

  // 2. Prefix redirects (source-level, matches all sub-paths)
  for (const [from, to] of Object.entries(prefixRedirects)) {
    if (url === from || url.startsWith(from + '/')) {
      return sendRedirect(event, to + url.slice(from.length), 301)
    }
  }

  // 3. Alte Tag-URLs: /COLLECTION/tags/TAG → /tags/TAG (lowercase)
  const tagMatch = url.match(/^\/(faktenchecks|lagerfeuer|glossar|zitate|quellen)(\/tags\/.+)/)
  if (tagMatch) {
    return sendRedirect(event, tagMatch[2]!.toLowerCase(), 301)
  }

  // 4. Alte URL-Struktur: /quellen/SOURCE/... ohne group-Segment
  if (url.startsWith('/quellen/')) {
    const parts = url.slice('/quellen/'.length).split('/')
    const second = parts[0]
    if (second && !knownGroups.has(second)) {
      const group = sourceGroups[second]
      if (group) {
        return sendRedirect(event, '/quellen/' + group + '/' + parts.join('/'), 301)
      }
    }
  }
})
