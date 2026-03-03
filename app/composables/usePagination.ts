export function usePagination<T>(getList: () => T[], pageSize: number) {
  const currentPage = ref(1)
  const list = computed(getList)

  watch(list, () => {
    currentPage.value = 1
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(list.value.length / pageSize)))

  const pageItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return list.value.slice(start, start + pageSize)
  })

  function goTo(page: number) {
    currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  }

  return { currentPage, totalPages, pageItems, goTo }
}
