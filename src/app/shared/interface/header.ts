export interface ILanguage {
  id: number;
  name: string;
  code: string;
  icon: string;
  country_code?: string;
  active?: boolean;
}

export interface INotification {
  id: number;
  message: string;
  border_color: string;
}
