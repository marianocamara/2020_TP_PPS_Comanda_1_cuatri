import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  products = [
    {
      imgUrl: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80',
      title: 'Hamburguesa con papas rusticas',
      subtitle: 'Subtitulo de prueba a ver como queda',
      price: 250
    },
    {
      imgUrl: 'https://images.unsplash.com/photo-1490717064594-3bd2c4081693?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2100&q=80',
      title: 'Pizza',
      subtitle: 'Subtitulo de prueba a ver como queda',
      price: 20
    },
    {
      imgUrl: 'https://images.unsplash.com/photo-1515041761709-f9fc96e04cd3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80',
      title: 'Tostadas con palta & hummus',
      subtitle: 'Subtitulo de prueba a ver como queda',
      price: 20
    },
    {
      imgUrl: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80',
      title: 'Creppe',
      subtitle: 'Subtitulo de prueba a ver como queda',
      price: 20
    },
  ];

  featured = [];

  types = [
    'principal', '/',
    'postres', '/',
    'desayuno', '/',
    'pastas', '/',
    'sandwiches', '/',
    'acompañamientos', '/',
    'pizzas'
  ];

  constructor() { }

  ngOnInit() {
    this.featured = this.products;
  }

}
