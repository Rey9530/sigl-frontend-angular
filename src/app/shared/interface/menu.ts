export interface IMenu {
  main_title?: string;
  title?: string;
  icon?: string;
  path?: string;
  type?: string;
  active?: boolean;
  badge?: boolean;
  badge_value?: string;
  badge_color?: string;
  level?: number;
  bookmark?: boolean;
  children?: IMenu[];
  pined?: boolean;
  id?: string;
}
