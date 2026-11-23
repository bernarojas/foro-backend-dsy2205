import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

/** Obligatorio de verdad: un texto con puros espacios no cuenta. */
export const obligatorio: ValidatorFn = (control) =>
  String(control.value ?? '').trim().length === 0 ? { obligatorio: true } : null;

/** Largo contando el texto sin los espacios de los extremos. */
export function largo(minimo: number, maximo: number): ValidatorFn {
  return (control) => {
    const texto = String(control.value ?? '').trim();
    if (texto.length === 0) return null; // de eso se encarga `obligatorio`
    if (texto.length < minimo) return { minimo: { requerido: minimo, actual: texto.length } };
    if (texto.length > maximo) return { maximo: { requerido: maximo, actual: texto.length } };
    return null;
  };
}

/** Correo con usuario, arroba y dominio con punto (Validators.email acepta "a@b"). */
export const correo: ValidatorFn = (control) => {
  const texto = String(control.value ?? '').trim();
  if (texto.length === 0) return null;
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(texto) ? null : { correo: true };
};

/** Nombre de persona: letras (con tildes y ñ), espacios, apóstrofo y guion. */
export const nombrePersona: ValidatorFn = (control) => {
  const texto = String(control.value ?? '').trim();
  if (texto.length === 0) return null;
  return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/.test(texto) ? null : { nombrePersona: true };
};

// ------------------------------------------------------------------ Contraseña

/**
 * Requisitos de seguridad de la contraseña. La misma lista alimenta al validador
 * y al componente que muestra cuáles se cumplen mientras se escribe.
 */
export const REQUISITOS_CLAVE: { clave: string; texto: string; cumple: (valor: string) => boolean }[] = [
  { clave: 'claveMinimo', texto: 'Al menos 8 caracteres', cumple: (v) => v.length >= 8 },
  { clave: 'claveMaximo', texto: 'Máximo 20 caracteres', cumple: (v) => v.length > 0 && v.length <= 20 },
  { clave: 'claveMayuscula', texto: 'Una letra mayúscula', cumple: (v) => /[A-ZÁÉÍÓÚÑ]/.test(v) },
  { clave: 'claveMinuscula', texto: 'Una letra minúscula', cumple: (v) => /[a-záéíóúñ]/.test(v) },
  { clave: 'claveNumero', texto: 'Un número', cumple: (v) => /\d/.test(v) },
  { clave: 'claveEspecial', texto: 'Un carácter especial (! @ # $ % & * . _ -)', cumple: (v) => /[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ\s]/.test(v) },
  { clave: 'claveEspacios', texto: 'Sin espacios', cumple: (v) => v.length > 0 && !/\s/.test(v) },
];

/** Contraseña segura: marca como error cada requisito que no se cumple. */
export const claveSegura: ValidatorFn = (control) => {
  const valor = String(control.value ?? '');
  if (valor.length === 0) return null;
  const errores: ValidationErrors = {};
  for (const requisito of REQUISITOS_CLAVE) {
    if (!requisito.cumple(valor)) errores[requisito.clave] = true;
  }
  return Object.keys(errores).length > 0 ? errores : null;
};

/** El campo debe repetir el valor de otro campo del mismo formulario (confirmar contraseña). */
export function igualA(nombreDelOtro: string): ValidatorFn {
  return (control) => {
    const otro = control.parent?.get(nombreDelOtro);
    if (!otro || String(control.value ?? '').length === 0) return null;
    return control.value === otro.value ? null : { noCoincide: true };
  };
}

/** El campo debe ser distinto de otro campo (la contraseña nueva no puede ser la actual). */
export function distintoDe(nombreDelOtro: string): ValidatorFn {
  return (control) => {
    const otro = control.parent?.get(nombreDelOtro);
    if (!otro || String(control.value ?? '').length === 0) return null;
    return control.value !== otro.value ? null : { igualAlAnterior: true };
  };
}

export const debeAceptar = Validators.requiredTrue;

// ------------------------------------------------------------------ Mensajes

/**
 * El mensaje de error de un campo, o null si está bien o si el usuario todavía no lo toca.
 * Todas las pantallas lo usan para mostrar el texto bajo cada campo.
 */
export function mensajeDeError(control: AbstractControl | null | undefined): string | null {
  if (!control || !control.errors || !(control.touched || control.dirty)) return null;
  const e = control.errors;
  if (e['obligatorio'] || e['required']) {
    return control.value === false ? 'Debes aceptar para continuar.' : 'Este campo es obligatorio.';
  }
  if (e['correo']) return 'Escribe un correo válido, por ejemplo nombre@correo.cl.';
  if (e['nombrePersona']) return 'Usa solo letras y espacios.';
  if (e['minimo']) return `Debe tener al menos ${e['minimo'].requerido} caracteres (llevas ${e['minimo'].actual}).`;
  if (e['maximo']) return `No puede superar ${e['maximo'].requerido} caracteres (llevas ${e['maximo'].actual}).`;
  if (e['min']) return 'Elige una opción de la lista.';
  if (e['pattern']) return 'El formato no es válido.';
  const requisito = REQUISITOS_CLAVE.find((r) => e[r.clave]);
  if (requisito) return `La contraseña no cumple: ${requisito.texto.toLowerCase()}.`;
  if (e['noCoincide']) return 'Las contraseñas no coinciden.';
  if (e['igualAlAnterior']) return 'La contraseña nueva debe ser distinta de la actual.';
  return 'El valor no es válido.';
}
