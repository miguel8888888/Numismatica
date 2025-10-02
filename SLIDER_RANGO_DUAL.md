# Slider de Rango Dual - Filtros de Precio

## 🎚️ Implementación del Slider de Rango Dual

Se ha implementado un slider de rango dual que reemplaza el select desplegable de rangos de precios predefinidos. Esta mejora permite una selección más precisa y flexible del rango de precios.

## 🎯 Características Implementadas

### 1. **Slider Dual Interactivo**
- **Slider Mínimo**: Control deslizante azul para el precio mínimo
- **Slider Máximo**: Control deslizante verde para el precio máximo
- **Track Visual**: Barra azul que muestra el rango seleccionado
- **Valores Dinámicos**: Muestra los valores actuales en tiempo real

### 2. **Cálculo Automático de Rangos**
```typescript
private calcularRangoPrecios() {
  const precios = this.billetes.map(b => b.precioNumerico || 0).filter(p => p > 0);
  this.precioMinimo = Math.floor(Math.min(...precios) / 1000) * 1000;
  this.precioMaximo = Math.ceil(Math.max(...precios) / 1000) * 1000;
}
```

### 3. **Validación Inteligente**
- El precio mínimo no puede ser mayor que el máximo
- El precio máximo no puede ser menor que el mínimo
- Ajuste automático cuando hay conflictos

### 4. **Experiencia de Usuario Mejorada**
- Pasos de 1000 en 1000 para valores más manejables
- Formato de precios en pesos colombianos
- Etiquetas de valores extremos
- Efectos hover y active

## 🔧 Estructura del Componente

### Nuevas Propiedades
```typescript
// Rango de precios
precioMinimo: number = 0;
precioMaximo: number = 200000;
precioMinimoSeleccionado: number = 0;
precioMaximoSeleccionado: number = 200000;

// Control de inicialización
rangoInicializado = false;
```

### Métodos Principales

#### `calcularRangoPrecios()`
Calcula automáticamente el rango real de precios basado en los datos:
- Extrae todos los precios válidos
- Redondea a miles para valores más amigables
- Establece los valores iniciales del slider

#### `onPrecioMinimoChange(event)` / `onPrecioMaximoChange(event)`
Manejan los cambios en cada slider:
- Validan que el mínimo no supere al máximo
- Actualizan los valores seleccionados
- Reaplican los filtros automáticamente

#### `tienesFiltrosActivos()`
Determina si hay filtros activos para mostrar mensajes apropiados:
```typescript
tienesFiltrosActivos(): boolean {
  return this.filtroTexto.trim() !== '' || 
         this.precioMinimoSeleccionado > this.precioMinimo || 
         this.precioMaximoSeleccionado < this.precioMaximo;
}
```

## 🎨 Implementación Visual

### HTML Template
```html
<div class="min-w-80">
  <label class="block text-sm font-medium text-gray-700 mb-1">Rango de precios</label>
  <div class="px-3">
    <!-- Valores actuales -->
    <div class="flex justify-between items-center mb-2">
      <span class="text-xs text-gray-600">{{ formatCOP(precioMinimoSeleccionado) }}</span>
      <span class="text-xs text-gray-500">-</span>
      <span class="text-xs text-gray-600">{{ formatCOP(precioMaximoSeleccionado) }}</span>
    </div>
    
    <!-- Sliders duales -->
    <div class="relative">
      <input type="range" class="range-slider range-min" [(ngModel)]="precioMinimoSeleccionado">
      <input type="range" class="range-slider range-max" [(ngModel)]="precioMaximoSeleccionado">
      
      <!-- Track visual -->
      <div class="relative h-2 bg-gray-200 rounded-lg">
        <div class="absolute h-full bg-blue-500 rounded-lg" [style.left.%]="..." [style.width.%]="...">
        </div>
      </div>
    </div>
    
    <!-- Etiquetas extremos -->
    <div class="flex justify-between mt-1">
      <span class="text-xs text-gray-400">{{ formatCOP(precioMinimo) }}</span>
      <span class="text-xs text-gray-400">{{ formatCOP(precioMaximo) }}</span>
    </div>
  </div>
</div>
```

### Estilos CSS
```css
/* Slider base */
.range-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  background: transparent;
  outline: none;
  pointer-events: none;
}

/* Thumbs (controles deslizantes) */
.range-slider::-webkit-slider-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3B82F6;
  border: 2px solid #ffffff;
  cursor: pointer;
  pointer-events: all;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  transition: all 0.2s ease;
}

/* Colores diferenciados */
.range-min::-webkit-slider-thumb { background: #3B82F6; } /* Azul */
.range-max::-webkit-slider-thumb { background: #10B981; } /* Verde */
```

## 📱 Responsive Design

### Mobile (< 640px)
- Thumbs más grandes (24px vs 20px) para mejor touch interaction
- Espaciado optimizado para pantallas táctiles

### Desktop
- Efectos hover más pronunciados
- Transiciones suaves
- Mejor feedback visual

## 🔍 Lógica de Filtrado

### Aplicación de Filtros
```typescript
aplicarFiltros() {
  let resultado = [...this.billetesPaisBase];
  
  // Filtro por rango de precios
  if (this.precioMinimoSeleccionado > this.precioMinimo || 
      this.precioMaximoSeleccionado < this.precioMaximo) {
    resultado = resultado.filter(billete => {
      const precio = billete.precioNumerico || 0;
      return precio >= this.precioMinimoSeleccionado && 
             precio <= this.precioMaximoSeleccionado;
    });
  }
  
  this.billetesFiltrados = resultado;
}
```

### Limpieza de Filtros
```typescript
limpiarFiltros() {
  this.filtroTexto = '';
  this.precioMinimoSeleccionado = this.precioMinimo;
  this.precioMaximoSeleccionado = this.precioMaximo;
  this.aplicarFiltros();
}
```

## 🎯 Ventajas del Nuevo Sistema

### ✅ **Mejoras de UX**
1. **Selección Precisa**: No limitado a rangos predefinidos
2. **Feedback Visual**: Ve el rango seleccionado en tiempo real
3. **Interacción Intuitiva**: Arrastra para ajustar valores
4. **Adaptativo**: Se ajusta automáticamente a los datos disponibles

### ✅ **Mejoras Técnicas**
1. **Menos Código**: No necesita múltiples condiciones switch
2. **Más Flexible**: Funciona con cualquier rango de datos
3. **Mejor Rendimiento**: Un solo filtro instead de múltiples condiciones
4. **Mantenible**: Lógica centralizada y clara

### ✅ **Accesibilidad**
1. **Compatible con Teclado**: Se puede usar con Tab y flechas
2. **Screen Reader Friendly**: Labels apropiados
3. **Touch Friendly**: Optimizado para dispositivos móviles
4. **Visual Feedback**: Colores y estados claros

## 🧪 Testing

### Casos de Prueba
1. **Rangos Válidos**: Establecer mín < máx
2. **Rangos Inválidos**: Intentar mín > máx (auto-corrección)
3. **Valores Extremos**: Usar valores mín y máx completos
4. **Limpieza**: Verificar reset a valores iniciales
5. **Datos Vacíos**: Comportamiento sin billetes
6. **Responsive**: Funcionamiento en diferentes tamaños

### Debugging
```typescript
console.log('Rango precios:', this.precioMinimoSeleccionado, '-', this.precioMaximoSeleccionado);
console.log('Rango calculado:', this.precioMinimo, '-', this.precioMaximo);
```

## 🚀 Próximas Mejoras

1. **Histograma**: Mostrar distribución de precios
2. **Presets**: Botones de rangos comunes (25%, 50%, 75%)
3. **Entrada Manual**: Inputs numéricos adicionales
4. **Memoria**: Recordar último rango usado
5. **Animaciones**: Transiciones más suaves del track

El slider de rango dual proporciona una experiencia mucho más rica y flexible para filtrar billetes por precio, adaptándose automáticamente a los datos disponibles y ofreciendo un control preciso e intuitivo.