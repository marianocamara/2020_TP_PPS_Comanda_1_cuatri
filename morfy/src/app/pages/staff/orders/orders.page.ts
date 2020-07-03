import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { IonItemSliding, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { User, Status } from 'src/app/models/user';
import { DatabaseService } from 'src/app/services/database.service';
import { AuthService } from 'src/app/services/auth.service';

import { Notification, NotificationMessages } from 'src/app/models/notification';
import { OrderStatus, Order } from 'src/app/models/order';
import { Category } from 'src/app/models/product';


@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit, OnDestroy {

  private ordersSub: Subscription;
  isLoading = true;
  user: User;
  input;
  orders: Order[];
  ordersAwaitingAction: Order[];
  ordersOnHold: Order[];
  finishedOrders: Order[];
  segment = 'actions';

  status = {
    Todos: 'todos',
    Pendientes: 'submitted',
    Confimados: 'confirmed',
    Listos: 'ready',
    Entregados: 'delivered',
    Recibidos: 'received',
    Pagados: 'paid',
    Terminados: 'finished'
  };
  public keepOriginalOrder = (a, b) => a.key;

  constructor( private loadingCtrl: LoadingController,
               private authService: AuthService,
               public navCtrl: NavController,
               private database: DatabaseService,
               public toastController: ToastController ) { }

  ngOnInit() {
    this.isLoading = true;
    this.ordersSub = this.database.GetAll('orders').subscribe(data => {
      this.orders = (data as Order[]).filter(e => e.status !== OrderStatus.Pending)
        .sort((a, b) => (b.date as any).localeCompare(a.date));
      this.filterOrders(this.orders);
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


  filterOrders(allOrders: Order[]) {
    const order = { submitted: 1, confirmed: 2, ready: 3, delivered: 4, received: 5, paid: 6, finished: 7 };

    this.ordersAwaitingAction = allOrders
    .filter(e => e.status === OrderStatus.Submitted || e.status === OrderStatus.Ready || e.status === OrderStatus.Paid)
    .sort((a, b) => order[a.status] - order[b.status]);

    this.ordersOnHold = allOrders
    .filter(e => e.status === OrderStatus.Confirmed || e.status === OrderStatus.Delivered)
    .sort((a, b) => order[a.status] - order[b.status]);

    this.finishedOrders = allOrders
    .filter(e => e.status === OrderStatus.Finished);
  }


  changeOrderStatus(item: IonItemSliding, order: Order, newStatus) {
    item.close();
    this.loadingCtrl.create({ message: 'Cargando...' }).then(loadingEl => {
      loadingEl.present();
      this.database.UpdateSingleField('status', newStatus, 'orders', order.id)
      .then( () => {
        if (newStatus === 'confirmed' && order.products.filter(p => p.product.category.includes(Category.Bebida)).length > 0){
          this.createNotification('bartender');
        }
        if (newStatus === 'confirmed' && order.products.filter(p => !p.product.category.includes(Category.Bebida)).length > 0){
          this.createNotification('cocinero');
        }
        if (newStatus === 'finished') {
          this.database.GetOne('users', order.idClient)
          .then((customer: User) => {
            const table = customer.table;
            this.database.GetDocRef('users', customer.id)
              .update({table: '', status: Status.Recent_Enter})
              .then(() => {
                this.database.DeleteOne(customer.id, 'enquiries')
                .then(() => {
                  this.presentToast(table);
                });
              });
          });
        }
        loadingEl.dismiss();
      });
    });
  }


  async presentToast(table) {
    const toast = await this.toastController.create({
      message: 'La mesa ' + table + ' ha sido liberada',
      duration: 2000
    });
    toast.present();
  }


  createNotification(receiverType) {
    const notification = {
      senderType: 'mozo',
      receiverType,
      message: (receiverType === 'cocinero') ? NotificationMessages.Prepare_Dishes : NotificationMessages.Prepare_Drinks,
      date: new Date()
    };
    this.database.CreateOne(notification, 'notifications');
  }


  ngOnDestroy() {
    if (this.ordersSub) {
      this.ordersSub.unsubscribe();
    }
  }

}
