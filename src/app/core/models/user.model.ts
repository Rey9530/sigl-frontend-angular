export interface IUser {
  id_usuario: number;
  email: string;
  nombre: string;
  rol: string;
  punto_id?: number;
  activo?: boolean;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  access_token: string;
  usuario: IUser;
}
