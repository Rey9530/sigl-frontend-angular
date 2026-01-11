export type EstadoConversacion = 'BOT' | 'HUMAN';

export const EstadoConversacionLabels: Record<EstadoConversacion, string> = {
  BOT: 'Bot',
  HUMAN: 'Humano',
};

export const EstadoConversacionColors: Record<EstadoConversacion, string> = {
  BOT: 'primary',
  HUMAN: 'success',
};

export interface IConversacion {
  id_conversacion: number;
  punto_id: number;
  telefono_cliente: string;
  estado: EstadoConversacion;
  usuario_asignado_id?: number;
  creado_en: string;
  ultimo_mensaje_en: string;
  punto?: {
    id_punto?: number;
    nombre: string;
    codigo: string;
    whatsapp_numero?: string;
    whatsapp_status?: string;
  };
  usuario_asignado?: {
    id_usuario?: number;
    nombre: string;
    email?: string;
  };
  _count?: {
    mensajes: number;
  };
  ultimo_mensaje?: IMensaje;
}

export interface IMensaje {
  id_mensaje: number;
  conversacion_id: number;
  punto_id: number;
  direccion: 'IN' | 'OUT';
  contenido: string;
  tipo_remitente: 'CUSTOMER' | 'BOT' | 'AGENT';
  provider_message_id?: string;
  timestamp: string;
}

export const TipoRemitenteLabels: Record<string, string> = {
  CUSTOMER: 'Cliente',
  BOT: 'Bot',
  AGENT: 'Agente',
};

export interface IConversacionPaginada {
  data: IConversacion[];
  meta: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

export interface IMensajePaginado {
  data: IMensaje[];
  meta: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

export interface IInboxStats {
  total: number;
  en_bot: number;
  en_humano: number;
  nuevas_hoy: number;
}
