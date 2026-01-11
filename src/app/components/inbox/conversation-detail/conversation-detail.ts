import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { InboxService } from '../../../core/services/inbox.service';
import { InboxWebsocketService } from '../../../core/services/inbox-websocket.service';
import {
  IConversacion,
  IMensaje,
  EstadoConversacionLabels,
  TipoRemitenteLabels,
} from '../../../core/models/conversacion.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-conversation-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conversation-detail.html',
  styleUrl: './conversation-detail.scss',
})
export class ConversationDetail implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inboxService = inject(InboxService);
  private wsService = inject(InboxWebsocketService);
  private toast = inject(ToastrService);

  conversacion: IConversacion | null = null;
  mensajes: IMensaje[] = [];
  loading = true;
  loadingMensajes = false;
  enviando = false;

  nuevoMensaje = '';

  private subscriptions: Subscription[] = [];
  private conversacionId: number = 0;

  readonly EstadoConversacionLabels = EstadoConversacionLabels;
  readonly TipoRemitenteLabels = TipoRemitenteLabels;

  ngOnInit(): void {
    this.conversacionId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadConversacion();
    this.loadMensajes();
    this.conectarWebSocket();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadConversacion(): void {
    this.inboxService.getConversacion(this.conversacionId).subscribe({
      next: (data) => {
        this.conversacion = data;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Error al cargar conversacion');
        this.router.navigate(['/inbox']);
      },
    });
  }

  loadMensajes(): void {
    this.loadingMensajes = true;
    this.inboxService.getMensajes(this.conversacionId, { limite: 100 }).subscribe({
      next: (response) => {
        this.mensajes = response.data;
        this.loadingMensajes = false;
        this.scrollToBottom();
      },
      error: () => {
        this.toast.error('Error al cargar mensajes');
        this.loadingMensajes = false;
      },
    });
  }

  conectarWebSocket(): void {
    this.wsService.conectar();

    // Escuchar nuevos mensajes
    if (this.conversacion?.punto_id) {
      const sub = this.wsService
        .escucharNuevoMensaje<IMensaje>(this.conversacion.punto_id)
        .subscribe((mensaje) => {
          if (mensaje.conversacion_id === this.conversacionId) {
            this.mensajes.push(mensaje);
            this.scrollToBottom();
          }
        });
      this.subscriptions.push(sub);
    }
  }

  enviarMensaje(): void {
    if (!this.nuevoMensaje.trim()) return;

    this.enviando = true;
    this.inboxService.enviarMensaje(this.conversacionId, this.nuevoMensaje).subscribe({
      next: (response) => {
        this.mensajes.push(response.mensaje);
        this.nuevoMensaje = '';
        this.enviando = false;
        this.scrollToBottom();
      },
      error: () => {
        this.toast.error('Error al enviar mensaje');
        this.enviando = false;
      },
    });
  }

  transferirAHumano(): void {
    this.inboxService.transferirAHumano(this.conversacionId).subscribe({
      next: () => {
        if (this.conversacion) {
          this.conversacion.estado = 'HUMAN';
        }
        this.toast.success('Conversacion transferida a humano');
      },
      error: () => {
        this.toast.error('Error al transferir');
      },
    });
  }

  transferirABot(): void {
    this.inboxService.transferirABot(this.conversacionId).subscribe({
      next: () => {
        if (this.conversacion) {
          this.conversacion.estado = 'BOT';
        }
        this.toast.success('Conversacion devuelta al bot');
      },
      error: () => {
        this.toast.error('Error al transferir');
      },
    });
  }

  volver(): void {
    this.router.navigate(['/inbox']);
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const container = this.messagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  formatearHora(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('es-SV', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatearFecha(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString('es-SV', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }
}
