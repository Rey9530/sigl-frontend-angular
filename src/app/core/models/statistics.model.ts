// ============================================
// QUERY PARAMS
// ============================================

export type Granularity = 'day' | 'week' | 'month';

export interface IStatisticsParams {
  from?: string;
  to?: string;
  granularity?: Granularity;
  puntoOrigenId?: number;
  puntoDestinoId?: number;
  limit?: number;
}

// ============================================
// KPIs RESPONSE
// ============================================

export interface IKpiComparison {
  totalRevenue: number;
  totalRevenueChange: number;
  packageCount: number;
  packageCountChange: number;
  avgTicket: number;
  avgTicketChange: number;
  deliveryRate: number;
  deliveryRateChange: number;
}

export interface IKpisResponse {
  totalRevenue: number;
  totalPackageValue: number;
  avgTicket: number;
  packageCount: number;
  deliveredCount: number;
  deliveryRate: number;
  comparison: IKpiComparison;
}

// ============================================
// TIME SERIES RESPONSE
// ============================================

export interface IDataset {
  label: string;
  data: number[];
}

export interface ITimeSeriesResponse {
  labels: string[];
  datasets: IDataset[];
}

// ============================================
// BREAKDOWN RESPONSE
// ============================================

export interface IBreakdownItem {
  label: string;
  value: number;
  count?: number;
  id?: number;
}

export interface IBreakdownResponse {
  items: IBreakdownItem[];
  total: number;
}
