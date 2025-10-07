import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RegistrosService } from '../../../services/registros.service';
import { NotificationService } from '../../../services/notification.service';
import { BilleteImageUploadComponent, BilleteImageData } from '../../../components/billete-image-upload/billete-image-upload.component';

// Interfaces basadas en la documentación del backend
interface Billete {
  id?: number;
  pais: number;
  denominacion: string;
  precio: string;
  banco_emisor?: string;
  medidas?: string;
  descripcion?: string;
  descripcion_anverso?: string;
  descripcion_reverso?: string;
  url_anverso?: string;
  url_reverso?: string;
  pick?: string;
  estado?: 'Regular' | 'Aceptable' | 'Bueno' | 'Muy bueno' | 'Excelente';
  vendido: boolean;
  destacado: boolean;
  fecha_actualizacion?: string;
  caracteristicas?: Caracteristica[];
  caracteristicas_ids?: number[];
  pais_rel?: {
    id: number;
    pais: string;
    bandera: string;
  };
}

interface Caracteristica {
  id: number;
  nombre: string;
  descripcion?: string;
  color: string;
  fecha_creacion?: string;
}

interface Pais {
  id: number;
  pais: string;
  bandera: string;
}

interface PaginatedResponse<T> {
  billetes?: T[];
  items?: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface Estadisticas {
  total_billetes: number;
  total_vendidos: number;
  total_disponibles: number;
  total_destacados: number;
  valor_total_inventario: string;
  valor_inventario_disponible: string;
  estadisticas_por_pais: Record<string, any>;
  estadisticas_por_estado: Record<string, number>;
  caracteristicas_mas_usadas: Array<{
    caracteristica: string;
    nombre: string;
    color: string;
    cantidad_billetes: number;
  }>;
}

@Component({
  selector: 'app-gestionar-billetes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BilleteImageUploadComponent],
  templateUrl: './gestionar-billetes.component.html',
  styleUrls: ['./gestionar-billetes.component.css']
})
export class GestionarBilletesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private registrosService = inject(RegistrosService);
  private notificationService = inject(NotificationService);

  // Properties
  billetes: Billete[] = [];
  paises: Pais[] = [];
  caracteristicas: Caracteristica[] = [];
  estadisticas: Estadisticas | null = null;

  // Getter para países ordenados alfabéticamente
  get paisesOrdenados(): Pais[] {
    return [...this.paises].sort((a, b) => a.pais.localeCompare(b.pais, 'es'));
  }
  billeteForm: FormGroup;
  billeteSeleccionado: Billete | null = null;
  mostrarModal = false;
  modoEdicion = false;
  cargando = false;

  // Propiedades para manejo de imágenes
  imagenAnverso: string | null = null;
  imagenReverso: string | null = null;
  imagenAnversoPath: string | null = null;
  imagenReversoPath: string | null = null;

  // Filtros y paginación usando la API real
  filtros = {
    pais: '',
    denominacion: '',
    anio_desde: null as number | null,
    anio_hasta: null as number | null,
    precio_desde: null as number | null,
    precio_hasta: null as number | null,
    vendido: null as boolean | null,
    destacado: null as boolean | null
  };

  paginacion = {
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  };

  // Estados disponibles según la nueva especificación
  estadosDisponibles = ['Regular', 'Aceptable', 'Bueno', 'Muy bueno', 'Excelente'];

  // Propiedades para compatibilidad con el template legacy
  filtroTexto = '';
  filtroVendido = 'todos';
  filtroDestacado = 'todos';

  constructor() {
    this.billeteForm = this.fb.group({
      pais: ['', Validators.required],
      denominacion: ['', Validators.required],
      precio: ['', Validators.required],
      banco_emisor: [''],
      medidas: [''],
      descripcion: [''],
      descripcion_anverso: [''],
      descripcion_reverso: [''],
      url_anverso: [''],
      url_reverso: [''],
      pick: [''],
      estado: [''],
      vendido: [false], // Por defecto disponible
      destacado: [false],
      caracteristicas_ids: [[]]
    });
  }

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  private cargarDatosIniciales() {
    console.log('🚀 Iniciando carga de datos...');
    
    // Cargar datos en paralelo - cada método maneja su propio estado de carga
    this.cargarBilletes();
    this.cargarPaises();
    this.cargarCaracteristicas();
    this.cargarEstadisticas();
    
    console.log('📡 Solicitudes de carga iniciadas en paralelo');
  }

  private cargarBilletes() {
    console.log('💼 Cargando billetes...', this.filtros);
    this.cargando = true;
    
    // Preparar parámetros para la API
    const params = {
      page: this.paginacion.page,
      page_size: this.paginacion.page_size,
      ...this.filtros
    };
    
    console.log('📊 Cargando billetes con parámetros:', params);
    
    this.registrosService.obtenerBilletes(params).subscribe({
      next: (data: PaginatedResponse<Billete>) => {
        console.log('✅ Billetes cargados:', data);
        
        this.billetes = data.billetes || data.items || [];
        this.paginacion = {
          page: data.page,
          page_size: data.page_size,
          total: data.total,
          total_pages: data.total_pages,
          has_next: data.has_next,
          has_prev: data.has_prev
        };
        
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar billetes:', error);
        this.notificationService.error('Error al cargar los billetes: ' + (error.message || error.error?.detail || 'Error desconocido'), 'Error');
        this.billetes = [];
        this.cargando = false;
      }
    });
  }

  private async cargarPaises() {
    try {
      this.paises = await this.registrosService.obtenerRegistrosPaises().toPromise();
    } catch (error) {
      console.error('Error al cargar países:', error);
      this.notificationService.error('Error al cargar los países');
    }
  }

  private cargarCaracteristicas() {
    console.log('🏷️ Cargando características...');
    
    // Como el endpoint /caracteristicas/ no existe (404), usar datos por defecto
    console.log('⚠️ Endpoint de características no disponible, usando datos por defecto');
    this.caracteristicas = [
      { id: 1, nombre: 'Conmemorativo', descripcion: 'Billete conmemorativo especial', color: '#007bff' },
      { id: 2, nombre: 'Raro', descripcion: 'Billete poco común', color: '#dc3545' },
      { id: 3, nombre: 'Serie Limitada', descripcion: 'Tirada limitada', color: '#ffc107' },
      { id: 4, nombre: 'Histórico', descripcion: 'Valor histórico', color: '#28a745' }
    ];
    
    console.log('✅ Características cargadas (por defecto):', this.caracteristicas.length);
  }

  private cargarEstadisticas() {
    console.log('📊 Cargando estadísticas...');
    
    this.registrosService.obtenerEstadisticas().subscribe({
      next: (estadisticas) => {
        console.log('✅ Estadísticas cargadas:', estadisticas);
        this.estadisticas = estadisticas;
      },
      error: (error) => {
        console.error('❌ Error al cargar estadísticas:', error);
        console.log('🔄 Usando estadísticas locales como fallback');
        // Estadísticas calculadas localmente como fallback
        this.estadisticas = this.calcularEstadisticasLocales();
      }
    });
  }

  private calcularEstadisticasLocales(): Estadisticas {
    const total = this.billetes.length;
    const vendidos = this.billetes.filter(b => b.vendido).length;
    const destacados = this.billetes.filter(b => b.destacado).length;
    
    return {
      total_billetes: total,
      total_vendidos: vendidos,
      total_disponibles: total - vendidos,
      total_destacados: destacados,
      valor_total_inventario: '0',
      valor_inventario_disponible: '0',
      estadisticas_por_pais: {},
      estadisticas_por_estado: {},
      caracteristicas_mas_usadas: []
    };
  }

  // Métodos de modal
  abrirModal(billete?: Billete) {
    this.billeteSeleccionado = billete || null;
    this.modoEdicion = !!billete;
    
    if (billete) {
      this.billeteForm.patchValue({
        pais: billete.pais,
        banco_emisor: billete.banco_emisor || '',
        denominacion: billete.denominacion,
        medidas: billete.medidas || '',
        descripcion: billete.descripcion || '',
        descripcion_anverso: billete.descripcion_anverso || '',
        descripcion_reverso: billete.descripcion_reverso || '',
        url_anverso: billete.url_anverso || '',
        url_reverso: billete.url_reverso || '',
        pick: billete.pick || '',
        estado: billete.estado || '',
        precio: billete.precio || '',
        vendido: billete.vendido,
        destacado: billete.destacado,
        caracteristicas_ids: billete.caracteristicas?.map(c => c.id) || []
      });

      // Cargar imágenes existentes
      this.imagenAnverso = billete.url_anverso || null;
      this.imagenReverso = billete.url_reverso || null;
    } else {
      this.billeteForm.reset({
        vendido: false,
        destacado: false,
        caracteristicas_ids: []
      });

      // Limpiar imágenes
      this.imagenAnverso = null;
      this.imagenReverso = null;
      this.imagenAnversoPath = null;
      this.imagenReversoPath = null;
    }
    
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.billeteSeleccionado = null;
    this.billeteForm.reset();
    
    // Limpiar imágenes
    this.imagenAnverso = null;
    this.imagenReverso = null;
    this.imagenAnversoPath = null;
    this.imagenReversoPath = null;
  }

  // Métodos CRUD
  guardarBillete() {
    if (this.billeteForm.invalid) {
      this.notificationService.warning('Por favor complete todos los campos requeridos', 'Formulario incompleto');
      return;
    }

    if (this.cargando) return;
    
    this.cargando = true;
    const formData = this.billeteForm.value;
    
    console.log('💾 Guardando billete:', { modoEdicion: this.modoEdicion, formData });
    
    const operacion = this.modoEdicion && this.billeteSeleccionado
      ? this.registrosService.actualizarBillete(this.billeteSeleccionado.id!, formData)
      : this.registrosService.crearBillete(formData);
    
    operacion.subscribe({
      next: (response) => {
        console.log('✅ Billete guardado exitosamente:', response);
        
        this.notificationService.success(
          this.modoEdicion ? 'Billete actualizado correctamente' : 'Billete creado correctamente',
          'Éxito'
        );
        
        this.cerrarModal();
        this.cargarBilletes();
        this.cargarEstadisticas();
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al guardar billete:', error);
        this.notificationService.error(
          'Error al guardar el billete: ' + (error.message || error.error?.detail || 'Error desconocido'),
          'Error'
        );
        this.cargando = false;
      }
    });
  }

  async eliminarBillete() {
    if (!this.billeteSeleccionado?.id) return;

    const confirmar = await this.notificationService.confirm(
      '¿Está seguro de que desea eliminar este billete?',
      'Esta acción no se puede deshacer'
    );

    if (!confirmar) return;
    
    if (this.cargando) return;
    
    this.cargando = true;
    
    console.log('🗑️ Eliminando billete:', this.billeteSeleccionado.id);

    this.registrosService.eliminarBillete(this.billeteSeleccionado.id).subscribe({
      next: (response) => {
        console.log('✅ Billete eliminado exitosamente:', response);
        
        this.notificationService.success('Billete eliminado correctamente', 'Éxito');
        
        this.cerrarModal();
        this.cargarBilletes();
        this.cargarEstadisticas();
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al eliminar billete:', error);
        this.notificationService.error(
          'Error al eliminar el billete: ' + (error.message || error.error?.detail || 'Error desconocido'),
          'Error'
        );
        this.cargando = false;
      }
    });
  }

  // Métodos de estado
  toggleDestacado(billete: Billete) {
    if (this.cargando) return;
    
    this.cargando = true;
    const nuevoEstado = !billete.destacado;
    
    console.log('🌟 Cambiando estado destacado:', { id: billete.id, nuevoEstado });
    
    const billeteActualizado = { ...billete, destacado: nuevoEstado };
    
    this.registrosService.actualizarBillete(billete.id!, billeteActualizado).subscribe({
      next: (response) => {
        console.log('✅ Estado destacado actualizado:', response);
        billete.destacado = nuevoEstado;
        this.notificationService.success(`Billete ${nuevoEstado ? 'marcado como destacado' : 'desmarcado como destacado'}`, 'Éxito');
        
        // Recargar estadísticas si es necesario
        this.cargarEstadisticas();
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al cambiar estado destacado:', error);
        this.notificationService.error('Error al cambiar el estado destacado: ' + (error.message || error.error?.detail || 'Error desconocido'), 'Error');
        this.cargando = false;
      }
    });
  }

  toggleVendido(billete: Billete) {
    if (this.cargando) return;
    
    this.cargando = true;
    const nuevoEstado = !billete.vendido;
    
    console.log('💰 Cambiando estado vendido:', { id: billete.id, nuevoEstado });
    
    const billeteActualizado = { ...billete, vendido: nuevoEstado };
    
    this.registrosService.actualizarBillete(billete.id!, billeteActualizado).subscribe({
      next: (response) => {
        console.log('✅ Estado vendido actualizado:', response);
        billete.vendido = nuevoEstado;
        this.notificationService.success(`Billete marcado como ${nuevoEstado ? 'vendido' : 'disponible'}`, 'Éxito');
        
        // Recargar estadísticas si es necesario
        this.cargarEstadisticas();
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al cambiar estado vendido:', error);
        this.notificationService.error('Error al cambiar el estado de venta: ' + (error.message || error.error?.detail || 'Error desconocido'), 'Error');
        this.cargando = false;
      }
    });
  }

  // Métodos de filtros y paginación
  aplicarFiltros() {
    this.paginacion.page = 1;
    this.cargarBilletes();
  }

  limpiarFiltros() {
    this.filtros = {
      pais: '',
      denominacion: '',
      anio_desde: null,
      anio_hasta: null,
      precio_desde: null,
      precio_hasta: null,
      vendido: null,
      destacado: null
    };
    this.paginacion.page = 1;
    this.cargarBilletes();
  }

  cambiarPagina(nuevaPagina: number) {
    this.paginacion.page = nuevaPagina;
    this.cargarBilletes();
  }

  // Métodos de utilidad
  obtenerNombrePais(paisId: number): string {
    const pais = this.paises.find(p => p.id === paisId);
    return pais?.pais || 'País no encontrado';
  }

  obtenerNombresCaracteristicas(caracteristicasIds: number[]): string {
    if (!caracteristicasIds || caracteristicasIds.length === 0) return 'Ninguna';
    
    const nombres = caracteristicasIds
      .map(id => this.caracteristicas.find(c => c.id === id)?.nombre)
      .filter(nombre => nombre);
    
    return nombres.join(', ') || 'Ninguna';
  }

  formatearPrecio(precio?: string | number): string {
    if (!precio) return 'No definido';
    const numPrecio = typeof precio === 'string' ? parseFloat(precio) : precio;
    if (isNaN(numPrecio)) return 'No definido';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(numPrecio);
  }

  // Métodos de imagen
  async subirImagen(event: any, tipo: 'anverso' | 'reverso') {
    const archivo = event.target.files[0];
    if (!archivo) return;

    // Validar tipo de archivo
    if (!archivo.type.startsWith('image/')) {
      this.notificationService.error('Por favor seleccione un archivo de imagen válido');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (archivo.size > 5 * 1024 * 1024) {
      this.notificationService.error('La imagen no debe superar los 5MB');
      return;
    }

    try {
      this.cargando = true;
      
      // Usar el método existente del servicio
      const response = await this.registrosService.subirImagen(archivo).toPromise();
      
      if (response && response.url) {
        // Actualizar el formulario con la nueva URL
        const campo = tipo === 'anverso' ? 'url_anverso' : 'url_reverso';
        this.billeteForm.patchValue({
          [campo]: response.url
        });
        
        this.notificationService.success(`Imagen ${tipo} subida correctamente`);
      } else {
        this.notificationService.error('Error al procesar la imagen');
      }
      
    } catch (error) {
      console.error('Error al subir imagen:', error);
      this.notificationService.error('Error al subir la imagen');
    } finally {
      this.cargando = false;
    }
  }

  get totalPaginas(): number {
    return this.paginacion.total_pages;
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  // Getters para estadísticas (compatible con Angular templates)
  get billetesDisponibles(): number {
    return this.billetes.filter(b => !b.vendido).length;
  }

  get billetesVendidos(): number {
    return this.billetes.filter(b => b.vendido).length;
  }

  get billetesDestacados(): number {
    return this.billetes.filter(b => b.destacado).length;
  }

  get totalBilletes(): number {
    return this.billetes.length;
  }

  // Getters para compatibilidad con paginación legacy
  get totalItems(): number {
    return this.paginacion.total;
  }

  get pagina(): number {
    return this.paginacion.page;
  }

  get itemsPorPagina(): number {
    return this.paginacion.page_size;
  }

  // Math object para usar en templates
  Math = Math;

  // Método para manejar errores de carga de imagen
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/images/placeholder-billete.png';
    }
  }

  // Métodos para manejo de imágenes de billetes
  onImagenAnversoUploaded(imageData: BilleteImageData): void {
    console.log('🖼️ Imagen anverso subida:', imageData);
    this.imagenAnverso = imageData.url;
    this.imagenAnversoPath = imageData.path;
    
    // Actualizar el FormControl
    this.billeteForm.patchValue({
      url_anverso: imageData.url
    });
  }

  onImagenAnversoRemoved(): void {
    console.log('🗑️ Imagen anverso eliminada');
    this.imagenAnverso = null;
    this.imagenAnversoPath = null;
    
    // Limpiar el FormControl
    this.billeteForm.patchValue({
      url_anverso: ''
    });
  }

  onImagenReversoUploaded(imageData: BilleteImageData): void {
    console.log('🖼️ Imagen reverso subida:', imageData);
    this.imagenReverso = imageData.url;
    this.imagenReversoPath = imageData.path;
    
    // Actualizar el FormControl
    this.billeteForm.patchValue({
      url_reverso: imageData.url
    });
  }

  onImagenReversoRemoved(): void {
    console.log('🗑️ Imagen reverso eliminada');
    this.imagenReverso = null;
    this.imagenReversoPath = null;
    
    // Limpiar el FormControl
    this.billeteForm.patchValue({
      url_reverso: ''
    });
  }

  // Obtener ID del país seleccionado para las imágenes
  get paisSeleccionadoId(): string {
    const paisId = this.billeteForm.get('pais')?.value;
    console.log('🌍 País seleccionado para imagen:', { paisId, formValue: this.billeteForm.get('pais')?.value });
    return paisId ? paisId.toString() : '';
  }

  // Obtener ID del billete para las imágenes
  get billeteId(): string {
    return this.billeteSeleccionado?.id?.toString() || `temp-${Date.now()}`;
  }
}