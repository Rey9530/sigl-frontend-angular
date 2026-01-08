export interface IUsuario {
  id_usuario: number;
  nombre: string;
  email: string;
  telefono?: string;
  rol: Rol;
  punto_id?: number;
  activo: boolean;
  creado_en: string;
  punto?: {
    id_punto: number;
    nombre: string;
  };
}

export enum Rol {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMINISTRADOR = 'ADMINISTRADOR',
  EMPLEADO_PUNTO = 'EMPLEADO_PUNTO',
  CONDUCTOR = 'CONDUCTOR'
}

export const RolLabels: Record<Rol, string> = {
  [Rol.SUPER_ADMIN]: 'Super Admin',
  [Rol.ADMINISTRADOR]: 'Administrador',
  [Rol.EMPLEADO_PUNTO]: 'Empleado de Punto',
  [Rol.CONDUCTOR]: 'Conductor'
};

export interface ICreateUsuario {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
  telefono?: string;
  punto_id?: number;
}

export interface IUpdateUsuario {
  nombre?: string;
  email?: string;
  password?: string;
  telefono?: string;
  rol?: Rol;
  punto_id?: number;
  activo?: boolean;
}
