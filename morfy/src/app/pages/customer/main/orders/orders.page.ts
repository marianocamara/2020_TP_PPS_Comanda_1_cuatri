import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user';
import { LoadingController, NavController, IonItemSliding, ModalController, AnimationController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { Plugins } from '@capacitor/core';
import { Order, OrderStatus } from 'src/app/models/order';
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
  animation;

  constructor( private loadingCtrl: LoadingController,
               private authService: AuthService,
               public navCtrl: NavController,
               private modalController: ModalController,
               private database: DatabaseService,
               private animationCtrl: AnimationController
  ) { }


  ngOnInit() {
    this.isLoading = true;
    Plugins.Storage.get({ key: 'user-bd' }).then(
      (userData) => {
        if (userData.value) {
          this.user = JSON.parse(userData.value);
          this.ordersSub = this.database.GetWithQuery('idClient', '==', this.user.id, 'orders')
            .subscribe(data => {
              this.pendingOrder = (data as Order[]).find(order => order.status === OrderStatus.Pending);
              this.completedOrders = (data as Order[]).filter(order => order.status === OrderStatus.Finished)
                .sort((a, b) => (b.date as any).localeCompare(a.date));
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


  updateQty(productId: string, event, action: string) {
    const row = event.target.parentNode.parentNode.parentNode;
    const findedProductIndex = this.pendingOrder.products.findIndex(p => p.product.id === productId);
    if (action === 'add' && this.pendingOrder.products[findedProductIndex].quantity < 10) {
      this.pendingOrder.products[findedProductIndex].quantity++;
    }
    if (action === 'remove' && this.pendingOrder.products[findedProductIndex].quantity >= 1) {
      this.pendingOrder.products[findedProductIndex].quantity--;
    }
    if (this.pendingOrder.products[findedProductIndex].quantity < 1) {
      this.animation = this.animationCtrl.create()
      .addElement(row)
      .duration(500)
      .iterations(1)
      .keyframes([
        { offset: 0, transform: 'scale(1)', opacity: '1' },
        { offset: 0.5, transform: 'translateX(-50px)', opacity: '0.5' },
        { offset: 1, transform: 'translateX(-100px)', opacity: '0' }
      ])
      .onFinish(() => {
        this.pendingOrder.products.splice(findedProductIndex, 1);

        if (this.pendingOrder.products.length < 1) {
          this.database.DeleteOne(this.pendingOrder.id, 'orders')
          .then(() => {
            console.log('Order deleted');
          })
          .catch(error => {
            console.log(error);
          });
        }
        else {
          this.database.UpdateOne(JSON.parse(JSON.stringify(this.pendingOrder)), 'orders')
          .then( () => {
            // console.log('Order updated');
          });
        }
      });
      this.animation.play();
    }
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
        this.database.UpdateSingleField('status', OrderStatus.Finished, 'orders', this.pendingOrder.id)
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


  ngOnDestroy() {
    if (this.ordersSub) {
      this.ordersSub.unsubscribe();
    }
  }



}
