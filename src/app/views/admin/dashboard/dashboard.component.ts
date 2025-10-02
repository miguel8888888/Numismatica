import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RegistrosService } from '../../../services/registros.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  estadisticas = {
    totalPaises: 0,
    totalBilletes: 0,
    usuariosActivos: 0,
    ventasHoy: 0
  };

  actividadReciente = [
    {
      tipo: 'pais',
      mensaje: 'Nuevo país agregado: Colombia',
      fecha: new Date(),
      icono: 'fas fa-globe-americas',
      color: 'text-blue-600'
    },
    {
      tipo: 'billete',
      mensaje: 'Billete actualizado: 50.000 Pesos Colombia',
      fecha: new Date(Date.now() - 3600000),
      icono: 'fas fa-money-bill-wave',
      color: 'text-green-600'
    },
    {
      tipo: 'usuario',
      mensaje: 'Nuevo usuario registrado',
      fecha: new Date(Date.now() - 7200000),
      icono: 'fas fa-user-plus',
      color: 'text-purple-600'
    }
  ];

  graficoDatos = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [85, 120, 95, 140, 160, 180]
  };

  constructor(
    private router: Router,
    private registrosService: RegistrosService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    // Cargar países
    this.registrosService.obtenerRegistrosPaises().subscribe({
      next: (paises) => {
        this.estadisticas.totalPaises = paises.length;
      },
      error: (error) => console.error('Error al cargar países:', error)
    });

    // Cargar billetes
    this.registrosService.obtenerRegistrosBilletes().subscribe({
      next: (billetes) => {
        this.estadisticas.totalBilletes = billetes.length;
      },
      error: (error) => console.error('Error al cargar billetes:', error)
    });

    // Simular otros datos
    this.estadisticas.usuariosActivos = 24;
    this.estadisticas.ventasHoy = 12;
  }

  irARegistrarPaises() {
    this.router.navigate(['/admin/registrar-paises']);
  }

  irAGestionarBilletes() {
    this.router.navigate(['/admin/billetes']);
  }

  verTodaActividad() {
    this.router.navigate(['/admin/actividad']);
  }

  async exportarReporte(): Promise<void> {
    // Lógica para exportar reporte
    console.log('Exportando reporte...');
    
    const confirmar = await this.notificationService.confirm(
      '¿Deseas exportar el reporte completo del sistema?\n\nEsto incluirá todas las estadísticas y datos actuales.',
      'Exportar Reporte'
    );
    
    if (confirmar) {
      // Simular proceso de exportación
      await this.notificationService.success(
        'El reporte se ha exportado correctamente y se ha enviado a tu email.',
        'Reporte Exportado'
      );
    }
  }

  // Métodos de prueba para las notificaciones
  async probarNotificaciones(): Promise<void> {
    await this.notificationService.info(
      'Este es un ejemplo de notificación informativa.\n\nPuedes usar este tipo de notificaciones para mostrar información general.',
      'ℹ️ Información'
    );
  }

  async probarSuccess(): Promise<void> {
    await this.notificationService.success(
      'Operación completada exitosamente.\n\nTodos los cambios se han guardado correctamente.',
      '✅ Éxito'
    );
  }

  async probarWarning(): Promise<void> {
    await this.notificationService.warning(
      'Ten cuidado con esta acción.\n\nAsegúrate de haber guardado todos los cambios antes de continuar.',
      '⚠️ Advertencia'
    );
  }

  async probarError(): Promise<void> {
    await this.notificationService.error(
      'Ha ocurrido un error inesperado.\n\nPor favor, inténtalo de nuevo más tarde o contacta al administrador.',
      '❌ Error'
    );
  }

  obtenerTiempoTranscurrido(fecha: Date): string {
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor(diferencia / (1000 * 60));

    if (horas > 0) {
      return `hace ${horas} hora${horas > 1 ? 's' : ''}`;
    } else if (minutos > 0) {
      return `hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    } else {
      return 'hace unos momentos';
    }
  }
}
