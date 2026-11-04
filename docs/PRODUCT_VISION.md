
# Visión del producto — Organizador

## Propósito

Organizador es una herramienta para emprendedores que fabrican o revenden productos.

Su objetivo es facilitar la administración de costos, la preparación de productos para venta y la publicación en tiendas virtuales.

El proyecto actual es un esqueleto inicial. Se debe comprender y preservar lo existente antes de modificarlo.

## Flujo general

1. El usuario configura su tipo de negocio.
2. Carga materiales o productos para reventa, según corresponda.
3. Registra precios unitarios.
4. Carga fotografías de productos terminados hasta 6 fotos por producto.
5. La aplicación ayuda a completar la información.
6. El usuario revisa y confirma los datos.
7. Se calcula el costo base.
8. Se aplica la fórmula comercial aprobada.
9. El usuario revisa y aprueba el precio.
10. La aplicación prepara la publicación para la tienda virtual.
11. El usuario revisa la categoría y los datos.
12. El usuario autoriza la publicación.

## Módulos principales

### Materiales y productos

El catálogo cambia según el modo de negocio.

Fabricante:
materiales e insumos.

Revendedor:
productos terminados comprados para reventa.

### Productos terminados

Permitir:
- Fotografías.
- Nombre.
- Descripción.
- Categoría.
- Costos.
- Precio sugerido.
- Precio final.
- Estado de publicación.

### Asistencia IA

La IA ayuda a identificar productos, proponer descripciones y, en modo fabricante, sugerir materiales y cantidades para calculo de precio.

El usuario conserva el control y confirma los datos.

### Precios

Aplicar la fórmula documentada en PRICING_RULES.md.

Mostrar siempre el desglose.

### Tienda virtual

Permitir:
- Conectar una tienda.
- Consultar categorías.
- Mapear categorías internas.
- Preparar fichas.
- Subir fotografías.
- Carga de productos.
- Publicar con autorización humana.

### Calendario

Permitir planificar:
- Día de carga del producto en la tienda.
- Día de publicación en redes sociales.

Ambas fechas pueden ser iguales o diferentes.

El usuario puede decidir que la carga y la publicacion sean el mismo dia.

### Redes sociales

La automatización de publicaciones queda para una etapa posterior.

## Principios

- No perder funcionalidades existentes.
- No implementar cambios sin aprobación.
- Mostrar cálculos transparentes.
- No inventar datos.
- La IA sugiere; el usuario confirma.
- La seguridad y privacidad son prioritarias.
- Priorizar una primera versión sencilla y útil.
