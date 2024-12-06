export type TTabsListItem = {
  label: string
  // See more details: https://iconify.design/docs/
  icon?: string
  children: Array<{
    title: string
    link: string
    cover?: string
    introduction?: string
  }>
}

export const TabsList: TTabsListItem[] = [
  {
    label: '博客 / 书',
    icon: 'material-symbols:book-2-outline',
    children: [],
  },
  {
    label: '在线工具',
    icon: 'iconoir:tools',
    children: [],
  },
  {
    label: '开源项目',
    icon: 'material-symbols-light:deployed-code-outline',
    children: [],
  },
]
