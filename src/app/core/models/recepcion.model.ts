export interface IConfianzaDetalle {
  vendedor?: number;
  cliente?: number;
  telefono?: number;
  dia_entrega?: number;
  destino?: number;
  encomendista?: number;
  precio_producto?: number;
  costo_envio?: number;
  total?: number;
}

export interface IPuntoResumen {
  id_punto: number;
  nombre: string;
  codigo?: string;
}

export interface IRecepcion {
  id_recepcion: number;
  imagen_url: string;
  vendedor?: string;
  cliente?: string;
  telefono?: string;
  dia_entrega?: string;
  destino?: string;
  encomendista?: string;
  precio_producto?: number;
  costo_envio?: number;
  total?: number;
  confianza_global: number;
  confianza_detalle?: IConfianzaDetalle;
  estado: EstadoRecepcion;
  punto_servicio: IPuntoResumen;
  creado_en: string;
  actualizado_en: string;
}

export enum EstadoRecepcion {
  PENDIENTE_REVISION = 'PENDIENTE_REVISION',
  REVISION_PARCIAL = 'REVISION_PARCIAL',
  VALIDADO = 'VALIDADO',
  CONVERTIDO = 'CONVERTIDO',
  DESCARTADO = 'DESCARTADO'
}

export const EstadoRecepcionLabels: Record<EstadoRecepcion, string> = {
  [EstadoRecepcion.PENDIENTE_REVISION]: 'Pendiente',
  [EstadoRecepcion.REVISION_PARCIAL]: 'En Revision',
  [EstadoRecepcion.VALIDADO]: 'Validado',
  [EstadoRecepcion.CONVERTIDO]: 'Convertido',
  [EstadoRecepcion.DESCARTADO]: 'Descartado'
};

export const EstadoRecepcionColors: Record<EstadoRecepcion, string> = {
  [EstadoRecepcion.PENDIENTE_REVISION]: 'bg-warning',
  [EstadoRecepcion.REVISION_PARCIAL]: 'bg-info',
  [EstadoRecepcion.VALIDADO]: 'bg-success',
  [EstadoRecepcion.CONVERTIDO]: 'bg-primary',
  [EstadoRecepcion.DESCARTADO]: 'bg-secondary'
};

export interface IRecepcionEstadisticas {
  total: number;
  por_estado: Record<string, number>;
  por_rango_confianza: {
    baja_0_50: number;
    media_50_80: number;
    alta_80_100: number;
  };
  pendientes_revision: number;
}

export interface IUpdateRecepcion {
  vendedor?: string;
  cliente?: string;
  telefono?: string;
  dia_entrega?: string;
  destino?: string;
  encomendista?: string;
  precio_producto?: number;
  costo_envio?: number;
  total?: number;
}

export interface IConvertirPaqueteDto {
  punto_destino_id: number;
  descripcion?: string;
  notas?: string;
  remitente_nombre?: string;
  remitente_telefono?: string;
  destinatario_nombre?: string;
  destinatario_telefono?: string;
  costo_envio?: number;
  valor_paquete?: number;
}

// Campos OCR con sus etiquetas para formularios
export const CamposOCR = [
  { key: 'vendedor', label: 'Vendedor', type: 'text' },
  { key: 'cliente', label: 'Cliente', type: 'text' },
  { key: 'telefono', label: 'Telefono', type: 'tel' },
  { key: 'dia_entrega', label: 'Dia de Entrega', type: 'text' },
  { key: 'destino', label: 'Destino', type: 'text' },
  { key: 'encomendista', label: 'Encomendista', type: 'text' },
  { key: 'precio_producto', label: 'Precio Producto', type: 'number' },
  { key: 'costo_envio', label: 'Costo Envio', type: 'number' },
  { key: 'total', label: 'Total', type: 'number' }
] as const;

// Respuesta paginada del API
export interface IPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}
