import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { StatisticsService } from '../../core/services/statistics.service';
import { IUser } from '../../core/models/user.model';
import { Rol } from '../../core/models/usuario.model';
import {
  IKpisResponse,
  ITimeSeriesResponse,
  IBreakdownResponse,
  Granularity,
  IStatisticsParams,
} from '../../core/models/statistics.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, DecimalPipe],
  template: `
    <div class="container-fluid">
      <!-- Header con filtros (solo para admins) -->
      @if (isAdmin) {
        <div class="row mb-4">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <div class="row align-items-end">
                  <div class="col-md-3">
                    <label class="form-label">Fecha Inicio</label>
                    <input
                      type="date"
                      class="form-control"
                      [(ngModel)]="dateFrom"
                      (change)="loadDashboard()"
                    />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Fecha Fin</label>
                    <input
                      type="date"
                      class="form-control"
                      [(ngModel)]="dateTo"
                      (change)="loadDashboard()"
                    />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Granularidad</label>
                    <select
                      class="form-select"
                      [(ngModel)]="granularity"
                      (change)="loadDashboard()"
                    >
                      <option value="day">Diario</option>
                      <option value="week">Semanal</option>
                      <option value="month">Mensual</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <button
                      class="btn btn-outline-secondary w-100"
                      (click)="resetFilters()"
                    >
                      <i class="feather icon-refresh-cw me-1"></i>
                      Restablecer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- KPI Cards -->
        @if (loading) {
          <div class="row mb-4">
            <div class="col-12 text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-2 text-muted">Cargando estadisticas...</p>
            </div>
          </div>
        } @else if (kpis) {
          <div class="row mb-4">
            <!-- Ingresos Totales -->
            <div class="col-xl-3 col-md-6 mb-3">
              <div class="card bg-primary text-white h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="text-white-50 mb-1">Ingresos Totales</h6>
                      <h3 class="mb-0">\${{ kpis.totalRevenue | number:'1.2-2' }}</h3>
                    </div>
                    <div class="rounded-circle bg-white bg-opacity-25 p-2">
                      <i class="feather icon-dollar-sign text-white"></i>
                    </div>
                  </div>
                  <div class="mt-3">
                    <span
                      class="badge"
                      [class.bg-success]="kpis.comparison.totalRevenueChange >= 0"
                      [class.bg-danger]="kpis.comparison.totalRevenueChange < 0"
                    >
                      <i
                        class="feather"
                        [class.icon-trending-up]="kpis.comparison.totalRevenueChange >= 0"
                        [class.icon-trending-down]="kpis.comparison.totalRevenueChange < 0"
                      ></i>
                      {{ kpis.comparison.totalRevenueChange | number:'1.1-1' }}%
                    </span>
                    <small class="text-white-50 ms-2">vs periodo anterior</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Total Paquetes -->
            <div class="col-xl-3 col-md-6 mb-3">
              <div class="card bg-info text-white h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="text-white-50 mb-1">Total Paquetes</h6>
                      <h3 class="mb-0">{{ kpis.packageCount | number }}</h3>
                    </div>
                    <div class="rounded-circle bg-white bg-opacity-25 p-2">
                      <i class="feather icon-package text-white"></i>
                    </div>
                  </div>
                  <div class="mt-3">
                    <span
                      class="badge"
                      [class.bg-success]="kpis.comparison.packageCountChange >= 0"
                      [class.bg-danger]="kpis.comparison.packageCountChange < 0"
                    >
                      <i
                        class="feather"
                        [class.icon-trending-up]="kpis.comparison.packageCountChange >= 0"
                        [class.icon-trending-down]="kpis.comparison.packageCountChange < 0"
                      ></i>
                      {{ kpis.comparison.packageCountChange | number:'1.1-1' }}%
                    </span>
                    <small class="text-white-50 ms-2">vs periodo anterior</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ticket Promedio -->
            <div class="col-xl-3 col-md-6 mb-3">
              <div class="card bg-warning text-dark h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="text-dark opacity-75 mb-1">Ticket Promedio</h6>
                      <h3 class="mb-0">\${{ kpis.avgTicket | number:'1.2-2' }}</h3>
                    </div>
                    <div class="rounded-circle bg-dark bg-opacity-25 p-2">
                      <i class="feather icon-bar-chart-2 text-dark"></i>
                    </div>
                  </div>
                  <div class="mt-3">
                    <span
                      class="badge"
                      [class.bg-success]="kpis.comparison.avgTicketChange >= 0"
                      [class.bg-danger]="kpis.comparison.avgTicketChange < 0"
                    >
                      <i
                        class="feather"
                        [class.icon-trending-up]="kpis.comparison.avgTicketChange >= 0"
                        [class.icon-trending-down]="kpis.comparison.avgTicketChange < 0"
                      ></i>
                      {{ kpis.comparison.avgTicketChange | number:'1.1-1' }}%
                    </span>
                    <small class="text-dark opacity-75 ms-2">vs periodo anterior</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tasa de Entrega -->
            <div class="col-xl-3 col-md-6 mb-3">
              <div class="card bg-success text-white h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="text-white-50 mb-1">Tasa de Entrega</h6>
                      <h3 class="mb-0">{{ kpis.deliveryRate | number:'1.1-1' }}%</h3>
                    </div>
                    <div class="rounded-circle bg-white bg-opacity-25 p-2">
                      <i class="feather icon-check-circle text-white"></i>
                    </div>
                  </div>
                  <div class="mt-3">
                    <span
                      class="badge"
                      [class.bg-light]="kpis.comparison.deliveryRateChange >= 0"
                      [class.text-success]="kpis.comparison.deliveryRateChange >= 0"
                      [class.bg-danger]="kpis.comparison.deliveryRateChange < 0"
                    >
                      <i
                        class="feather"
                        [class.icon-trending-up]="kpis.comparison.deliveryRateChange >= 0"
                        [class.icon-trending-down]="kpis.comparison.deliveryRateChange < 0"
                      ></i>
                      {{ kpis.comparison.deliveryRateChange | number:'1.1-1' }}%
                    </span>
                    <small class="text-white-50 ms-2">vs periodo anterior</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="row mb-4">
            <!-- Revenue Time Series Chart -->
            <div class="col-xl-8 col-lg-7 mb-3">
              <div class="card h-100">
                <div class="card-header">
                  <h6 class="mb-0">Ingresos por Periodo</h6>
                </div>
                <div class="card-body">
                  <div class="chart-container">
                    @if (revenueChartData) {
                      <canvas
                        baseChart
                        [data]="revenueChartData"
                        [type]="lineChartType"
                        [options]="lineChartOptions"
                      ></canvas>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Status Breakdown Doughnut -->
            <div class="col-xl-4 col-lg-5 mb-3">
              <div class="card h-100">
                <div class="card-header">
                  <h6 class="mb-0">Ingresos por Estado</h6>
                </div>
                <div class="card-body d-flex align-items-center justify-content-center">
                  <div class="chart-container-sm">
                    @if (statusChartData) {
                      <canvas
                        baseChart
                        [data]="statusChartData"
                        [type]="doughnutChartType"
                        [options]="doughnutChartOptions"
                      ></canvas>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Origins Bar Chart -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">Top 5 Puntos de Origen por Ingresos</h6>
                </div>
                <div class="card-body">
                  <div class="chart-container">
                    @if (originsChartData) {
                      <canvas
                        baseChart
                        [data]="originsChartData"
                        [type]="barChartType"
                        [options]="barChartOptions"
                      ></canvas>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        } @else if (error) {
          <div class="row">
            <div class="col-12">
              <div class="alert alert-danger" role="alert">
                <i class="feather icon-alert-circle me-2"></i>
                {{ error }}
              </div>
            </div>
          </div>
        }
      } @else {
        <!-- Welcome message for non-admin users -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5>Bienvenido al Sistema</h5>
              </div>
              <div class="card-body">
                @if (currentUser) {
                  <p>Hola, <strong>{{ currentUser.nombre }}</strong></p>
                  <p>Email: {{ currentUser.email }}</p>
                  <p>Rol: {{ getRolLabel(currentUser.rol) }}</p>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .card {
        border-radius: 0.5rem;
        box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      }
      .feather {
        width: 20px;
        height: 20px;
      }
      .chart-container {
        position: relative;
        height: 300px;
        width: 100%;
      }
      .chart-container-sm {
        position: relative;
        height: 250px;
        width: 100%;
      }
    `,
  ],
})
export class Home implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private statisticsService = inject(StatisticsService);
  private destroy$ = new Subject<void>();

  currentUser: IUser | null = null;
  isAdmin = false;
  loading = false;
  error: string | null = null;

  // Filters
  dateFrom: string = '';
  dateTo: string = '';
  granularity: Granularity = 'day';

  // KPIs
  kpis: IKpisResponse | null = null;

  // Chart data
  revenueChartData: ChartData<'line'> | null = null;
  statusChartData: ChartData<'doughnut'> | null = null;
  originsChartData: ChartData<'bar'> | null = null;

  // Chart types
  lineChartType = 'line' as const;
  doughnutChartType = 'doughnut' as const;
  barChartType = 'bar' as const;

  // Chart options
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `$${(context.parsed.y ?? 0).toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value}`,
        },
      },
    },
  };

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed as number;
            return ` $${value.toFixed(2)}`;
          },
        },
      },
    },
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `$${(context.parsed.x ?? 0).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value}`,
        },
      },
    },
  };

  private statusColors: Record<string, string> = {
    Recibido: '#17a2b8',
    'En Transito': '#007bff',
    'En Destino': '#ffc107',
    Entregado: '#28a745',
    'En Devolucion': '#6c757d',
    Devuelto: '#343a40',
    Cancelado: '#dc3545',
  };

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.checkIsAdmin();

    if (this.isAdmin) {
      this.initializeDateFilters();
      this.loadDashboard();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkIsAdmin(): boolean {
    if (!this.currentUser) return false;
    return (
      this.currentUser.rol === Rol.SUPER_ADMIN ||
      this.currentUser.rol === Rol.ADMINISTRADOR
    );
  }

  private initializeDateFilters(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    this.dateTo = this.formatDate(today);
    this.dateFrom = this.formatDate(thirtyDaysAgo);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  resetFilters(): void {
    this.initializeDateFilters();
    this.granularity = 'day';
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;

    const params: IStatisticsParams = {
      from: this.dateFrom,
      to: this.dateTo,
      granularity: this.granularity,
      limit: 5,
    };

    forkJoin({
      kpis: this.statisticsService.getKpis(params),
      revenueSeries: this.statisticsService.getRevenueTimeSeries(params),
      statusBreakdown: this.statisticsService.getRevenueByStatus(params),
      topOrigins: this.statisticsService.getTopOrigins(params),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (data) => {
          this.kpis = data.kpis;
          this.updateRevenueChart(data.revenueSeries);
          this.updateStatusChart(data.statusBreakdown);
          this.updateOriginsChart(data.topOrigins);
        },
        error: (err) => {
          console.error('Error loading dashboard:', err);
          this.error =
            'No se pudieron cargar las estadisticas. Por favor intente nuevamente.';
        },
      });
  }

  private updateRevenueChart(data: ITimeSeriesResponse): void {
    this.revenueChartData = {
      labels: data.labels,
      datasets: [
        {
          label: 'Ingresos',
          data: data.datasets[0]?.data || [],
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }

  private updateStatusChart(data: IBreakdownResponse): void {
    const labels = data.items.map((item) => item.label);
    const values = data.items.map((item) => item.value);
    const colors = data.items.map(
      (item) => this.statusColors[item.label] || '#6c757d'
    );

    this.statusChartData = {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    };
  }

  private updateOriginsChart(data: IBreakdownResponse): void {
    const labels = data.items.map((item) => item.label);
    const values = data.items.map((item) => item.value);

    this.originsChartData = {
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: values,
          backgroundColor: [
            '#007bff',
            '#28a745',
            '#ffc107',
            '#17a2b8',
            '#6c757d',
          ],
          borderRadius: 4,
        },
      ],
    };
  }

  getRolLabel(rol: string): string {
    const labels: Record<string, string> = {
      SUPER_ADMIN: 'Super Administrador',
      ADMINISTRADOR: 'Administrador',
      EMPLEADO_PUNTO: 'Empleado de Punto',
      CONDUCTOR: 'Conductor',
    };
    return labels[rol] || rol;
  }
}
