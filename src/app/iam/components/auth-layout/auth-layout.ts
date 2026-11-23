import { Component } from '@angular/core';
import { Icon } from '../../../shared/components/icon/icon';

/** Tarjeta partida de las pantallas públicas: panel de marca a la izquierda, formulario a la derecha. */
@Component({
  selector: 'app-auth-layout',
  imports: [Icon],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {}
