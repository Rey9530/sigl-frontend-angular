export type OrigenRecaudacion = 'RECEPCION' | 'ENTREGA';

export interface IResumenRecepcion {
  total: number;
  costo_envio: number;
  cantidad: number;
}

export interface IResumenEntrega {
  total: number;
  precio_producto: number;
  costo_envio: number;
  cantidad: number;
}

export interface IResumenCaja {
  usuario_id: number;
  usuario_nombre: string;
  punto_id: number;
  punto_nombre: string;
  punto_codigo?: string;
  // Totales generales
  total_pendiente: number;
  cantidad_registros: number;
  // Desglose por origen
  recepcion: IResumenRecepcion;
  entrega: IResumenEntrega;
}

export interface ICierreCaja {
  id_cierre: number;
  usuario_id: number;
  punto_id: number;
  total_recaudado: number;
  cantidad_paquetes: number;
  recibido_por_id?: number;
  notas?: string;
  creado_en: string;
  usuario?: { id_usuario: number; nombre: string };
  punto?: { id_punto: number; nombre: string; codigo: string };
  recibido_por?: { id_usuario: number; nombre: string };
}

export interface IRegistroRecaudacion {
  id_registro: number;
  paquete_id: number;
  precio_producto: number;
  costo_envio: number;
  total: number;
  usuario_id: number;
  punto_id: number;
  origen: OrigenRecaudacion;
  estado: 'PENDIENTE' | 'ENTREGADO' | 'ANULADO';
  creado_en: string;
  entregado_en?: string;
  paquete?: {
    id_paquete: number;
    codigo_rastreo: string;
    destinatario_nombre: string;
    estado_actual: string;
  };
}

export interface ICajaHistorialParams {
  usuario_id?: number;
  punto_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  pagina?: number;
  limite?: number;
}

export interface IPaginatedCierres {
  data: ICierreCaja[];
  meta: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}
