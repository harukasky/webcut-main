interface MenuItem {
  title: string,
  key: string,
  active?: boolean,
  icon: string
}
const menuData: MenuItem[] = [
  // { title: '本地', key: 'local', icon: 'icon-shangchuan_line' },
  { title: '图片', key: 'image', icon: 'icon-tupian_line' },
  { title: '视频', key: 'video', icon: 'icon-shipin_line' },
  { title: '音乐', key: 'audio', icon: 'icon-yinle_line' },
  { title: '文字', key: 'text', icon: 'icon-wenzi_line' },
  { title: '虚拟人', key: 'character', icon: 'icon-renyuan_line' },
  { title: '配音', key: 'voice', icon: 'icon-maikefeng_line' },
  { title: '转场', key: 'transition', icon: 'icon-qiehuan_line' },
  { title: '模板', key: 'template', icon: 'icon-moban_line' },
  // { title: '贴纸', key: 'sticker', icon: 'icon-tiezhi_line' }
];

export { menuData };
export type { MenuItem };