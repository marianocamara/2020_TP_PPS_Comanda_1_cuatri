import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddModalPage } from './add-modal/add-modal.page';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  products = [
    {
      id: 1,
      imageUrl: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80',
      title: 'Hamburguesa con papas rusticas',
      subtitle: 'Subtitulo de prueba a ver como queda',
      price: 250
    },
    {
      id: 2,
      imageUrl: 'https://images.unsplash.com/photo-1490717064594-3bd2c4081693?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2100&q=80',
      title: 'Pizza',
      subtitle: 'Subtitulo de prueba a ver como queda',
      price: 20
    },
    {
      id: 3,
      imageUrl: 'https://images.unsplash.com/photo-1515041761709-f9fc96e04cd3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80',
      title: 'Tostadas con palta & hummus',
      subtitle: 'Subtitulo de prueba a ver como queda',
      price: 20
    },
    {
      id: 4,
      imageUrl: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80',
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

  public received: any;

  constructor( private modalController: ModalController ) { }

  ngOnInit() {
    this.featured = this.products;
  }


  async openAddModal(selectedProduct) {
    const modal = await this.modalController.create({
      component: AddModalPage,
      cssClass: 'add-product-modal',
      componentProps: {
        product: selectedProduct
      }
    });
    modal.onWillDismiss().then(dataReturned => {
      // trigger when about to close the modal
      this.received = dataReturned.data;
      // console.log('Receive: ', this.received);
    });
    return await modal.present().then(_ => {
      // triggered when opening the modal
      // console.log('Sending: ', selectedProduct);
    });
  }


}
