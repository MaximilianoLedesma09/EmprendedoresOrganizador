
# Modelo conceptual de datos

Este documento describe entidades conceptuales. No representa todavía el esquema real de Firebase ni autoriza migraciones.

## 1. Cuenta y configuración

### BusinessProfile

- id
- ownerUserId
- businessName
- businessMode: manufacturer | reseller
- currency
- createdAt
- updatedAt

El modo de negocio debe ser explícito.

## 2. Materiales — fabricante

### Material

- id
- businessId
- name
- description
- category
- purchaseUnit
- purchaseQuantity
- purchasePrice
- consumptionUnit
- unitPrice
- availableStock
- active
- updatedAt

El precio unitario debe estar normalizado a la unidad de consumo.

Ejemplo:

Compra:
- 1 rollo.
- 20 metros.
- Precio total: $10.000.

Resultado:
- Precio unitario: $500 por metro.

Las conversiones deben ser explícitas y validadas.

## 3. Productos para reventa

### ResaleProduct

- id
- businessId
- name
- description
- category
- acquisitionUnitPrice
- availableStock
- supplier
- active
- updatedAt

No contiene receta ni materiales de fabricación.

## 4. Producto terminado

### FinishedProduct

- id
- businessId
- name
- description
- images
- category
- costBase
- suggestedPrice
- finalPrice
- status
- createdAt
- updatedAt

## 5. Materiales utilizados

### ProductMaterial

- id
- finishedProductId
- materialId
- materialNameSnapshot
- quantityUsed
- consumptionUnit
- unitPriceSnapshot
- subtotal
- confirmationStatus

La información histórica debe conservar el nombre, unidad y precio utilizados al calcular el producto.

Las categorisa obligatoria deben ser las mismas que las especificadas en BUSINESS_MODES.md, ademas de los id.

Un cambio futuro del precio de un material no debe modificar silenciosamente el costo histórico de un producto ya calculado.

## 6. Costos y precios

### PriceCalculation

- id
- finishedProductId
- businessMode
- costBase
- multiplier
- fixedAddition
- threshold
- suggestedPrice
- currency
- calculatedAt

La fórmula inicial:
- multiplier = 2.30
- threshold = 7000
- fixedAddition = 1000 o 1500 según corresponda.

## 7. Imágenes y sugerencias IA

### ProductAnalysis

- id
- finishedProductId
- provider
- status
- suggestions
- createdAt

Las sugerencias deben distinguirse de los datos confirmados por el usuario.

No guardar automáticamente sugerencias como materiales utilizados.

## 8. Reglas importantes

- Todas las entidades deben pertenecer a una cuenta/negocio.
- No permitir acceso cruzado entre negocios.
- No usar el identificador del usuario enviado por el frontend como única validación de autorización.
- Mantener historial de precios cuando sea necesario.
- Evitar eliminar datos referenciados por productos existentes.
- El esquema definitivo depende de la auditoría y requiere aprobación.
