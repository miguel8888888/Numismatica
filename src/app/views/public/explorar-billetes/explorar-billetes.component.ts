import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrosService } from '../../../services/registros.service';
import { CardComponent } from '../../../components/card/card.component';

interface BilleteDetallado {
  id: number;
  denominacion: string;
  precio: string;
  url_anverso: string;
  url_reverso: string;
  pais: number;
  pais_rel: {
    id: number;
    pais: string;
    bandera: string;
  };
  // Campos calculados
  continente?: string;
  codigoPais?: string;
  precioNumerico?: number;
}

interface ContinenteInfo {
  nombre: string;
  paises: Set<string>;
  totalBilletes: number;
  precioPromedio: number;
  icono: string;
}

interface PaisInfo {
  nombre: string;
  codigoPais: string;
  totalBilletes: number;
  precioPromedio: number;
  billetes: BilleteDetallado[];
}

@Component({
  selector: 'app-explorar-billetes',
  imports: [CommonModule, FormsModule, CardComponent],
  templateUrl: './explorar-billetes.component.html',
  styleUrl: './explorar-billetes.component.css'
})
export class ExplorarBilletesComponent implements OnInit {
  // Estados de navegación
  vistaActual: 'continentes' | 'paises' | 'billetes' = 'continentes';
  continenteSeleccionado: string | null = null;
  paisSeleccionado: string | null = null;
  
  // Datos
  continentes: ContinenteInfo[] = [];
  paisesPorContinente: PaisInfo[] = [];
  billetes: BilleteDetallado[] = [];
  billetesFiltrados: BilleteDetallado[] = [];
  billetesPaisBase: BilleteDetallado[] = []; // Billetes del país sin filtros
  
  // Filtros
  filtroTexto: string = '';
  
  // Rango de precios
  precioMinimo: number = 10000;
  precioMaximo: number = 200000;
  precioMinimoSeleccionado: number = 10000;
  precioMaximoSeleccionado: number = 200000;
  
  // Flags para el rango
  rangoInicializado = false;
  
  // Estados UI
  loading = true;
  error = false;
  
  // Mapeo de países a continentes y códigos
  private paisesAContinentes: { [key: string]: { continente: string; codigo: string } } = {
    // América
    'Colombia': { continente: 'América', codigo: 'co' },
    'Estados Unidos': { continente: 'América', codigo: 'us' },
    'México': { continente: 'América', codigo: 'mx' },
    'Brasil': { continente: 'América', codigo: 'br' },
    'Argentina': { continente: 'América', codigo: 'ar' },
    'Chile': { continente: 'América', codigo: 'cl' },
    'Perú': { continente: 'América', codigo: 'pe' },
    'Ecuador': { continente: 'América', codigo: 'ec' },
    'Venezuela': { continente: 'América', codigo: 've' },
    'Uruguay': { continente: 'América', codigo: 'uy' },
    'Paraguay': { continente: 'América', codigo: 'py' },
    'Bolivia': { continente: 'América', codigo: 'bo' },
    'Canadá': { continente: 'América', codigo: 'ca' },
    
    // Europa
    'España': { continente: 'Europa', codigo: 'es' },
    'Francia': { continente: 'Europa', codigo: 'fr' },
    'Italia': { continente: 'Europa', codigo: 'it' },
    'Alemania': { continente: 'Europa', codigo: 'de' },
    'Reino Unido': { continente: 'Europa', codigo: 'gb' },
    'Portugal': { continente: 'Europa', codigo: 'pt' },
    'Suiza': { continente: 'Europa', codigo: 'ch' },
    'Austria': { continente: 'Europa', codigo: 'at' },
    'Bélgica': { continente: 'Europa', codigo: 'be' },
    'Holanda': { continente: 'Europa', codigo: 'nl' },
    'Suecia': { continente: 'Europa', codigo: 'se' },
    'Noruega': { continente: 'Europa', codigo: 'no' },
    'Dinamarca': { continente: 'Europa', codigo: 'dk' },
    
    // Asia
    'Japón': { continente: 'Asia', codigo: 'jp' },
    'China': { continente: 'Asia', codigo: 'cn' },
    'India': { continente: 'Asia', codigo: 'in' },
    'Corea del Sur': { continente: 'Asia', codigo: 'kr' },
    'Tailandia': { continente: 'Asia', codigo: 'th' },
    'Singapur': { continente: 'Asia', codigo: 'sg' },
    'Malasia': { continente: 'Asia', codigo: 'my' },
    'Indonesia': { continente: 'Asia', codigo: 'id' },
    'Filipinas': { continente: 'Asia', codigo: 'ph' },
    
    // África
    'Sudáfrica': { continente: 'África', codigo: 'za' },
    'Egipto': { continente: 'África', codigo: 'eg' },
    'Marruecos': { continente: 'África', codigo: 'ma' },
    'Nigeria': { continente: 'África', codigo: 'ng' },
    'Kenia': { continente: 'África', codigo: 'ke' },
    'Ghana': { continente: 'África', codigo: 'gh' },
    
    // Oceanía
    'Australia': { continente: 'Oceanía', codigo: 'au' },
    'Nueva Zelanda': { continente: 'Oceanía', codigo: 'nz' }
  };

  constructor(
    private registrosService: RegistrosService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    this.loading = true;
    this.error = false;
    
    console.time('Carga de billetes');
    
    // Usar el método original que funciona correctamente
    this.registrosService.obtenerRegistrosBilletes().subscribe({
      next: (response) => {
        this.procesarRespuestaBilletes(response);
      },
      error: (error) => {
        console.error('❌ Error al cargar billetes:', error);
        if (error.error && error.error.detail) {
          console.error('💥 Detalles del error:', error.error.detail);
        }
        console.timeEnd('Carga de billetes');
        this.error = true;
        this.loading = false;
      }
    });
  }

  private procesarRespuestaBilletes(response: any) {
    console.log('✅ Respuesta de billetes recibida:', response);
    // Extraer los billetes de la estructura paginada
    const billetesArray = response?.billetes || response || [];
    console.log(`📊 Array de billetes extraído: ${billetesArray.length} billetes`);
    
    console.time('⚡ Procesamiento de billetes');
    this.billetes = this.procesarBilletes(billetesArray);
    console.timeEnd('⚡ Procesamiento de billetes');
    console.log(`🎯 Billetes procesados: ${this.billetes.length}`);
    
    console.time('💰 Cálculo de rango de precios');
    this.calcularRangoPrecios();
    console.timeEnd('💰 Cálculo de rango de precios');
    
    console.time('🌍 Organización por continentes');
    this.organizarPorContinentes();
    console.timeEnd('🌍 Organización por continentes');
    console.log(`🗺️ Continentes organizados: ${this.continentes.length}`);
    
    console.timeEnd('Carga de billetes');
    this.loading = false;
    console.log('🎉 Carga completada exitosamente');
  }

  private procesarBilletes(billetesRaw: any[]): BilleteDetallado[] {
    // Validar que billetesRaw sea un array
    if (!Array.isArray(billetesRaw)) {
      console.warn('Los datos de billetes no son un array:', billetesRaw);
      return [];
    }
    
    return billetesRaw.map(billete => {
      const nombrePais = billete.pais_rel?.pais || 'Desconocido';
      const paisInfo = this.paisesAContinentes[nombrePais] || { continente: 'Otros', codigo: 'xx' };
      return {
        ...billete,
        continente: paisInfo.continente,
        codigoPais: billete.pais_rel?.bandera || paisInfo.codigo,
        precioNumerico: parseFloat(billete.precio) || 0
      };
    });
  }

  private calcularRangoPrecios() {
    if (this.billetes.length === 0) {
      // Valores por defecto si no hay billetes
      if (!this.rangoInicializado) {
        this.precioMinimoSeleccionado = 10000;  // $10,000
        this.precioMaximoSeleccionado = 150000; // $150,000
        this.rangoInicializado = true;
      }
      return;
    }
    
    const precios = this.billetes.map(b => b.precioNumerico || 0).filter(p => p > 0);
    if (precios.length === 0) {
      if (!this.rangoInicializado) {
        this.precioMinimoSeleccionado = 10000;  // $10,000
        this.precioMaximoSeleccionado = 150000; // $150,000
        this.rangoInicializado = true;
      }
      return;
    }
    
    const minPrecio = Math.min(...precios);
    const maxPrecio = Math.max(...precios);
    
    // Usar mínimo fijo de 10,000 siempre
    this.precioMinimo = 10000;
    this.precioMaximo = Math.max(200000, Math.ceil(maxPrecio / 1000) * 1000);
    
    // Establecer valores iniciales del slider con separación visible
    if (!this.rangoInicializado) {
      // Crear una separación inicial para que se vean ambos puntos
      const rango = this.precioMaximo - this.precioMinimo;
      this.precioMinimoSeleccionado = this.precioMinimo + Math.floor(rango * 0.2); // 20% del rango
      this.precioMaximoSeleccionado = this.precioMinimo + Math.floor(rango * 0.8);  // 80% del rango
      this.rangoInicializado = true;
    }
    
    console.log('Rango de precios calculado:', this.precioMinimo, '-', this.precioMaximo);
  }

  organizarPorContinentes() {
    const continentesMap = new Map<string, ContinenteInfo>();
    const preciosPorContinente = new Map<string, number[]>();
    
    // Una sola pasada por todos los billetes para recopilar datos
    this.billetes.forEach(billete => {
      const continente = billete.continente || 'Otros';
      const precio = billete.precioNumerico || 0;
      
      // Inicializar continente si no existe
      if (!continentesMap.has(continente)) {
        continentesMap.set(continente, {
          nombre: continente,
          paises: new Set(),
          totalBilletes: 0,
          precioPromedio: 0,
          icono: this.obtenerIconoContinente(continente)
        });
        preciosPorContinente.set(continente, []);
      }
      
      const cont = continentesMap.get(continente)!;
      cont.paises.add(billete.pais_rel.pais);
      cont.totalBilletes++;
      
      // Acumular precio para calcular promedio
      if (precio > 0) {
        preciosPorContinente.get(continente)!.push(precio);
      }
    });
    
    // Calcular precios promedio de forma eficiente
    continentesMap.forEach((continente, nombre) => {
      const precios = preciosPorContinente.get(nombre) || [];
      if (precios.length > 0) {
        const sumaPrecios = precios.reduce((sum, precio) => sum + precio, 0);
        continente.precioPromedio = sumaPrecios / precios.length;
      }
    });
    
    this.continentes = Array.from(continentesMap.values())
      .sort((a, b) => b.totalBilletes - a.totalBilletes); // Ordenar por cantidad de billetes
  }

  obtenerIconoContinente(continente: string): string {
    const iconos: { [key: string]: string } = {
      'América': '🌎',
      'Europa': '🌍',
      'Asia': '🌏',
      'África': '🌍',
      'Oceanía': '🌏',
      'Otros': '🌐'
    };
    return iconos[continente] || '🌐';
  }

  seleccionarContinente(continente: string) {
    this.continenteSeleccionado = continente;
    this.vistaActual = 'paises';
    this.cargarPaisesPorContinente(continente);
  }

  cargarPaisesPorContinente(continente: string) {
    const paisesMap = new Map<string, PaisInfo>();
    
    const billetesContinente = this.billetes.filter(b => b.continente === continente);
    
    billetesContinente.forEach(billete => {
      const nombrePais = billete.pais_rel.pais;
      if (!paisesMap.has(nombrePais)) {
        paisesMap.set(nombrePais, {
          nombre: nombrePais,
          codigoPais: billete.codigoPais || 'xx',
          totalBilletes: 0,
          precioPromedio: 0,
          billetes: []
        });
      }
      
      const pais = paisesMap.get(nombrePais)!;
      pais.billetes.push(billete);
      pais.totalBilletes++;
    });
    
    // Calcular precios promedio por país
    paisesMap.forEach(pais => {
      const sumaPrecios = pais.billetes.reduce((sum, b) => sum + (b.precioNumerico || 0), 0);
      pais.precioPromedio = pais.billetes.length > 0 ? sumaPrecios / pais.billetes.length : 0;
    });
    
    this.paisesPorContinente = Array.from(paisesMap.values())
      .sort((a, b) => b.totalBilletes - a.totalBilletes);
  }

  seleccionarPais(pais: string) {
    this.paisSeleccionado = pais;
    this.vistaActual = 'billetes';
    this.filtrarBilletesPorPais(pais);
  }

  filtrarBilletesPorPais(pais: string) {
    // Guardar los billetes base del país (sin filtros aplicados)
    this.billetesPaisBase = this.billetes.filter(billete => 
      billete.pais_rel.pais === pais && 
      billete.continente === this.continenteSeleccionado
    );
    
    console.log('Billetes base para', pais, ':', this.billetesPaisBase.length);
    console.log('Continente seleccionado:', this.continenteSeleccionado);
    
    // Aplicar filtros sobre la base limpia
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    // Siempre partir de la base limpia de billetes del país
    let resultado = [...this.billetesPaisBase];
    
    console.log('Aplicando filtros - Base inicial:', resultado.length);
    console.log('Filtro texto:', this.filtroTexto);
    console.log('Rango precios:', this.precioMinimoSeleccionado, '-', this.precioMaximoSeleccionado);
    
    // Filtro por texto (denominación)
    if (this.filtroTexto.trim()) {
      resultado = resultado.filter(billete =>
        billete.denominacion.toLowerCase().includes(this.filtroTexto.toLowerCase())
      );
      console.log('Después del filtro de texto:', resultado.length);
    }
    
    // Filtro por rango de precios
    if (this.precioMinimoSeleccionado > this.precioMinimo || this.precioMaximoSeleccionado < this.precioMaximo) {
      resultado = resultado.filter(billete => {
        const precio = billete.precioNumerico || 0;
        return precio >= this.precioMinimoSeleccionado && precio <= this.precioMaximoSeleccionado;
      });
      console.log('Después del filtro de precios:', resultado.length);
    }
    
    // Asignar el resultado filtrado
    this.billetesFiltrados = resultado;
    console.log('Resultado final de filtros:', this.billetesFiltrados.length);
  }

  onFiltroTextoChange() {
    this.aplicarFiltros();
  }

  onRangoPreciosChange() {
    console.log('Cambio de rango:', this.precioMinimoSeleccionado, '-', this.precioMaximoSeleccionado);
    this.aplicarFiltros();
  }

  onPrecioMinimoChange(event: any) {
    const nuevoMinimo = parseInt(event.target.value);
    
    // Asegurar que el mínimo no sea mayor que el máximo
    if (nuevoMinimo >= this.precioMaximoSeleccionado) {
      // Si intenta superar el máximo, dejarlo justo antes
      this.precioMinimoSeleccionado = this.precioMaximoSeleccionado - 1000;
    } else {
      this.precioMinimoSeleccionado = nuevoMinimo;
    }
    
    console.log('Precio mínimo cambiado a:', this.precioMinimoSeleccionado);
    this.onRangoPreciosChange();
  }

  onPrecioMaximoChange(event: any) {
    const nuevoMaximo = parseInt(event.target.value);
    
    // Asegurar que el máximo no sea menor que el mínimo
    if (nuevoMaximo <= this.precioMinimoSeleccionado) {
      // Si intenta ser menor que el mínimo, dejarlo justo después
      this.precioMaximoSeleccionado = this.precioMinimoSeleccionado + 1000;
    } else {
      this.precioMaximoSeleccionado = nuevoMaximo;
    }
    
    console.log('Precio máximo cambiado a:', this.precioMaximoSeleccionado);
    this.onRangoPreciosChange();
  }

  volver() {
    if (this.vistaActual === 'billetes') {
      this.vistaActual = 'paises';
      this.paisSeleccionado = null;
      this.filtroTexto = '';
      this.precioMinimoSeleccionado = this.precioMinimo;
      this.precioMaximoSeleccionado = this.precioMaximo;
      this.billetesPaisBase = [];
      this.billetesFiltrados = [];
    } else if (this.vistaActual === 'paises') {
      this.vistaActual = 'continentes';
      this.continenteSeleccionado = null;
      this.paisesPorContinente = [];
    }
  }

  irAContinentes() {
    this.vistaActual = 'continentes';
    this.continenteSeleccionado = null;
    this.paisSeleccionado = null;
    this.paisesPorContinente = [];
    this.billetesFiltrados = [];
    this.billetesPaisBase = [];
    this.filtroTexto = '';
    this.precioMinimoSeleccionado = this.precioMinimo;
    this.precioMaximoSeleccionado = this.precioMaximo;
  }

  irAPaises() {
    if (this.continenteSeleccionado) {
      this.vistaActual = 'paises';
      this.paisSeleccionado = null;
      this.billetesFiltrados = [];
      this.billetesPaisBase = [];
      this.filtroTexto = '';
      this.precioMinimoSeleccionado = this.precioMinimo;
      this.precioMaximoSeleccionado = this.precioMaximo;
    }
  }

  formatCOP(valor: number): string {
    return '$' + valor.toLocaleString('es-CO', { minimumFractionDigits: 0 });
  }

  reintentarCarga() {
    this.cargarDatosIniciales();
  }

  obtenerTotalBilletesPais(): number {
    if (!this.paisSeleccionado) return 0;
    return this.billetes.filter(b => b.pais_rel.pais === this.paisSeleccionado).length;
  }

  limpiarFiltros() {
    console.log('Limpiando filtros...');
    this.filtroTexto = '';
    this.precioMinimoSeleccionado = this.precioMinimo;
    this.precioMaximoSeleccionado = this.precioMaximo;
    this.aplicarFiltros();
  }

  tienesFiltrosActivos(): boolean {
    return this.filtroTexto.trim() !== '' || 
           this.precioMinimoSeleccionado > this.precioMinimo || 
           this.precioMaximoSeleccionado < this.precioMaximo;
  }

  getLeftPercentage(): number {
    if (this.precioMaximo === this.precioMinimo) return 0;
    return ((this.precioMinimoSeleccionado - this.precioMinimo) / (this.precioMaximo - this.precioMinimo)) * 100;
  }

  getWidthPercentage(): number {
    if (this.precioMaximo === this.precioMinimo) return 100;
    return ((this.precioMaximoSeleccionado - this.precioMinimoSeleccionado) / (this.precioMaximo - this.precioMinimo)) * 100;
  }
}