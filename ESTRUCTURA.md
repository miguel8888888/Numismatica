# 📁 Estructura del Proyecto Numismática

## 🎯 **Organización por Layouts**

Este proyecto ha sido reorganizado para separar claramente las funcionalidades **públicas** de las **administrativas**, proporcionando una mejor experiencia de usuario y mantenimiento del código.

---

## 🏗️ **Estructura de Directorios**

```
src/app/
├── layouts/                    # Layouts principales
│   ├── landing/               # Layout público (informativo)
│   └── admin/                 # Layout administrativo
│
├── views/                     # Vistas organizadas por tipo
│   ├── public/               # Vistas públicas (informativas)
│   │   ├── inicio/           # Página principal
│   │   ├── paises/           # Catálogo público de países
│   │   ├── billetes/         # Catálogo público de billetes
│   │   └── nosotros/         # Información de la empresa
│   │
│   └── admin/                # Vistas administrativas
│       ├── dashboard/        # Panel de control principal
│       └── registrar-paises/ # Formulario de registro de países
│
├── components/               # Componentes reutilizables
│   ├── header/
│   ├── footer/
│   ├── card/
│   ├── buttons/
│   ├── image/
│   └── whatsapp-button/
│
└── services/                 # Servicios compartidos
    └── registros.service.ts
```

---

## 🌐 **Sistema de Rutas**

### **Rutas Públicas (Layout Landing)**
- `/` → Inicio (página principal)
- `/inicio` → Página de inicio
- `/paises` → Catálogo público de países
- `/billetes` → Catálogo público de billetes
- `/nosotros` → Información de la empresa

### **Rutas Administrativas (Layout Admin)**
- `/admin` → Redirige a dashboard
- `/admin/dashboard` → Panel de control principal
- `/admin/registrar-paises` → Formulario de registro de países

---

## 🎨 **Características de cada Layout**

### **Landing Layout (Público)**
✅ **Características:**
- Navegación simple e intuitiva
- Enfoque en mostrar información
- Acceso público sin restricciones
- Diseño orientado al usuario final
- Botón de WhatsApp flotante
- Header y footer informativos

✅ **Componentes incluidos:**
- Header con navegación
- Footer con información de contacto
- WhatsApp button (flotante)

### **Admin Layout (Administrativo)**
✅ **Características:**
- Sidebar navigation colapsible
- Dashboard con estadísticas
- Panel de control administrativo
- Formularios de gestión
- Accesos rápidos a funciones CRUD
- Diseño orientado a la productividad

✅ **Componentes incluidos:**
- Sidebar con menú administrativo
- Top bar con breadcrumbs
- User profile dropdown
- Notification system
- Quick actions panel

---

## 🔧 **Funcionalidades por Área**

### **Área Pública (Landing)**

| Componente | Descripción | Funcionalidades |
|------------|-------------|-----------------|
| **Inicio** | Página principal | Bienvenida, resumen de servicios |
| **Países** | Catálogo público | Vista de países, filtros por continente, búsqueda |
| **Billetes** | Catálogo de billetes | Galería de billetes, categorías, información detallada |
| **Nosotros** | Información corporativa | Historia, contacto, servicios |

### **Área Administrativa (Admin)**

| Componente | Descripción | Funcionalidades |
|------------|-------------|-----------------|
| **Dashboard** | Panel principal | Estadísticas, gráficos, actividad reciente, acciones rápidas |
| **Registrar Países** | Gestión de países | Formulario completo, validaciones, preview de banderas |
| **[Futuro] Billetes** | Gestión de billetes | CRUD completo de billetes, imágenes, precios |
| **[Futuro] Usuarios** | Gestión de usuarios | Administración de accesos, roles, permisos |
| **[Futuro] Reportes** | Reportes y analytics | Estadísticas avanzadas, exportación de datos |

---

## 🚀 **Navegación entre Layouts**

### **Desde Público a Admin:**
- Botón "Admin" en el menú principal (header)
- Redirige a `/admin/dashboard`

### **Desde Admin a Público:**
- Botón "Ver Público" en la top bar
- Redirige a `/` (página principal)

### **Navegación interna Admin:**
- Sidebar colapsible con todas las secciones
- Breadcrumbs en la top bar
- Acciones rápidas en el dashboard

---

## 📱 **Responsive Design**

### **Landing Layout:**
- Mobile-first approach
- Menú hamburguesa en móviles
- Grids adaptativas para catálogos
- Botón WhatsApp responsive

### **Admin Layout:**
- Sidebar colapsible en tablets/móviles
- Dashboard adaptativo
- Formularios stack en móviles
- Top bar responsive

---

## 🎯 **Próximas Funcionalidades**

### **Admin Panel:**
- [ ] Gestión completa de billetes
- [ ] Sistema de usuarios y roles
- [ ] Módulo de reportes avanzados
- [ ] Configuración global del sistema
- [ ] Backup y restauración
- [ ] Logs de actividad

### **Público:**
- [ ] Búsqueda avanzada de billetes
- [ ] Comparador de precios
- [ ] Wishlist de usuarios
- [ ] Sistema de valoraciones
- [ ] Blog numismático
- [ ] Newsletter

---

## 🔐 **Consideraciones de Seguridad**

- **Rutas administrativas:** Implementar guards de autenticación
- **Roles y permisos:** Sistema de autorización por módulos
- **Validación:** Tanto frontend como backend
- **Auditoría:** Logs de todas las acciones administrativas

---

## 🛠️ **Comandos de Desarrollo**

```bash
# Iniciar servidor de desarrollo
ng serve

# Acceder al área pública
http://localhost:4200/

# Acceder al área administrativa
http://localhost:4200/admin

# Generar nuevos componentes para admin
ng generate component views/admin/nombre-componente

# Generar nuevos componentes para público
ng generate component views/public/nombre-componente
```

---

## 📈 **Beneficios de esta Estructura**

✅ **Organización clara:** Separación de responsabilidades
✅ **Escalabilidad:** Fácil agregar nuevas funcionalidades
✅ **Mantenimiento:** Código más limpio y organizado
✅ **UX mejorada:** Experiencias específicas por tipo de usuario
✅ **Performance:** Lazy loading por áreas
✅ **Seguridad:** Posibilidad de implementar guards específicos

---

*Estructura creada el 29 de septiembre de 2025*
*Proyecto Numismática - Sistema de gestión numismática profesional*