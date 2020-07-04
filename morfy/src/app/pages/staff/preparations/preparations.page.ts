import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { IonItemSliding, LoadingController, NavController, AlertController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { User } from 'src/app/models/user';
import { DatabaseService } from 'src/app/services/database.service';
import { AuthService } from 'src/app/services/auth.service';

import { Notification, NotificationMessages } from 'src/app/models/notification';
import { OrderStatus, Order } from 'src/app/models/order';
import { Product, Category } from 'src/app/models/product';


@Component({
  selector: 'app-preparations',
  templateUrl: './preparations.page.html',
  styleUrls: ['./preparations.page.scss'],
})
export class PreparationsPage implements OnInit, OnDestroy {

  private ordersSub: Subscription;
  isLoading = true;
  user: User;
  input;
  orders: Order[];
  foodOrders: Order[];
  drinkOrders: Order[];



  constructor( private loadingCtrl: LoadingController,
               private authService: AuthService,
               public navCtrl: NavController,
               private database: DatabaseService,
               public alertController:AlertController ) { }

  ngOnInit() {
    this.isLoading = true;
    this.ordersSub = this.database.GetAll('orders').subscribe(data => {
      this.foodOrders = (data as Order[])
        .filter(o => o.status === OrderStatus.Confirmed &&
          o.products.filter(p => !p.product.category.includes(Category.Bebida) && !p.isPrepared).length > 0)
        .sort((a, b) => (b.date as any).localeCompare(a.date));

      this.drinkOrders = (data as Order[])
        .filter(o => o.status === OrderStatus.Confirmed &&
          o.products.filter(p => p.product.category.includes(Category.Bebida) && !p.isPrepared).length > 0)
        .sort((a, b) => (b.date as any).localeCompare(a.date));

      // console.log(this.foodOrders);
      // console.log(this.drinkOrders);
      this.isLoading = false;
    });
  }


  ionViewWillEnter() {
    this.isLoading = true;
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
      });
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


  goToProfile() {}


  search() {
    // console.log(this.input);
    // const filter = this.input.toLowerCase();
    // this.filteredOrders = this.orders.filter(e => {
    //   if (e.idClient.toLowerCase().includes(filter) ||
    //       e.id.toLowerCase().includes(filter)) {
    //     return e;
    //   }
    // });
  }


  prepare(item: IonItemSliding, order: Order, itemIndex) {
    item.close();
    this.loadingCtrl.create({ message: 'Preparando...' }).then(loadingEl => {
      loadingEl.present();
      order.products[itemIndex].isPrepared = true;
      if (order.products.filter(p => !p.isPrepared).length === 0) {
          order.status = OrderStatus.Ready;
      }
      this.database.UpdateOne(JSON.parse(JSON.stringify(order)), 'orders')
      .then( (data) => {
        if (order.status === OrderStatus.Ready) {
          this.createNotification();
        }
        loadingEl.dismiss();
      });
    });
  }


  createNotification() {
    const notification = {
      senderType: this.user.type,
      receiverType: 'mozo',
      message: NotificationMessages.Order_Ready,
      date: new Date()
    };
    this.database.CreateOne(notification, 'notifications');
  }


  ngOnDestroy() {
    if (this.ordersSub) {
      this.ordersSub.unsubscribe();
    }
  }

  async presentAlertLogout() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Finalizando sesión',
      message: '¿Estás seguro de querer salir?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: 'Cerrar Sesión',
          handler: () => {
            this.logout();
          }
        }
      ]
    });

    await alert.present();
  }

}
