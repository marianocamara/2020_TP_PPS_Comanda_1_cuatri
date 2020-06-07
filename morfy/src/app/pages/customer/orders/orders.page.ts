import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user';
import { LoadingController, NavController, IonItemSliding, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { Plugins } from '@capacitor/core';
import { Order } from 'src/app/models/order';
import { OrderDetailsPage } from './order-details/order-details.page';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit, OnDestroy {

  private ordersSub: Subscription;
  completedOrders: Order[] = [];
  pendingOrder: Order;
  orderDetailAction;
  isLoading = true;
  user: User;
  segment = 'pending';

  constructor( private loadingCtrl: LoadingController,
               private authService: AuthService,
               public navCtrl: NavController,
               private modalController: ModalController,
               private database: DatabaseService
  ) { }


  ngOnInit() {
    this.isLoading = true;
    Plugins.Storage.get({ key: 'user-bd' }).then(
      (userData) => {
        if (userData.value) {
          this.user = JSON.parse(userData.value);
          this.ordersSub = this.database.GetAllUserOrders(this.user.id).subscribe(data => {
            this.pendingOrder = (data as Order[]).find(order => !order.isComplete);
            this.completedOrders = (data as Order[]).filter(order => order.isComplete).sort((a, b) => (b.date as any).localeCompare(a.date));
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


  updateQty(productId: string, action: string) {
    const findedProductIndex = this.pendingOrder.products.findIndex(p => p.product.id === productId);
    if (action === 'add' && this.pendingOrder.products[findedProductIndex].quantity < 10) {
      this.pendingOrder.products[findedProductIndex].quantity++;
    }
    if (action === 'remove' && this.pendingOrder.products[findedProductIndex].quantity >= 2) {
      this.pendingOrder.products[findedProductIndex].quantity--;
    }
    this.database.UpdateOne(JSON.parse(JSON.stringify(this.pendingOrder)), 'orders')
    .then( () => {
      // console.log('Order updated');
    });
  }


  calculateOrderTotal(order: Order) {
    return order ? order.products.reduce((a, b) => a + b.quantity * b.product.price, 0) : 0;
  }


  async checkout() {
    const modal = await this.modalController.create({
      component: OrderDetailsPage,
      // cssClass: 'add-product-modal',
      componentProps: {
        pendingOrder: this.pendingOrder,
      }
    });
    modal.onWillDismiss().then(dataReturned => {
      // trigger when about to close the modal
      this.orderDetailsAction(dataReturned.data);
    });
    return await modal.present().then(_ => {
      // triggered when opening the modal
      // console.log('Sending: ', selectedProduct);
    });
  }


  orderDetailsAction(modalAction) {
    switch (modalAction) {
      case 'pay':
        console.log('paying order...');
        this.database.UpdateSingleField('isComplete', true, 'orders', this.pendingOrder.id)
          .then(() => {
            console.log('Order paid');
          })
          .catch(error => {
            console.log(error);
          });
        break;
      case 'delete':
        console.log('deleting order...');
        this.database.DeleteOne(this.pendingOrder.id, 'orders')
          .then(() => {
            console.log('Order deleted');
          })
          .catch(error => {
            console.log(error);
          });
        break;
      default:
        console.log('closing modal');
        break;
    }
  }


  // confirm(item: IonItemSliding) {
  //   item.close();
  //   this.loadingCtrl.create({ message: 'Confirmando...' }).then(loadingEl => {
  //     loadingEl.present();
  //     setTimeout (() => {
  //       loadingEl.dismiss();
  //    }, 1000);
  //   });
  // }


  ngOnDestroy() {
    if (this.ordersSub) {
      this.ordersSub.unsubscribe();
    }
  }



}
