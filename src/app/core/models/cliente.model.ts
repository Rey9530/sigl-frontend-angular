// Enums
export enum EstadoCliente {
  PENDIENTE_VERIFICACION = 'PENDIENTE_VERIFICACION',
  ACTIVO = 'ACTIVO',
  SUSPENDIDO = 'SUSPENDIDO',
  RECHAZADO = 'RECHAZADO',
}

export enum EstadoPaquete {
  RECIBIDO_ORIGEN = 'RECIBIDO_ORIGEN',
  EN_TRANSITO = 'EN_TRANSITO',
  LLEGO_DESTINO = 'LLEGO_DESTINO',
  ENTREGADO = 'ENTREGADO',
  EN_DEVOLUCION = 'EN_DEVOLUCION',
  DEVUELTO = 'DEVUELTO',
  CANCELADO = 'CANCELADO',
}

// Labels para mostrar en UI
export const EstadoClienteLabels: Record<EstadoCliente, string> = {
  [EstadoCliente.PENDIENTE_VERIFICACION]: 'Pendiente',
  [EstadoCliente.ACTIVO]: 'Activo',
  [EstadoCliente.SUSPENDIDO]: 'Suspendido',
  [EstadoCliente.RECHAZADO]: 'Rechazado',
};

// Colores para badges
export const EstadoClienteColors: Record<EstadoCliente, string> = {
  [EstadoCliente.PENDIENTE_VERIFICACION]: 'bg-warning',
  [EstadoCliente.ACTIVO]: 'bg-success',
  [EstadoCliente.SUSPENDIDO]: 'bg-secondary',
  [EstadoCliente.RECHAZADO]: 'bg-danger',
};

// Interfaces
export interface IAprobadoPor {
  id_usuario: number;
  nombre: string;
}

export interface ICliente {
  id_cliente: number;
  nombre: string;
  email: string;
  telefono: string;
  estado: EstadoCliente;
  ultimo_acceso: string | null;
  creado_en: string;
  actualizado_en: string;
  fecha_aprobacion: string | null;
  aprobado_por: IAprobadoPor | null;
  motivo_rechazo: string | null;
  cantidad_paquetes: number;
}

export interface IPaginationMeta {
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
}

export interface IClienteListResponse {
  data: ICliente[];
  meta: IPaginationMeta;
}

export interface IPuntoResumen {
  nombre: string;
  ciudad: string | null;
}

export interface IPaqueteResumen {
  id_paquete: number;
  codigo_rastreo: string;
  estado_actual: EstadoPaquete;
  destinatario_nombre: string;
  destinatario_telefono: string;
  descripcion: string | null;
  creado_en: string;
  punto_origen: IPuntoResumen;
  punto_destino: IPuntoResumen;
}

export interface IHistorialPaquetesResponse {
  data: IPaqueteResumen[];
  meta: IPaginationMeta;
}

export interface IPaquetePorEstado {
  estado: EstadoPaquete;
  cantidad: number;
}

export interface IClienteEstadisticas {
  total_paquetes: number;
  paquetes_por_estado: IPaquetePorEstado[];
  primer_paquete: string | null;
  ultimo_paquete: string | null;
}

export interface IEstadisticasGlobales {
  total: number;
  pendientes: number;
  activos: number;
  suspendidos: number;
  rechazados: number;
  registros_este_mes: number;
  registros_mes_anterior: number;
}

// Interfaces para operaciones
export interface IBuscarClientesParams {
  busqueda?: string;
  estado?: EstadoCliente;
  fecha_desde?: string;
  fecha_hasta?: string;
  ordenar_por?: 'creado_en' | 'nombre' | 'ultimo_acceso';
  orden?: 'asc' | 'desc';
  pagina?: number;
  limite?: number;
}

export interface IHistorialPaquetesParams {
  estado?: EstadoPaquete;
  fecha_desde?: string;
  fecha_hasta?: string;
  pagina?: number;
  limite?: number;
}

export interface IEditarCliente {
  nombre?: string;
  email?: string;
  telefono?: string;
}

export interface IRechazarCliente {
  motivo: string;
}

export interface IResetPassword {
  nueva_password?: string;
  enviar_por_email?: boolean;
}

export interface IResetPasswordResponse {
  message: string;
  password_temporal: string;
}

export interface IClienteOperationResponse {
  message: string;
  cliente: ICliente;
}
