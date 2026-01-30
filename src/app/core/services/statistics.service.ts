import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  IStatisticsParams,
  IKpisResponse,
  ITimeSeriesResponse,
  IBreakdownResponse,
} from '../models/statistics.model';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/statistics`;

  /**
   * Obtiene los KPIs principales con comparacion al periodo anterior
   */
  getKpis(params?: IStatisticsParams): Observable<IKpisResponse> {
    const httpParams = this.buildParams(params);
    return this.http.get<IKpisResponse>(`${this.baseUrl}/kpis`, {
      params: httpParams,
    });
  }

  /**
   * Obtiene serie de tiempo de ingresos
   */
  getRevenueTimeSeries(
    params?: IStatisticsParams
  ): Observable<ITimeSeriesResponse> {
    const httpParams = this.buildParams(params);
    return this.http.get<ITimeSeriesResponse>(
      `${this.baseUrl}/revenue/timeseries`,
      { params: httpParams }
    );
  }

  /**
   * Obtiene serie de tiempo de cantidad de paquetes
   */
  getPackagesTimeSeries(
    params?: IStatisticsParams
  ): Observable<ITimeSeriesResponse> {
    const httpParams = this.buildParams(params);
    return this.http.get<ITimeSeriesResponse>(
      `${this.baseUrl}/packages/timeseries`,
      { params: httpParams }
    );
  }

  /**
   * Obtiene breakdown de ingresos por estado
   */
  getRevenueByStatus(
    params?: IStatisticsParams
  ): Observable<IBreakdownResponse> {
    const httpParams = this.buildParams(params);
    return this.http.get<IBreakdownResponse>(
      `${this.baseUrl}/revenue/by-status`,
      { params: httpParams }
    );
  }

  /**
   * Obtiene breakdown de ingresos por punto de origen
   */
  getRevenueByOrigin(
    params?: IStatisticsParams
  ): Observable<IBreakdownResponse> {
    const httpParams = this.buildParams(params);
    return this.http.get<IBreakdownResponse>(
      `${this.baseUrl}/revenue/by-origin`,
      { params: httpParams }
    );
  }

  /**
   * Obtiene breakdown de ingresos por punto de destino
   */
  getRevenueByDestination(
    params?: IStatisticsParams
  ): Observable<IBreakdownResponse> {
    const httpParams = this.buildParams(params);
    return this.http.get<IBreakdownResponse>(
      `${this.baseUrl}/revenue/by-destination`,
      { params: httpParams }
    );
  }

  /**
   * Obtiene top N puntos de origen por ingresos
   */
  getTopOrigins(params?: IStatisticsParams): Observable<IBreakdownResponse> {
    const httpParams = this.buildParams(params);
    return this.http.get<IBreakdownResponse>(`${this.baseUrl}/top/origins`, {
      params: httpParams,
    });
  }

  /**
   * Obtiene top N puntos de destino por ingresos
   */
  getTopDestinations(
    params?: IStatisticsParams
  ): Observable<IBreakdownResponse> {
    const httpParams = this.buildParams(params);
    return this.http.get<IBreakdownResponse>(
      `${this.baseUrl}/top/destinations`,
      { params: httpParams }
    );
  }

  /**
   * Construye HttpParams a partir de IStatisticsParams
   */
  private buildParams(params?: IStatisticsParams): HttpParams {
    let httpParams = new HttpParams();

    if (!params) return httpParams;

    if (params.from) {
      httpParams = httpParams.set('from', params.from);
    }
    if (params.to) {
      httpParams = httpParams.set('to', params.to);
    }
    if (params.granularity) {
      httpParams = httpParams.set('granularity', params.granularity);
    }
    if (params.puntoOrigenId) {
      httpParams = httpParams.set(
        'puntoOrigenId',
        params.puntoOrigenId.toString()
      );
    }
    if (params.puntoDestinoId) {
      httpParams = httpParams.set(
        'puntoDestinoId',
        params.puntoDestinoId.toString()
      );
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return httpParams;
  }
}
