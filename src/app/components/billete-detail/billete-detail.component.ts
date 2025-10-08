import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ModalService } from '../../services/modal.service';
import { RegistrosService } from '../../services/registros.service';
import { Subscription } from 'rxjs';

interface BilleteCompleto {
  id: number;
  denominacion: string;
  precio: string;
  banco_emisor: string;
  medidas: string;
  descripcion_general?: string; // Descripción general (opcional) - Coincide con API
  descripcion_anverso: string;
  descripcion_reverso: string;
  url_anverso: string;
  url_reverso: string;
  pick: string;
  estado: string;
  vendido: boolean;
  destacado: boolean;
  fecha_actualizacion: string;
  pais: number;
  pais_rel: {
    id: number;
    pais: string;
    bandera: string;
    continente: string;
  };
  caracteristicas: {
    id: number;
    nombre: string;
    descripcion: string;
    color: string;
  }[];
}

@Component({
  selector: 'app-billete-detail',
  imports: [CommonModule],
  templateUrl: './billete-detail.component.html',
  styleUrls: ['./billete-detail.component.css']
})
export class BilleteDetailComponent implements OnInit, OnDestroy {
  billete: BilleteCompleto | null = null;
  loading = false;
  error = '';
  imagenActiva: 'anverso' | 'reverso' = 'anverso';
  isBrowser = false;
  mostrarModal = false;
  
  private subscription: Subscription = new Subscription();

  constructor(
    private modalService: ModalService,
    private registrosService: RegistrosService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    this.subscription.add(
      this.modalService.modal$.subscribe(modalData => {
        this.mostrarModal = modalData.isOpen;
        if (modalData.isOpen && modalData.type === 'billete-detail' && modalData.billeteId) {
          this.cargarBillete(modalData.billeteId);
        } else if (!modalData.isOpen) {
          // Reset del componente cuando se cierre el modal
          this.billete = null;
          this.imagenActiva = 'anverso';
          this.error = '';
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  cargarBillete(id: number): void {
    this.loading = true;
    this.error = '';
    
    console.log('🔍 Cargando billete con ID:', id);
    
    this.registrosService.obtenerBilletePorId(id).subscribe({
      next: (response) => {
        this.billete = response;
        console.log('✅ Billete cargado:', this.billete);
        if (this.billete) {
          console.log('📋 Propiedades del billete:', Object.keys(this.billete));
          console.log('📅 Fecha actualización:', this.billete.fecha_actualizacion);
          console.log('📝 Descripción general:', this.billete.descripcion_general);
          console.log('🏷️ Características:', this.billete.caracteristicas);
          console.log('🏦 Banco emisor:', this.billete.banco_emisor);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar billete:', error);
        this.error = 'Error al cargar la información del billete';
        this.loading = false;
      }
    });
  }

  cerrarModal(): void {
    this.modalService.closeModal();
  }

  cambiarImagen(tipo: 'anverso' | 'reverso'): void {
    this.imagenActiva = tipo;
  }

  formatearPrecio(precio: string): string {
    const numero = Number(precio);
    return '$' + numero.toLocaleString('es-CO', { minimumFractionDigits: 0 });
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'Fecha no disponible';
    
    try {
      const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      console.log('📅 Formateando fecha:', fecha, '→', fechaFormateada);
      return fechaFormateada;
    } catch (error) {
      console.error('❌ Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  }

  limpiarUrl(url: string): string {
    if (!url) return '';
    
    if (url.includes('supabase.co')) {
      return url;
    }
    
    if (url.includes('drive.google.com')) {
      url = url.replace(/\/view.*$/, '');
      const match = url.match(/\/d\/([^\/]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}`;
      }
    }
    
    return url;
  }
}