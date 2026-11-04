
# Modos de negocio

## 1. Objetivo

Organizador debe adaptarse a dos perfiles:

1. Fabricante.
2. Revendedor.

La aplicación debe evitar formularios y funcionalidades innecesarias para cada perfil.

## 2. Modo fabricante

### Catálogo de materiales

El usuario administra los materiales que utiliza para fabricar productos.

Cada material puede contener:
- Nombre.
- Descripción.
- Categoría.
- Unidad de medida.
- Precio de compra.
- Cantidad comprada.
- Precio unitario normalizado.
- Stock disponible.
- Fecha de actualización del precio.
- Estado activo/inactivo.

Los unicos items obligatorios son Nombre, precio de compra y Fecha de actualizacion del precio.

Fecha de actualizacion del precio se debe colocar automaticamente, cuando se ingresa por primera vez y cada vez que se actualice el precio.

El usuario puede agregar, editar o desactivar materiales.

No eliminar materiales utilizados en productos históricos sin una estrategia aprobada.

### Carga de producto fabricado

El usuario carga una o varias fotografías.

El sistema puede sugerir:
- Nombre.
- Descripción.
- Categoría.
- Materiales probablemente utilizados.
- Cantidades estimadas.

La sección debe identificar claramente estas sugerencias como pendientes de confirmación.

El usuario debe poder:
- Confirmar un material.
- Rechazarlo.
- Cambiarlo.
- Corregir la cantidad.
- Agregar materiales que la IA no detectó.
- Eliminar materiales que no utilizó.

Solo los materiales confirmados se consideran parte del costo del producto.

### Cálculo

Para cada material:

subtotal = cantidad_utilizada * precio_unitario

Costo base = suma de subtotales confirmados.

La disponibilidad de stock no determina la cantidad utilizada.

La cantidad utilizada puede ser menor que el stock disponible.

Si no esta cargada la cantidad que hay en el stock no influye en el calculo

El descuento de stock, si se implementa, debe ser una operación independiente y requerir una definición aprobada.

## 3. Modo revendedor

### Catálogo de productos para reventa

El usuario registra productos terminados que compra a proveedores.

Cada producto puede contener:
- Nombre.
- Descripción.
- Categoría.
- Precio de adquisición unitario.
- Stock disponible.
- Proveedor opcional.
- Fecha de compra o actualización del costo.
- Fotografías.

No solicitar materiales, recetas ni cantidades de fabricación.

### Cálculo

Costo base = precio de adquisición unitario.

Aplicar la fórmula de precios aprobada.

## 4. Diferencias de interfaz

Fabricante:
- Mostrar catálogo de materiales.
- Mostrar materiales utilizados.
- Mostrar cantidades.
- Mostrar costo por material.
- Mostrar costo total de fabricación.

Revendedor:
- Mostrar catálogo de productos.
- Mostrar precio de adquisición.
- Mostrar stock.
- No mostrar materiales utilizados ni recetas.

## 5. Inteligencia artificial

Fabricante:
La IA propone materiales y cantidades. El usuario confirma.

Revendedor:
La IA puede asistir con reconocimiento, descripción y clasificación del producto. No debe solicitar ni estimar materiales de fabricación.

## 6. Selección del modo

El modo debe seleccionarse durante la configuración inicial de la cuenta.

No inferir el modo a partir de las fotografías ni del contenido del catálogo.

Un cambio de modo requiere:
- Explicar qué datos se conservarán.
- Explicar qué funcionalidades cambiarán.
- Presentar un plan de transición.
- Obtener aprobación del usuario.

## 7. Evolución futura

Se puede evaluar en el futuro un tercer perfil híbrido que permita fabricar algunos productos y revender otros.

No implementarlo sin aprobación.
