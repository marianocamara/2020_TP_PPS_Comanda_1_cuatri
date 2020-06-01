import { Component } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { User } from '../models/user';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  user: User;

  constructor(public navCtrl: NavController) {}

  ngOnInit() {
    // this.user = JSON.parse(localStorage.getItem('user-bd'));
    Plugins.Storage.get({ key: 'user-bd' }).then(
      (userData) => {
        this.user = JSON.parse(userData.value);
      }, () => {
        this.navCtrl.navigateBack('login');
      }
    );
  }

}
