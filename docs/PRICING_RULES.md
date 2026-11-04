
# Reglas de cálculo de costos y precios

## 1. Fórmula aprobada

La aplicación utilizará esta fórmula:

Si costo_base > 7000:

precio_sugerido = costo_base * 2.30 + 1500

Si costo_base <= 7000:

precio_sugerido = costo_base * 2.30 + 1000

El límite de 7000 se incluye en la segunda condición.

## 2. Ejemplos

| Costo base | Multiplicación | Adicional | Precio sugerido |
|---:|---:|---:|---:|
| 1000 | 2300 | 1000 | 3300 |
| 2000 | 4600 | 1000 | 5600 |
| 5000 | 11500 | 1000 | 12500 |
| 7000 | 16100 | 1000 | 17100 |
| 7001 | 16102.30 | 1500 | 17602.30 |
| 12000 | 27600 | 1500 | 29100 |

## 3. Cómo se obtiene el costo base

### Fabricante

El costo base se calcula sumando:

cantidad_utilizada * precio_unitario_material

Ejemplo:

- 2 metros de tela a $1000 = $2000.
- 3 cierres a $500 = $1500.
- 1 botón a $200 = $200.

Costo base = $3700.

Precio sugerido = 3700 * 2.30 + 1000 = $9510.

### Revendedor

El costo base es el precio de adquisición unitario del producto terminado.

Ejemplo:

Costo de compra = $8000.

Precio sugerido = 8000 * 2.30 + 1500 = $19900.

No calcular materiales ni recetas en este modo.

## 4. Transparencia

La aplicación debe mostrar:
- Costo base.
- Conceptos incluidos en el costo.
- Multiplicador aplicado.
- Adicional fijo aplicado.
- Precio sugerido.
- Precio final elegido por el usuario.

## 5. Configuración

La fórmula indicada es la regla aprobada inicial.

Cualquier posibilidad de modificar el multiplicador, los adicionales o el umbral desde configuraciones debe presentarse como propuesta antes de implementarse.

No convertir los importes en valores editables sin aprobación.

## 6. Precisión

- Utilizar una estrategia consistente para importes monetarios.
- Evitar errores de punto flotante.
- No redondear cada material antes de sumar.
- Definir y documentar el redondeo final.
- Mantener una moneda por cálculo.
- No mezclar monedas sin conversión explícita.

## 7. Restricciones

- No cambiar la fórmula.
- No duplicar la lógica en distintas vistas.
- No aplicar dos veces el multiplicador.
- No agregar costos que ya estén incluidos en el costo base.
- No asumir que el adicional fijo representa un costo contable específico.

La fórmula es una regla comercial de precio sugerido, no necesariamente una fórmula contable de rentabilidad.
