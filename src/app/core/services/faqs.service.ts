import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IFaq, IFaqPaginado, ICreateFaq, IUpdateFaq } from '../models/faq.model';

@Injectable({
  providedIn: 'root',
})
export class FaqsService {
  private apiUrl = `${environment.apiUrl}/faqs`;

  constructor(private http: HttpClient) {}

  getAll(params?: {
    punto_id?: number;
    busqueda?: string;
    activo?: boolean;
    pagina?: number;
    limite?: number;
  }): Observable<IFaqPaginado> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.punto_id !== undefined) {
        httpParams = httpParams.set('punto_id', params.punto_id.toString());
      }
      if (params.busqueda) {
        httpParams = httpParams.set('busqueda', params.busqueda);
      }
      if (params.activo !== undefined) {
        httpParams = httpParams.set('activo', params.activo.toString());
      }
      if (params.pagina) {
        httpParams = httpParams.set('pagina', params.pagina.toString());
      }
      if (params.limite) {
        httpParams = httpParams.set('limite', params.limite.toString());
      }
    }

    return this.http.get<IFaqPaginado>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<IFaq> {
    return this.http.get<IFaq>(`${this.apiUrl}/${id}`);
  }

  create(data: ICreateFaq): Observable<IFaq> {
    return this.http.post<IFaq>(this.apiUrl, data);
  }

  update(id: number, data: IUpdateFaq): Observable<IFaq> {
    return this.http.put<IFaq>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`);
  }

  getByPunto(puntoId: number): Observable<IFaq[]> {
    return this.http.get<IFaq[]>(`${this.apiUrl}/punto/${puntoId}`);
  }
}
