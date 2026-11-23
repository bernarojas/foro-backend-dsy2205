import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Normas del foro: lo que el equipo de moderación usa para decidir qué se banea. */
@Component({
  selector: 'app-normas',
  imports: [RouterLink],
  templateUrl: './normas.html',
})
export class Normas {
  protected readonly normas = [
    {
      titulo: 'Respeto entre usuarios',
      texto: 'Se discuten las ideas, no las personas. Los insultos, las burlas y cualquier forma de discriminación se retiran.',
    },
    {
      titulo: 'Nada de spam ni engaños',
      texto: 'No se permite publicidad no solicitada, enlaces engañosos ni pedir claves o datos personales a otros usuarios.',
    },
    {
      titulo: 'Publica en la categoría correcta',
      texto: 'Antes de abrir un tema busca si ya existe, y elige la categoría que corresponde: así es más fácil encontrarlo.',
    },
    {
      titulo: 'Títulos claros',
      texto: 'Un buen título resume la pregunta o el tema. Evita escribir todo en mayúsculas o usar títulos como "Ayuda".',
    },
    {
      titulo: 'Cuida la información privada',
      texto: 'No publiques teléfonos, direcciones, documentos ni datos de terceros.',
    },
    {
      titulo: 'Contenido legal y apto para todos',
      texto: 'No se acepta contenido ilegal, violento o para adultos, ni enlaces a descargas no autorizadas.',
    },
  ];
}
