export interface IFaq {
  id_faq: number;
  punto_id: number | null;
  pregunta: string;
  respuesta: string;
  palabras_clave?: string;
  activo: boolean;
  creado_en: string;
  actualizado_en?: string;
  punto?: {
    nombre: string;
    codigo: string;
  };
}

export interface IFaqPaginado {
  data: IFaq[];
  meta: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

export interface ICreateFaq {
  punto_id?: number;
  pregunta: string;
  respuesta: string;
  palabras_clave?: string;
}

export interface IUpdateFaq extends Partial<ICreateFaq> {
  activo?: boolean;
}
