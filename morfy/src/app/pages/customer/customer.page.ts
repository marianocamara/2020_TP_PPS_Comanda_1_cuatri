import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Plugins } from '@capacitor/core';
import { NavController } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { DatabaseService } from 'src/app/services/database.service';


@Component({
  selector: 'app-customer',
  templateUrl: './customer.page.html',
  styleUrls: ['./customer.page.scss'],
})
export class CustomerPage implements OnInit {

  user: User; // = { imageUrl: 'assets/img/team-4-800x800.jpg'};
  isLoading = true;
  orderPlaced = false;

  constructor( public navCtrl: NavController,
               private authService: AuthService,
               private database: DatabaseService ) { }

  ngOnInit() {
    this.database.getObservable().subscribe((data) => {
      console.log('Data received', data);
      this.orderPlaced = true;
    });
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
