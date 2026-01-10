/**
 * Estados posibles de un paquete
 */
export enum EstadoPaquete {
  RECIBIDO_ORIGEN = 'RECIBIDO_ORIGEN',
  EN_TRANSITO = 'EN_TRANSITO',
  LLEGO_DESTINO = 'LLEGO_DESTINO',
  ENTREGADO = 'ENTREGADO',
  EN_DEVOLUCION = 'EN_DEVOLUCION',
  DEVUELTO = 'DEVUELTO',
  CANCELADO = 'CANCELADO'
}

/**
 * Labels para mostrar estados en UI
 */
export const EstadoPaqueteLabels: Record<EstadoPaquete, string> = {
  [EstadoPaquete.RECIBIDO_ORIGEN]: 'Recibido',
  [EstadoPaquete.EN_TRANSITO]: 'En Transito',
  [EstadoPaquete.LLEGO_DESTINO]: 'En Destino',
  [EstadoPaquete.ENTREGADO]: 'Entregado',
  [EstadoPaquete.EN_DEVOLUCION]: 'En Devolucion',
  [EstadoPaquete.DEVUELTO]: 'Devuelto',
  [EstadoPaquete.CANCELADO]: 'Cancelado'
};

/**
 * Colores Bootstrap para estados
 */
export const EstadoPaqueteColors: Record<EstadoPaquete, string> = {
  [EstadoPaquete.RECIBIDO_ORIGEN]: 'bg-info',
  [EstadoPaquete.EN_TRANSITO]: 'bg-primary',
  [EstadoPaquete.LLEGO_DESTINO]: 'bg-warning text-dark',
  [EstadoPaquete.ENTREGADO]: 'bg-success',
  [EstadoPaquete.EN_DEVOLUCION]: 'bg-secondary',
  [EstadoPaquete.DEVUELTO]: 'bg-dark',
  [EstadoPaquete.CANCELADO]: 'bg-danger'
};

/**
 * Punto resumido para relaciones
 */
export interface IPuntoResumen {
  id_punto: number;
  nombre: string;
  codigo: string;
  ciudad?: string;
  direccion?: string;
}

/**
 * Usuario resumido para relaciones
 */
export interface IUsuarioResumen {
  id_usuario: number;
  nombre: string;
}

/**
 * Historial de estado de paquete
 */
export interface IHistorialEstado {
  id_historial: number;
  estado: EstadoPaquete;
  comentario?: string;
  creado_en: string;
  usuario?: IUsuarioResumen;
}

/**
 * Interface principal de Paquete
 */
export interface IPaquete {
  id_paquete: number;
  codigo_rastreo: string;

  // Remitente
  remitente_nombre: string;
  remitente_telefono: string;
  remitente_dui?: string;

  // Destinatario
  destinatario_nombre: string;
  destinatario_telefono: string;

  // Puntos
  punto_origen_id: number;
  punto_destino_id: number;
  punto_origen: IPuntoResumen;
  punto_destino: IPuntoResumen;

  // Valores
  costo_envio: number;
  valor_paquete?: number;

  // Estado
  estado_actual: EstadoPaquete;

  // Descripcion
  descripcion?: string;
  notas?: string;

  // Imagen
  imagen_vineta_url?: string;

  // Timestamps
  creado_en: string;
  actualizado_en: string;
}

/**
 * Interface de Paquete con detalle completo
 */
export interface IPaqueteDetalle extends IPaquete {
  usuario_recepcion?: IUsuarioResumen;
  usuario_entrega?: IUsuarioResumen;
  historial_estados: IHistorialEstado[];
  ruta?: {
    id_ruta: number;
    codigo: string;
    estado: string;
  };
}

/**
 * Interface para rastreo publico
 */
export interface IPaqueteRastreo {
  id_paquete: number;
  codigo_rastreo: string;
  remitente_nombre: string;
  destinatario_nombre: string;
  estado_actual: EstadoPaquete;
  creado_en: string;
  punto_origen: {
    nombre: string;
    ciudad: string;
  };
  punto_destino: {
    nombre: string;
    ciudad: string;
  };
  historial_estados: {
    estado: EstadoPaquete;
    comentario?: string;
    creado_en: string;
  }[];
}

/**
 * DTO para crear paquete
 */
export interface ICreatePaquete {
  remitente_nombre: string;
  remitente_telefono: string;
  remitente_dui?: string;
  destinatario_nombre: string;
  destinatario_telefono: string;
  punto_origen_id: number;
  punto_destino_id: number;
  costo_envio: number;
  valor_paquete?: number;
  descripcion?: string;
  notas?: string;
  imagen_vineta_url?: string;
}

/**
 * DTO para actualizar paquete
 */
export interface IUpdatePaquete {
  remitente_nombre?: string;
  remitente_telefono?: string;
  remitente_dui?: string;
  destinatario_nombre?: string;
  destinatario_telefono?: string;
  punto_destino_id?: number;
  costo_envio?: number;
  valor_paquete?: number;
  descripcion?: string;
  notas?: string;
}

/**
 * DTO para cambiar estado
 */
export interface IUpdateEstado {
  nuevo_estado: EstadoPaquete;
  comentario?: string;
}

/**
 * Parametros de busqueda
 */
export interface IPaquetesParams {
  codigo_rastreo?: string;
  remitente_telefono?: string;
  destinatario_telefono?: string;
  estado?: EstadoPaquete;
  punto_origen_id?: number;
  punto_destino_id?: number;
  pagina?: number;
  limite?: number;
}

/**
 * Respuesta paginada
 */
export interface IPaginatedPaquetes {
  data: IPaquete[];
  meta: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

/**
 * Estadisticas de paquetes
 */
export interface IPaqueteEstadisticas {
  total: number;
  por_estado: {
    estado: EstadoPaquete;
    cantidad: number;
  }[];
}
