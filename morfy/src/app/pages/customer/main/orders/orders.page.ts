import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { User, Status } from 'src/app/models/user';
import { LoadingController, NavController, IonItemSliding, ModalController, AnimationController, AlertController, Platform, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { Plugins } from '@capacitor/core';
import { Order, OrderStatus } from 'src/app/models/order';
import { OrderDetailsPage } from './order-details/order-details.page';
import { NotificationMessages } from 'src/app/models/notification';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit, OnDestroy {
  
  private ordersSub: Subscription;
  processedOrders: Order[] = [];
  receivedOrders: Order[] = [];
  // deliveryTime = 0;
  cart: Order;
  edit = false;
  orderDetailAction;
  isLoading = true;
  user: User;
  segment = 'pending';
  animation;
  
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    if (!targetElement.classList.contains('edit')) {
      this.edit = false;
    }
  }
  
  
  constructor( private loadingCtrl: LoadingController,
    private authService: AuthService,
    public navCtrl: NavController,
    private modalController: ModalController,
    private database: DatabaseService,
    private animationCtrl: AnimationController,
    public alertController: AlertController,
    private platform: Platform, 
    private barcodeScanner: BarcodeScanner,
    public toastController: ToastController   
    ) { }
    
    
    ngOnInit() {
      this.isLoading = true;
      Plugins.Storage.get({ key: 'user-bd' }).then(
        (userData) => {
          if (userData.value) {
            this.user = JSON.parse(userData.value);
            this.ordersSub = this.database.GetWithQuery('idClient', '==', this.user.id, 'orders')
            .subscribe(data => {
              this.cart = (data as Order[]).find(order => order.status === OrderStatus.Pending);
              this.processedOrders = (data as Order[])
              .filter(order => order.status !== OrderStatus.Pending && order.status !== OrderStatus.Finished && order.status !== OrderStatus.Received && order.status !== OrderStatus.Paid)
              .sort((a, b) => (b.date as any).localeCompare(a.date));
              
              this.receivedOrders =  (data as Order[])
              .filter(order => order.status === OrderStatus.Received)
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
          const row = event.target.parentNode.parentNode;
          const foundProductIndex = this.cart.products.findIndex(p => p.product.id === productId);
          if (action === 'add' && this.cart.products[foundProductIndex].quantity < 10) {
            this.cart.products[foundProductIndex].quantity++;
          }
          if (action === 'subtract' && this.cart.products[foundProductIndex].quantity >= 2) {
            this.cart.products[foundProductIndex].quantity--;
          }
          if (action === 'remove') {
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
              this.cart.products.splice(foundProductIndex, 1);
              
              if (this.cart.products.length < 1) {
                this.database.DeleteOne(this.cart.id, 'orders')
                .then(() => {
                  console.log('Order deleted');
                  this.edit = false;
                })
                .catch(error => {
                  console.log(error);
                });
              }
              else {
                this.database.UpdateOne(JSON.parse(JSON.stringify(this.cart)), 'orders')
                .then( () => {
                  // console.log('Order updated');
                });
              }
            });
            this.animation.play();
          }
          else {
            this.database.UpdateOne(JSON.parse(JSON.stringify(this.cart)), 'orders')
            .then( () => {
              // console.log('Order updated');
            });
          }
        }
        
        
        calculateOrderTotal(order: Order) {
          return order ? order.products.reduce((a, b) => a + b.quantity * b.product.price, 0) : 0;
        }
        
        calculateAllOrdersTotal(orders){
          let total = 0;
          orders.forEach(order => {
            total += order ? order.products.reduce((a, b) => a + b.quantity * b.product.price, 0) : 0;  
          });
          return total;
        }
        
        
        calculateDeliveryTime(order: Order) {
          const deliveryTime = {percent: 0, time: ''};
          switch (order.status) {
            case OrderStatus.Submitted:
            deliveryTime.percent = 75;
            deliveryTime.time = "20'";
            break;
            case OrderStatus.Confirmed:
            deliveryTime.percent = 50;
            deliveryTime.time = "10'";
            break;
            case OrderStatus.Ready:
            deliveryTime.percent = 25;
            deliveryTime.time = "5'";
            break;
            case OrderStatus.Delivered:
            deliveryTime.percent = 0;
            break;
            default:
            break;
          }
          return deliveryTime;
        }
        
        
        order() {
          this.database.UpdateSingleField('status', OrderStatus.Submitted, 'orders', this.cart.id)
          .then(() => this.createNotification());
        }
        
        
        createNotification() {
          const notification = {
            senderType: 'cliente',
            receiverType: 'mozo',
            message: NotificationMessages.New_Order,
            date: new Date()
          };
          this.database.CreateOne(notification, 'notifications');
        }
        
        
        
        // Modal pedido
        
        async checkout() {
          const modal = await this.modalController.create({
            component: OrderDetailsPage,
            // cssClass: 'add-product-modal',
            componentProps: {
              receivedOrders: this.receivedOrders,
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

        qrActions() {
          if (
            (this.platform.is('mobile') && !this.platform.is('hybrid')) ||
            this.platform.is('desktop')
          ) {
            this.checkout();
          }
          else {
            this.barcodeScanner.scan().then(barcodeData => {
              let barcodeText = barcodeData.text;
      
              if (barcodeText.includes("morfy_table")) {
                let number_table = "";
                number_table = barcodeText.split('_')[2];
      
                this.database.GetOne('users', this.user.id)
                  .then((user) => {
                    if ((user as User).table === number_table) {
                      this.checkout();
                    } else {
                      this.presentToast("Leyó el qr equivocado.");
                    }
      
                  }).catch(() => {
                    this.presentToast("Ocurrió un error al intentar leer el código QR. Por favor, reintente.")
                  });
      
              }
      
            });
          }
        }
        
        async presentToast(message: string) {
          const toast = await this.toastController.create({
            message,
            duration: 3000
          });
          toast.present();
        }
        
        orderDetailsAction(modalAction) {
          switch (modalAction) {
            case 'pay':
            console.log('paying order...');
            this.loadingCtrl.create({ message: 'Pagando...' }).then(loadingEl => {
              this.receivedOrders.forEach(order => {
                this.database.UpdateSingleField('status', OrderStatus.Paid, 'orders', order.id)
                .then(() => {
                  console.log('Order paid');  
                  this.database.GetDocRef('users', this.user.id)
                  .update({table: '', status: Status.Recent_Enter});
                  this.user.table = '';
                  this.user.status = Status.Recent_Enter;
                  Plugins.Storage.set({ key: 'user-bd', value: JSON.stringify(this.user) })
                  .then(() => {
                    this.database.DeleteOne( this.user.id, 'enquiries')
                    .then(() => {            
                      this.presentAlertPaid();
                    })
                    .catch(error => {
                      console.log(error);
                    });
                  });
                });
              }); 
            });
                      
            break;
            default:
            console.log('closing modal');
            break;
          }
        }
        
        async presentAlertReceived(order) {
          if(order.status == OrderStatus.Delivered){
            const alert = await this.alertController.create({
              cssClass: 'my-custom-class',
              header: 'Recepcion de pedido',
              message: '¿Quieres confirmar que recibiste el pedido satisfactoriamente?',
              buttons: [
                {
                  text: 'Cancelar',
                  role: 'cancel',
                  cssClass: 'secondary',
                  handler: (blah) => {
                  }
                }, {
                  text: 'OK',
                  handler: () => {
                    this.changeOrderStatus(order, OrderStatus.Received);      
                  }
                }
              ]
            });
            
            await alert.present();
          }
        }

        async presentAlertPaid() {
            const alert = await this.alertController.create({
              cssClass: 'my-custom-class',
              header: 'Pago realizado',
              message: '¿Quieres realizar una breve encuesta antes de irte?',
              buttons: [
                {
                  text: 'No',
                  role: 'cancel',
                  cssClass: 'secondary',
                  handler: (blah) => {
                    this.navCtrl.navigateForward('/customer');
                  }
                }, {
                  text: 'Si',
                  handler: () => {
                    this.navCtrl.navigateForward('/survey');     
                  }
                }
              ]
            });
            
            await alert.present();
        }

        
        
        
        changeOrderStatus(order: Order, newStatus) {
          this.loadingCtrl.create({ message: 'Confirmando...' }).then(loadingEl => {
            loadingEl.present();
            this.database.UpdateSingleField('status', newStatus, 'orders', order.id)
            .then( () => {
              //hacer que vuele
              loadingEl.dismiss();
            });
          });
        }
        
        ngOnDestroy() {
          if (this.ordersSub) {
            this.ordersSub.unsubscribe();
          }
        }
        
        
        
      }
      