# 🔍 Lista de Verificación - Flujo de Autenticación

## ✅ **Checklist para probar el sistema:**

### 1. **🌐 URLs a probar:**
- `http://localhost:4200/auth/login` → Página de login
- `http://localhost:4200/admin` → Debe redirigir al login si no está autenticado
- `http://localhost:4200/admin/dashboard` → Acceso directo (debe redirigir si no está logueado)

### 2. **🔐 Credenciales de prueba:**
- **Email:** `admin@numismatica.com`
- **Contraseña:** `admin123`

### 3. **📋 Pasos del flujo de prueba:**

#### **Paso 1: Acceso sin autenticación**
1. Ve a `http://localhost:4200/admin`
2. ✅ **Esperado:** Debe redirigir automáticamente a `/auth/login`

#### **Paso 2: Login con credenciales incorrectas**
1. En login, ingresa email incorrecto: `test@test.com`
2. Contraseña: `123456`
3. ✅ **Esperado:** Mostrar error "Credenciales incorrectas"

#### **Paso 3: Login exitoso**
1. Email: `admin@numismatica.com`
2. Contraseña: `admin123`
3. ✅ **Esperado:** Redirigir a `/admin/dashboard`

#### **Paso 4: Verificar persistencia de sesión**
1. Refresca la página en `/admin/dashboard`
2. ✅ **Esperado:** Debe mantener la sesión (no redirigir al login)

#### **Paso 5: Navegación dentro del admin**
1. Ve a `/admin/registrar-paises`
2. ✅ **Esperado:** Debe cargar sin problemas (usuario ya autenticado)

### 4. **🔧 Debug - Qué revisar en Developer Tools:**

#### **Console Logs esperados:**
```
🔐 Intentando login con: { email: "admin@numismatica.com", apiUrl: "..." }
✅ Respuesta del login: { success: true, token: "...", user: {...} }
🛡️ AuthGuard verificando acceso a: /admin/dashboard
✅ Usuario autenticado, acceso permitido
```

#### **Network Tab - Requests esperados:**
```
POST https://fastapi-railway-ihky.onrender.com/auth/login/
Status: 200 OK
Response: { "success": true, "token": "jwt...", "user": {...} }
```

#### **Application/Storage Tab:**
- **localStorage:** Debe contener `numismatica_token` y `numismatica_user`
- **sessionStorage:** Vacío (si no marcaste "Recordarme")

### 5. **🚨 Problemas comunes y soluciones:**

#### **Error CORS:**
```
Access to XMLHttpRequest at '...' from origin 'http://localhost:4200' has been blocked by CORS policy
```
**Solución:** Verificar configuración CORS en FastAPI backend

#### **Error 404 - Endpoint no encontrado:**
```
POST http://...auth/login/ 404 (Not Found)
```
**Solución:** Verificar que el endpoint esté implementado en el backend

#### **Error 401 - Unauthorized:**
```
POST http://...auth/login/ 401 (Unauthorized)
```
**Solución:** Verificar credenciales o hash de contraseña en BD

#### **Token no incluido en requests:**
**Síntoma:** Requests a endpoints protegidos fallan con 401
**Solución:** Verificar que AuthInterceptor esté configurado correctamente

### 6. **🔄 Comandos útiles para debug:**

#### **Ver estado de autenticación en Console:**
```javascript
// En Developer Console del navegador
localStorage.getItem('numismatica_token');
localStorage.getItem('numismatica_user');
```

#### **Forzar logout:**
```javascript
localStorage.clear();
sessionStorage.clear();
window.location.href = '/auth/login';
```

### 7. **📊 Endpoints del backend que deben existir:**

#### **Requeridos para funcionar:**
- ✅ `POST /auth/login/` → Login básico
- 🔄 `POST /auth/logout/` → Logout (opcional pero recomendado)
- 🔄 `POST /auth/forgot-password/` → Recuperar contraseña

#### **Headers esperados en responses:**
```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}
```

---

## 🎯 **¿Todo listo para probar?**

1. **Asegúrate de que el servidor Angular esté corriendo:** `ng serve`
2. **Verifica que el backend esté disponible:** Abre `https://fastapi-railway-ihky.onrender.com/` en el navegador
3. **Sigue los pasos de prueba** listados arriba
4. **Revisa los logs** en Developer Console para debug

¡Ahora puedes probar el flujo completo de autenticación! 🚀