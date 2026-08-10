import type { Pluggable } from 'unified';

type ToolbarButton = {
  id: string;
  label: string;
  onClick: () => void;
  icon?: string;
};

export class PluginManager {
  private static toolbarButtons: ToolbarButton[] = [];
  private static remarkPlugins: Pluggable[] = [];
  private static rehypePlugins: Pluggable[] = [];

  // متد ثبت دکمه جدید در نوار ابزار
  static registerToolbarButton(button: ToolbarButton) {
    this.toolbarButtons.push(button);
  }

  // متد ثبت افزونه پردازشی برای مارک‌داون
  static registerMarkdownPlugin(type: 'remark' | 'rehype', plugin: Pluggable) {
    if (type === 'remark') {
      this.remarkPlugins.push(plugin);
    } else {
      this.rehypePlugins.push(plugin);
    }
  }

  static getToolbarButtons() {
    return this.toolbarButtons;
  }

  static getRemarkPlugins() {
    return this.remarkPlugins;
  }

  static getRehypePlugins() {
    return this.rehypePlugins;
  }
}
