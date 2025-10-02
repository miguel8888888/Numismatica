# Componente ExplorarBilletes - Documentación

## 📋 Descripción
El componente `ExplorarBilletesComponent` proporciona una interfaz intuitiva para explorar billetes organizados jerárquicamente por continentes y países, con capacidades de filtrado avanzadas.

## 🗂️ Estructura de Datos

### Datos de Entrada (API)
```typescript
interface BilleteAPI {
  id: number;
  denominacion: string;
  precio: string;
  anverso: string;
  reverso: string;
  pais: number;
  pais_rel: {
    id: number;
    pais: string;
    bandera: string;
  };
}
```

### Ejemplo de Respuesta de la API
```json
[
  {
    "anverso": "https://ljmwhelmcwtxbticvuwd.supabase.co/storage/v1/object/public/img-billetes/banderas.jpg",
    "reverso": "https://ljmwhelmcwtxbticvuwd.supabase.co/storage/v1/object/public/img-billetes/banderas.jpg",
    "pais": 1,
    "denominacion": "prueba billete",
    "precio": "50000",
    "id": 1,
    "pais_rel": {
      "id": 1,
      "pais": "Colombia",
      "bandera": "co"
    }
  }
]
```

## 🔄 Procesamiento de Datos

### Mapeo de Países a Continentes
El componente incluye un mapeo completo de países a continentes con sus respectivos códigos de bandera:

```typescript
private paisesAContinentes = {
  'Colombia': { continente: 'América', codigo: 'co' },
  'España': { continente: 'Europa', codigo: 'es' },
  // ... más de 50 países
};
```

### Transformación de Datos
Los datos se procesan para agregar campos calculados:

```typescript
procesarBilletes(billetesRaw: any[]): BilleteDetallado[] {
  return billetesRaw.map(billete => {
    const nombrePais = billete.pais_rel?.pais || 'Desconocido';
    const paisInfo = this.paisesAContinentes[nombrePais];
    return {
      ...billete,
      continente: paisInfo.continente,
      codigoPais: billete.pais_rel?.bandera,
      precioNumerico: parseFloat(billete.precio) || 0
    };
  });
}
```

## 🎯 Navegación Jerárquica

### Nivel 1: Continentes
- Muestra todos los continentes con billetes disponibles
- Estadísticas: número de países, billetes totales, precio promedio
- Iconos visuales para cada continente

### Nivel 2: Países por Continente
- Lista países del continente seleccionado
- Muestra cantidad de billetes y precio promedio por país
- Banderas de países usando códigos de `pais_rel.bandera`

### Nivel 3: Billetes por País
- Grid de billetes usando el componente `CardComponent` existente
- Sistema de filtros integrado
- Contadores dinámicos de resultados

## 🔍 Sistema de Filtros

### Filtro por Denominación
```typescript
// Búsqueda de texto en el campo denominación
filtroTexto: string = '';
```

### Filtro por Rango de Precios
```typescript
// Rangos adaptados para billetes colombianos
filtroPrecios: string = '';
// Opciones: '0-10000', '10000-50000', '50000-100000', '100000+'
```

## 🎨 Características de UX

### Estados de Carga
- Spinner animado durante la carga de datos
- Mensajes informativos

### Manejo de Errores
- Vista de error elegante con opción de reintentar
- Validación de datos faltantes

### Navegación
- Breadcrumbs interactivos
- Botones de retroceso en cada nivel
- URLs amigables

### Responsive Design
- Grid adaptativo para diferentes tamaños de pantalla
- Optimizado para móviles y desktop

## 🚀 Integración

### Ruta
```typescript
// En app.routes.ts
{ 
  path: 'explorar-billetes', 
  loadComponent: () => import('./views/public/explorar-billetes/explorar-billetes.component').then(c => c.ExplorarBilletesComponent)
}
```

### Menú de Navegación
```html
<!-- En landing.component.html -->
<a routerLink="/explorar-billetes" 
   routerLinkActive="text-blue-600 border-b-2 border-blue-600"
   class="py-4 px-2 text-gray-700 hover:text-blue-600 transition-colors duration-200">
  Explorar Billetes
</a>
```

### Servicio
Utiliza el `RegistrosService` existente:
```typescript
this.registrosService.obtenerRegistrosBilletes().subscribe({
  next: (data) => {
    this.billetes = this.procesarBilletes(data || []);
    // ...
  }
});
```

## 📊 Estadísticas Calculadas

### Por Continente
- Total de países
- Total de billetes
- Precio promedio

### Por País
- Total de billetes
- Precio promedio
- Código de bandera

## 🔧 Configuración de Desarrollo

### Dependencias
```typescript
imports: [CommonModule, FormsModule, CardComponent]
```

### Archivos
- `explorar-billetes.component.ts` - Lógica del componente
- `explorar-billetes.component.html` - Template
- `explorar-billetes.component.css` - Estilos y animaciones

## 📱 Responsividad

### Breakpoints
- **Mobile**: Grid de 1 columna
- **Tablet**: Grid de 2-3 columnas
- **Desktop**: Grid de 3-4 columnas

### Adaptaciones Móviles
- Menús colapsibles
- Botones más grandes
- Texto optimizado para pantallas pequeñas

## 🎯 Próximas Mejoras Sugeridas

1. **Búsqueda Avanzada**: Filtros adicionales por fecha, estado, etc.
2. **Ordenamiento**: Por precio, fecha, denominación
3. **Vista de Lista**: Alternativa al grid de cards
4. **Exportar**: Funcionalidad para exportar resultados
5. **Favoritos**: Sistema para marcar billetes favoritos
6. **Comparar**: Comparación lado a lado de billetes

## 🐛 Debugging

### Logs Útiles
```typescript
console.log('Billetes obtenidos:', data);
console.log('Billetes procesados:', this.billetes);
console.log('Continentes organizados:', this.continentes);
```

### Validaciones
- Verificar que `pais_rel` existe en todos los billetes
- Confirmar que los códigos de bandera coinciden con flag-icons
- Validar que los precios son numéricos parseables

## 📞 Soporte
Para dudas o mejoras, contactar al equipo de desarrollo.