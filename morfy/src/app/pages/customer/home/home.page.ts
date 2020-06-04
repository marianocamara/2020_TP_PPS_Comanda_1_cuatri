import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';
import { Plugins } from '@capacitor/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  user: User;

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

  constructor( public navCtrl: NavController,
    private authService: AuthService) { }

  ngOnInit() {
    this.featured = this.products;
  }

  ionViewWillEnter() {
    Plugins.Storage.get({ key: 'user-bd' }).then(
      (userData) => {
        if (userData.value) {
          this.user = JSON.parse(userData.value);
        }
        else {
          this.logout();
        }
      }, () => {
        this.logout();
      }
    );
  }

  logout() {
    this.authService.logoutUser()
    .then(res => {
      // console.log(res);
      this.navCtrl.navigateBack('');
    })
    .catch(error => {
      console.log(error);
    });
  }


}
