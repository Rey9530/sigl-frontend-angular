export interface IPunto {
  id_punto: number;
  nombre: string;
  codigo: string;
  direccion: string;
  telefono?: string;
  email?: string;
  ciudad?: string;
  departamento?: string;
  latitud?: number;
  longitud?: number;
  horario?: string;
  activo: boolean;
  creado_en: string;
  _count?: {
    usuarios: number;
    paquetes_origen?: number;
    paquetes_destino?: number;
  };
}

export interface IPuntoActivo {
  id_punto: number;
  nombre: string;
  codigo: string;
  ciudad?: string;
  departamento?: string;
}

export interface ICreatePunto {
  nombre: string;
  codigo: string;
  direccion: string;
  telefono?: string;
  email?: string;
  ciudad?: string;
  departamento?: string;
  latitud?: number;
  longitud?: number;
  horario?: string;
}

export interface IUpdatePunto {
  nombre?: string;
  codigo?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  ciudad?: string;
  departamento?: string;
  latitud?: number;
  longitud?: number;
  horario?: string;
  activo?: boolean;
}

// Departamentos de El Salvador
export const Departamentos: string[] = [
  'San Salvador',
  'Santa Ana',
  'San Miguel',
  'La Libertad',
  'Usulutan',
  'Sonsonate',
  'La Union',
  'La Paz',
  'Chalatenango',
  'Cuscatlan',
  'Ahuachapan',
  'Morazan',
  'San Vicente',
  'Cabanas'
];
