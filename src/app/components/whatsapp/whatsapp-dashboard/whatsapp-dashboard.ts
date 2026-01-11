import { Component, inject, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { WhatsappService } from '../../../core/services/whatsapp.service';
import { InboxWebsocketService } from '../../../core/services/inbox-websocket.service';
import {
  IWhatsappStatus,
  EstadoWhatsappLabels,
  EstadoWhatsappColors,
} from '../../../core/models/whatsapp-status.model';
import { Subscription } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environments/environment';

type StatusFilter = 'ALL' | 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';
type ViewMode = 'cards' | 'table';

@Component({
  selector: 'app-whatsapp-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './whatsapp-dashboard.html',
  styleUrl: './whatsapp-dashboard.scss',
})
export class WhatsappDashboard implements OnInit, OnDestroy {
  @ViewChild('qrModal') qrModal!: TemplateRef<any>;

  private whatsappService = inject(WhatsappService);
  private modal = inject(NgbModal);
  private toast = inject(ToastrService);

  instancias: IWhatsappStatus[] = [];
  loading = false;

  // Filtros y vista
  searchTerm = '';
  statusFilter: StatusFilter = 'ALL';
  viewMode: ViewMode = 'table';

  // QR Modal
  modalRef: NgbModalRef | null = null;
  currentPunto: IWhatsappStatus | null = null;
  qrCode: string = '';
  conectando = false;

  // WebSocket
  private wsSocket: Socket | null = null;
  private subscriptions: Subscription[] = [];

  readonly EstadoWhatsappLabels = EstadoWhatsappLabels;
  readonly EstadoWhatsappColors = EstadoWhatsappColors;

  // Getter para instancias filtradas
  get instanciasFiltradas(): IWhatsappStatus[] {
    return this.instancias.filter((inst) => {
      // Filtro por búsqueda
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch =
        !this.searchTerm ||
        inst.nombre_punto.toLowerCase().includes(searchLower) ||
        inst.codigo_punto.toLowerCase().includes(searchLower);

      // Filtro por estado
      const matchesStatus =
        this.statusFilter === 'ALL' || inst.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  // Contadores por estado
  get countConectados(): number {
    return this.instancias.filter((i) => i.status === 'CONNECTED').length;
  }

  get countDesconectados(): number {
    return this.instancias.filter((i) => i.status === 'DISCONNECTED').length;
  }

  get countConectando(): number {
    return this.instancias.filter((i) => i.status === 'CONNECTING').length;
  }

  ngOnInit(): void {
    this.loadInstancias();
    this.conectarWebSocket();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    if (this.wsSocket) {
      this.wsSocket.disconnect();
    }
  }

  loadInstancias(): void {
    this.loading = true;
    this.whatsappService.getAllStatus().subscribe({
      next: (data) => {
        this.instancias = data;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Error al cargar instancias');
        this.loading = false;
      },
    });
  }

  conectarWebSocket(): void {
    const url = environment.apiUrl.replace('/api', '');
    this.wsSocket = io(`${url}/whatsapp`, {
      transports: ['websocket'],
    });

    this.wsSocket.on('connect', () => {
      console.log('Conectado a WhatsApp WebSocket');
    });

    this.wsSocket.on('qr', (data: { punto_id: number; qr_code: string }) => {
      if (this.currentPunto?.punto_id === data.punto_id) {
        this.qrCode = data.qr_code;
        this.conectando = false;
      }
    });

    this.wsSocket.on('status', (data: { punto_id: number; status: string }) => {
      const instancia = this.instancias.find((i) => i.punto_id === data.punto_id);
      if (instancia) {
        instancia.status = data.status as any;
        if (data.status === 'CONNECTED') {
          this.toast.success(`${instancia.nombre_punto} conectado`);
          this.modalRef?.close();
        }
      }
    });

    this.wsSocket.on('connected', (data: { punto_id: number; phone_number: string }) => {
      const instancia = this.instancias.find((i) => i.punto_id === data.punto_id);
      if (instancia) {
        instancia.status = 'CONNECTED';
        instancia.whatsapp_numero = data.phone_number;
        this.modalRef?.close();
        this.toast.success(`${instancia.nombre_punto} conectado con ${data.phone_number}`);
      }
    });

    this.wsSocket.on('disconnected', (data: { punto_id: number }) => {
      const instancia = this.instancias.find((i) => i.punto_id === data.punto_id);
      if (instancia) {
        instancia.status = 'DISCONNECTED';
        instancia.whatsapp_numero = null;
      }
    });
  }

  conectar(instancia: IWhatsappStatus): void {
    this.currentPunto = instancia;
    this.qrCode = '';
    this.conectando = true;

    // Suscribirse a eventos del punto
    this.wsSocket?.emit('subscribe', instancia.punto_id);

    // Abrir modal
    this.modalRef = this.modal.open(this.qrModal, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });

    // Iniciar conexion
    this.whatsappService.connect(instancia.punto_id).subscribe({
      next: (response) => {
        if (response.qr_code) {
          this.qrCode = response.qr_code;
        }
        this.conectando = false;
      },
      error: () => {
        this.toast.error('Error al conectar');
        this.conectando = false;
        this.modalRef?.close();
      },
    });
  }

  desconectar(instancia: IWhatsappStatus): void {
    this.whatsappService.disconnect(instancia.punto_id).subscribe({
      next: () => {
        instancia.status = 'DISCONNECTED';
        instancia.whatsapp_numero = null;
        this.toast.success('Desconectado correctamente');
      },
      error: () => {
        this.toast.error('Error al desconectar');
      },
    });
  }

  solicitarQr(instancia: IWhatsappStatus): void {
    this.currentPunto = instancia;
    this.qrCode = '';
    this.conectando = true;

    this.modalRef = this.modal.open(this.qrModal, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });

    this.wsSocket?.emit('subscribe', instancia.punto_id);

    this.whatsappService.getQr(instancia.punto_id).subscribe({
      next: (response) => {
        if (response.qr_code) {
          this.qrCode = response.qr_code;
        }
        this.conectando = false;
      },
      error: () => {
        this.toast.error('Error al obtener QR');
        this.conectando = false;
        this.modalRef?.close();
      },
    });
  }

  cerrarModal(): void {
    if (this.currentPunto) {
      this.wsSocket?.emit('unsubscribe', this.currentPunto.punto_id);
    }
    this.modalRef?.close();
    this.currentPunto = null;
    this.qrCode = '';
  }

  getStatusClass(status: string): string {
    return EstadoWhatsappColors[status as keyof typeof EstadoWhatsappColors] || 'secondary';
  }
}
