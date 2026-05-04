# Calculadora de Presupuesto Personal

Aplicación web para gestionar finanzas personales con seguimiento de ingresos, gastos y pagos mensuales.

## Características

### Gestión de Transacciones
- ✅ Agregar ingresos y gastos con descripción, monto y categoría
- ✅ Editar transacciones existentes
- ✅ Eliminar transacciones con confirmación
- ✅ Sistema de checklist para marcar pagos como realizados

### Visualización
- ✅ Gráfico doughnut de gastos por categoría (Chart.js)
- ✅ Tabla de historial con paginación (10 items por página)
- ✅ Resumen de Balance, Ingresos y Gastos
- ✅ Ordenamiento por monto o fecha

### Funcionalidades
- ✅ Modo oscuro / modo claro
- ✅ Múltiples perfiles de usuario (datos aislados)
- ✅ Persistencia de datos en LocalStorage
- ✅ Alertas/toasts modernos
- ✅ Tooltips en botones de acción

### Categorías disponibles
Vivienda, Comida, Transporte, Servicios, Entretenimiento, Salud, Educación, Otros

## Tecnologías

- HTML5 semántico
- Tailwind CSS (via CDN)
- Chart.js (via CDN)
- JavaScript ES6+
- LocalStorage para persistencia

## Cómo usar

1. **Abrir la aplicación**: Simplemente abre `index.html` en tu navegador

2. **Agregar transacciones**:
   - Completa el formulario (descripción, monto, categoría, tipo)
   - Click en "Agregar Transacción"

3. **Gestionar transacciones**:
   - Click en checkbox para marcar como pagado
   - Click en icono de lápiz para editar
   - Click en icono de papelera para eliminar (con confirmación)

4. **Cambiar perfil**:
   - Click en el nombre del perfil en el header
   - Selecciona otro perfil o crea uno nuevo

5. **Ordenar tabla**:
   - Usa el dropdown para ordenar por monto o fecha

## Estructura de archivos

```
calculadora-presupuesto-personal/
├── index.html    # Estructura y estilos
├── app.js        # Lógica de la aplicación
├── SPEC.md       # Especificaciones del proyecto
└── README.md     # Este archivo
```

## Formato de moneda

- Peso colombiano (COP)
- Separador de miles: punto (.)
- Sin decimales

## Notas

- Los datos se guardan automáticamente en el navegador
- Cada perfil tiene sus propios datos aislados
- El tema (claro/oscuro) es global para todos los perfiles