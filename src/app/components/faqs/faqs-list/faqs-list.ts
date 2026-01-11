import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FaqsService } from '../../../core/services/faqs.service';
import { PuntosService } from '../../../core/services/puntos.service';
import { IFaq, ICreateFaq, IUpdateFaq } from '../../../core/models/faq.model';
import { IPuntoActivo } from '../../../core/models/punto.model';
import { AuthService } from '../../../core/services/auth.service';
import { Rol } from '../../../core/models/usuario.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-faqs-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './faqs-list.html',
  styleUrl: './faqs-list.scss',
})
export class FaqsList implements OnInit {
  @ViewChild('faqModal') faqModal!: TemplateRef<any>;

  private faqsService = inject(FaqsService);
  private puntosService = inject(PuntosService);
  private authService = inject(AuthService);
  private modal = inject(NgbModal);
  private toast = inject(ToastrService);

  faqs: IFaq[] = [];
  puntos: IPuntoActivo[] = [];
  loading = false;
  currentUserRol: string = '';

  // Filtros
  filtroPunto: number | null = null;
  filtroBusqueda: string = '';
  filtroActivo: boolean | null = null;

  // Paginacion
  pagina = 1;
  limite = 20;
  total = 0;
  totalPaginas = 0;

  // Modal form
  form: FormGroup;
  isEditMode = false;
  faqId: number | null = null;
  submitting = false;
  modalRef: NgbModalRef | null = null;

  readonly Rol = Rol;
  readonly Math = Math;

  constructor() {
    this.form = new FormGroup({
      punto_id: new FormControl(null),
      pregunta: new FormControl('', [Validators.required, Validators.minLength(5)]),
      respuesta: new FormControl('', [Validators.required, Validators.minLength(10)]),
      palabras_clave: new FormControl(''),
      activo: new FormControl(true),
    });
  }

  ngOnInit(): void {
    this.currentUserRol = this.authService.getCurrentUser()?.rol || '';
    this.loadPuntos();
    this.loadFaqs();
  }

  loadPuntos(): void {
    this.puntosService.getActivos().subscribe({
      next: (data) => {
        this.puntos = data;
      },
      error: () => {
        this.toast.error('Error al cargar puntos');
      },
    });
  }

  loadFaqs(): void {
    this.loading = true;

    const params: any = {
      pagina: this.pagina,
      limite: this.limite,
    };

    if (this.filtroPunto !== null) {
      params.punto_id = this.filtroPunto;
    }
    if (this.filtroBusqueda) {
      params.busqueda = this.filtroBusqueda;
    }
    if (this.filtroActivo !== null) {
      params.activo = this.filtroActivo;
    }

    this.faqsService.getAll(params).subscribe({
      next: (response) => {
        this.faqs = response.data;
        this.total = response.meta.total;
        this.totalPaginas = response.meta.totalPaginas;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Error al cargar FAQs');
        this.loading = false;
      },
    });
  }

  onFiltroChange(): void {
    this.pagina = 1;
    this.loadFaqs();
  }

  nuevaFaq(): void {
    this.isEditMode = false;
    this.faqId = null;
    this.form.reset({ activo: true });
    this.modalRef = this.modal.open(this.faqModal, { centered: true, size: 'lg' });
  }

  editarFaq(faq: IFaq): void {
    this.isEditMode = true;
    this.faqId = faq.id_faq;
    this.form.patchValue({
      punto_id: faq.punto_id,
      pregunta: faq.pregunta,
      respuesta: faq.respuesta,
      palabras_clave: faq.palabras_clave || '',
      activo: faq.activo,
    });
    this.modalRef = this.modal.open(this.faqModal, { centered: true, size: 'lg' });
  }

  guardarFaq(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.form.value;

    const data: ICreateFaq | IUpdateFaq = {
      punto_id: formValue.punto_id || undefined,
      pregunta: formValue.pregunta,
      respuesta: formValue.respuesta,
      palabras_clave: formValue.palabras_clave || undefined,
    };

    if (this.isEditMode) {
      (data as IUpdateFaq).activo = formValue.activo;
    }

    const request = this.isEditMode
      ? this.faqsService.update(this.faqId!, data as IUpdateFaq)
      : this.faqsService.create(data as ICreateFaq);

    request.subscribe({
      next: () => {
        this.toast.success(this.isEditMode ? 'FAQ actualizada' : 'FAQ creada');
        this.modalRef?.close();
        this.loadFaqs();
        this.submitting = false;
      },
      error: (error) => {
        this.toast.error(error?.error?.message || 'Error al guardar FAQ');
        this.submitting = false;
      },
    });
  }

  eliminarFaq(faq: IFaq): void {
    Swal.fire({
      title: 'Eliminar FAQ',
      text: `¿Está seguro de eliminar esta pregunta frecuente?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.faqsService.delete(faq.id_faq).subscribe({
          next: () => {
            this.toast.success('FAQ eliminada');
            this.loadFaqs();
          },
          error: () => {
            this.toast.error('Error al eliminar FAQ');
          },
        });
      }
    });
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.pagina = pagina;
      this.loadFaqs();
    }
  }

  getNombrePunto(puntoId: number | null): string {
    if (!puntoId) return 'Global';
    const punto = this.puntos.find((p) => p.id_punto === puntoId);
    return punto?.nombre || 'Desconocido';
  }
}
