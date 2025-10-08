# 🔧 TROUBLESHOOTING - ERROR 422 Y NG0100

**Fecha:** 8 de octubre de 2025  
**Estado:** ✅ NG0100 SOLUCIONADO - 🔍 ERROR 422 EN DIAGNÓSTICO

---

## ✅ **PROBLEMA 1 SOLUCIONADO: Error NG0100**

### **Causa Identificada:**
El getter `billeteId()` generaba un nuevo timestamp cada vez que se invocaba:
```typescript
get billeteId(): string {
  return this.billeteSeleccionado?.id?.toString() || `temp-${Date.now()}`; // ❌ Date.now() cambia constantemente
}
```

### **Solución Implementada:**
```typescript
// ✅ ID temporal estable que se mantiene durante toda la sesión del modal
private _billeteId: string | null = null;

get billeteId(): string {
  if (this.billeteSeleccionado?.id) {
    return this.billeteSeleccionado.id.toString();
  }
  
  // Para billetes nuevos, mantener el mismo ID temporal durante toda la sesión
  if (!this._billeteId) {
    this._billeteId = `temp-${Date.now()}`;
  }
  return this._billeteId;
}
```

### **Resets Agregados:**
- Al abrir modal para nuevo billete: `this._billeteId = null`
- Al cerrar modal: `this._billeteId = null`

---

## 🔍 **PROBLEMA 2 EN DIAGNÓSTICO: Error 422**

### **Información del Error:**
```
INFO: 186.82.102.45:0 - "POST /billetes/ HTTP/1.1" 422 Unprocessable Entity
```

### **Debugging Implementado:**

#### **1. Logging de Datos Enviados:**
```typescript
console.log('💾 Guardando billete:', { 
  modoEdicion: this.modoEdicion, 
  formData,
  descripcion_general: formData.descripcion_general 
});

console.log('📋 Validación de campos requeridos:', {
  pais: formData.pais,
  denominacion: formData.denominacion,
  precio: formData.precio,
  tieneRequeridos: !!(formData.pais && formData.denominacion && formData.precio)
});
```

#### **2. Manejo Mejorado de Errores 422:**
```typescript
if (error.status === 422) {
  errorMessage += 'Datos de validación incorrectos. ';
  if (error.error?.detail) {
    if (Array.isArray(error.error.detail)) {
      const validationErrors = error.error.detail.map((err: any) => 
        `${err.loc?.join('.')||'campo'}: ${err.msg}`
      ).join(', ');
      errorMessage += validationErrors;
    }
  }
}
```

---

## 📋 **CAMPOS REQUERIDOS SEGÚN API**

Según `API_MASTER_REFERENCE.md`, los campos requeridos para POST `/billetes/` son:

### **✅ Obligatorios:**
- `pais` (int) - ID del país
- `denominacion` (string, 1-100 chars) - Denominación del billete
- `precio` (string, 1-50 chars) - Precio del billete

### **📝 Opcionales:**
- `banco_emisor` (string, máx 255 chars)
- `medidas` (string, máx 50 chars)
- `descripcion_anverso` (text)
- `descripcion_reverso` (text)
- `descripcion_general` (text) **← NUEVO CAMPO**
- `url_anverso` (string)
- `url_reverso` (string)
- `pick` (string, máx 50 chars)
- `estado` (enum: "Excelente", "Bueno", "Regular", "Malo")
- `vendido` (boolean)
- `destacado` (boolean)
- `caracteristicas_ids` (array de integers)

---

## 🚨 **POSIBLES CAUSAS DEL ERROR 422**

### **1. Campos Requeridos Vacíos:**
- `pais`: Debe ser un número entero válido
- `denominacion`: No puede estar vacío, máx 100 caracteres
- `precio`: No puede estar vacío, máx 50 caracteres

### **2. Tipos de Datos Incorrectos:**
- `pais`: Debe ser `number`, no `string`
- `vendido`: Debe ser `boolean`
- `destacado`: Debe ser `boolean`
- `caracteristicas_ids`: Debe ser array de números

### **3. Valores Enum Inválidos:**
- `estado`: Solo acepta "Excelente", "Bueno", "Regular", "Malo"

### **4. Longitud de Campos Excedida:**
- `denominacion`: Máx 100 chars
- `precio`: Máx 50 chars
- `banco_emisor`: Máx 255 chars
- `medidas`: Máx 50 chars
- `pick`: Máx 50 chars

---

## 🔍 **PASOS DE DEBUGGING**

### **Para el Usuario:**
1. **Abrir la aplicación** y navegar a gestión de billetes
2. **Hacer login** como administrador
3. **Intentar registrar un billete** con datos mínimos:
   - País: Seleccionar uno válido
   - Denominación: Texto corto (ej: "1000 Pesos")
   - Precio: Número como texto (ej: "50000")
4. **Revisar la consola del navegador** (F12) para ver:
   - Los logs de `💾 Guardando billete:`
   - Los logs de `📋 Validación de campos requeridos:`
   - Los logs de `❌ Error al guardar billete:` y `📊 Detalles del error:`

### **Información a Recopilar:**
- ¿Qué datos exactos se están enviando?
- ¿Cuál es el mensaje de error específico de la API?
- ¿Hay algún campo que no se esté validando correctamente?

---

## 🛠️ **VERIFICACIONES ADICIONALES**

### **1. Validación de Tipos:**
Verificar que el formulario esté enviando los tipos correctos:
```typescript
// El país debe ser number, no string
pais: +formData.pais  // Convertir a número

// Los booleans deben ser boolean, no string
vendido: !!formData.vendido
destacado: !!formData.destacado
```

### **2. Validación de Arrays:**
```typescript
// Las características deben ser array de números
caracteristicas_ids: Array.isArray(formData.caracteristicas_ids) 
  ? formData.caracteristicas_ids 
  : []
```

---

## ✅ **RESULTADO ACTUAL**

- ✅ **Error NG0100 solucionado** - ID temporal estable implementado
- ✅ **Logging mejorado** - Debugging detallado para error 422
- ✅ **Compilación exitosa** - Sin errores TypeScript
- 🔍 **Error 422 pendiente** - Requiere prueba del usuario para diagnóstico específico

---

## ✅ **PROBLEMA SOLUCIONADO - ACTUALIZADO API v1.5.0**

**Cambio en API:** Backend actualizado a v1.5.0 con nueva escala de estados
- **✅ API v1.5.0 requiere:** `['Regular', 'Aceptable', 'Bueno', 'Muy bueno', 'Excelente']`
- **✅ Frontend actualizado:** Coincide perfectamente con la nueva API

**Correcciones aplicadas:**
1. ✅ Campo `descripcion_general` implementado
2. ✅ Estados actualizados según API v1.5.0
3. ✅ Interface `Billete` corregida
4. ✅ Array `estadosDisponibles` actualizado

**Estado:** ✅ COMPLETAMENTE RESUELTO - Frontend sincronizado con API v1.5.0