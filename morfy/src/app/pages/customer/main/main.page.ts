import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Plugins } from '@capacitor/core';
import { NavController } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { DatabaseService } from 'src/app/services/database.service';
import { Order, OrderStatus } from 'src/app/models/order';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  user: User; // = { imageUrl: 'assets/img/team-4-800x800.jpg'};
  isLoading = true;
  orderPlaced = false;
  private ordersSub: Subscription;
  pendingOrder: Order;
  orderTotal;

  constructor( public navCtrl: NavController,
               private authService: AuthService,
               private database: DatabaseService ) { }

  ngOnInit() {
    Plugins.Storage.get({ key: 'user-bd' }).then(
      (userData) => {
        if (userData.value) {
          this.user = JSON.parse(userData.value);
          this.ordersSub = this.database.GetWithQuery('idClient', '==', this.user.id, 'orders')
            .subscribe(data => {
              this.pendingOrder = (data as Order[]).find(order => order.status === OrderStatus.Pending);
              this.orderTotal = this.calculateOrderTotal(this.pendingOrder);
              this.isLoading = false;
          });
        }
        else {
          this.logout();
        }
      }, () => {
        this.logout();
      }
    );
  }


  ionViewWillEnter() {
    Plugins.Storage.get({ key: 'user-bd' }).then(
      (userData) => {
        if (userData.value) {
          this.user = JSON.parse(userData.value);
        }
        else {
          this.user = null;
          this.logout();
        }
      }, () => {
        this.logout();
      }
    );
  }


  calculateOrderTotal(order: Order) {
    return order ? order.products.reduce((a, b) => a + b.quantity * b.product.price, 0) : 0;
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

  ngOnDestroy() {
    if (this.ordersSub) {
      this.ordersSub.unsubscribe();
    }
  }
}
