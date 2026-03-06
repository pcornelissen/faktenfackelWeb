export default defineAppConfig({
  ui: {
    colors: {
      primary: 'orange',
      neutral: 'stone',
    },
    contentSearchButton: {
      slots: {
        base: 'font-mono text-[0.72rem] uppercase tracking-[0.1em] text-[#C4BAB0] border border-[#3D3530] rounded-sm px-2.5 py-1 hover:text-[var(--flame)] hover:border-[var(--flame)] transition-colors bg-transparent gap-1.5',
        label: 'font-mono',
        leadingIcon: 'text-[var(--flame)] size-3.5',
      },
    },
    modal: {
      slots: {
        content: 'bg-[var(--paper)]',
      },
    },
    contentSearch: {
      slots: {
        root: 'bg-[var(--paper)]',
        input: 'bg-[var(--ash)] [&_input]:bg-transparent [&_input]:text-[var(--paper)] [&_input]:placeholder:text-[#A89880]',
        close: 'text-[var(--flame)] hover:text-[var(--ember)]',
        label: 'font-mono text-[0.65rem] uppercase tracking-[0.1em] text-[var(--flame)] px-3 py-1',
        item: 'data-highlighted:before:bg-[var(--fackel-border)]/40',
        itemLabelBase: 'text-[var(--ink)] font-medium',
        itemLabelSuffix: 'text-[var(--muted)]',
        itemDescription: 'text-[var(--muted)] text-sm',
      },
    },
    contentSurround: {
      slots: {
        root: 'grid grid-cols-1 sm:grid-cols-2 gap-8',
        link: [
          'group block px-6 py-3 rounded-lg border border-default hover:bg-elevated/50 focus-visible:outline-primary',
          'transition-colors',
        ],
        linkLeading: [
          'inline-flex items-center rounded-full p-1.5 bg-elevated group-hover:bg-primary/10 ring ring-accented mb-2 group-hover:ring-primary/50',
          'transition',
        ],
        linkLeadingIcon: [
          'size-5 shrink-0 text-highlighted group-hover:text-primary',
          'transition-[color,translate]',
        ],
        linkTitle: 'font-medium text-[15px] text-highlighted mb-0 truncate',
        linkDescription: 'text-sm text-muted line-clamp-2',
      },
      variants: {
        direction: {
          left: {
            linkLeadingIcon: [
              'group-active:-translate-x-0.5',
            ],
          },
          right: {
            link: 'text-right',
            linkLeadingIcon: [
              'group-active:translate-x-0.5',
            ],
          },
        },
      },
    },
  },
})
