// Validaciones para formularios de negocio y precios.
//
// Esta es una capa básica de validación del frontend. No sustituye
// las reglas de seguridad de Firebase.

export const validatePriceAmount = (value, fieldName = 'importe') => {
  const isBlank =
    value === null ||
    value === undefined ||
    value === '';

  if (isBlank) {
    return `El ${fieldName} es obligatorio.`;
  }

  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return `El ${fieldName} debe ser un número válido.`;
  }

  if (numeric < 0) {
    return `El ${fieldName} no puede ser negativo.`;
  }

  return null;
};

