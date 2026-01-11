export type EstadoWhatsapp = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';

export const EstadoWhatsappLabels: Record<EstadoWhatsapp, string> = {
  CONNECTED: 'Conectado',
  DISCONNECTED: 'Desconectado',
  CONNECTING: 'Conectando',
};

export const EstadoWhatsappColors: Record<EstadoWhatsapp, string> = {
  CONNECTED: 'success',
  DISCONNECTED: 'danger',
  CONNECTING: 'warning',
};

export interface IWhatsappStatus {
  punto_id: number;
  nombre_punto: string;
  codigo_punto: string;
  status: EstadoWhatsapp;
  whatsapp_numero: string | null;
  ultimo_qr: string | null;
  qr_code?: string;
  activo_en_memoria?: boolean;
}

export interface IConexionResponse {
  success: boolean;
  mensaje: string;
  qr_code?: string;
}
