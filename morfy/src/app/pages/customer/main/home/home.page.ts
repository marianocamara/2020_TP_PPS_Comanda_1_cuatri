import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { User, Status } from 'src/app/models/user';
import { Plugins } from '@capacitor/core';
import { NavController, ModalController, AlertController } from '@ionic/angular';
import { AddModalPage } from './add-modal/add-modal.page';
import { Subscription } from 'rxjs';
import { Product, Category } from 'src/app/models/product';
import { DatabaseService } from 'src/app/services/database.service';
import { Order, OrderStatus } from 'src/app/models/order';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})

export class HomePage implements OnInit, OnDestroy {

  user: User;
  products: Product[] = [];
  types = Object.keys(Category);
  private productsSub: Subscription;
  isLoading = false;
  featured: Product[] = [];
  drinks: Product[] = [];
  filteredProducts: Product[] = [];
  slideOptsOne;
  private ordersSub: Subscription;
  pendingOrder: Order[];

  constructor(public navCtrl: NavController,
    private authService: AuthService,
    private modalController: ModalController,
    private database: DatabaseService,
    public alertController: AlertController) { }
  ngOnInit() {
    this.isLoading = true;
    this.productsSub = this.database.GetAll('products').subscribe(products => {
      this.products = products;
      console.log(this.products);
      this.featured = this.products.filter(product => product.category.includes(Category.Featured));
      this.filterProducts('principal');
      this.drinks = this.products.filter(product => product.category.includes(Category.Bebida));
      this.isLoading = false;
    });
    Plugins.Storage.get({ key: 'user-bd' }).then(
      (userData) => {
        if (userData.value) {
          this.user = JSON.parse(userData.value);
          this.ordersSub = this.database.GetWithQuery('idClient', '==', this.user.id, 'orders')
            .subscribe(data => {
              this.pendingOrder = (data as Order[]).filter(order => order.status === OrderStatus.Pending || order.status === OrderStatus.Confirmed
                || order.status === OrderStatus.Delivered
                || order.status === OrderStatus.Ready
                || order.status === OrderStatus.Received
                || order.status === OrderStatus.Submitted);
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
            this.logoutUser();
          }
        }
      ]
    });

    await alert.present();
  }

  logoutUser() {
    this.authService.logoutUser()
      .then(res => {
        // console.log(res);
        this.navCtrl.navigateBack('');
      })
      .catch(error => {
        console.log(error);
      });
  }

  logout() {
    if ((this.user as User).type === 'anonimo') {
      // Si el usuario anonimo esta comiendo o esperando el pedido, no lo dejo finalizar sesion
      if (this.pendingOrder.length > 0) {
        this.presentAlert("Para finalizar sesión tiene que pagar la cuenta.", "Atención");
      } else {
        this.presentAlertLogoutAnon();
      }
    } else {
      this.presentAlertLogout();
    }
  }

  async presentAlert(message, header) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }
  async presentAlertLogoutAnon() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Finalizando sesión',
      message: '¿Estás seguro? Un usuario anónimo no puede recuperar sus datos.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Cerrar Sesión',
          handler: () => {
            this.authService.logoutUser()
              .then(res => {
                this.database.UpdateSingleField('table', '', 'users', this.user.id)
                .then(() =>{ this.navCtrl.navigateBack(''); });
              })
              .catch(error => {
                console.log(error);
              });
          }
        }
      ]
    });

    await alert.present();
  }


  filterProducts(type: string) {
    this.filteredProducts = this.products.filter(product => product.category.includes(type.toLowerCase() as Category));
  }


  async openAddModal(selectedProduct) {
    const modal = await this.modalController.create({
      component: AddModalPage,
      cssClass: 'add-product-modal',
      componentProps: {
        product: selectedProduct,
        user: this.user
      }
    });
    modal.onWillDismiss().then(dataReturned => {
      // trigger when about to close the modal
      // this.received = dataReturned.data;
      // console.log('Receive: ', this.received);
    });
    return await modal.present().then(_ => {
      // triggered when opening the modal
      // console.log('Sending: ', selectedProduct);
    });
  }

  newChat() {

    this.database.GetOne('enquiries', this.user.id)
      .then((enquiry) => {
        if (enquiry) {
          this.navCtrl.navigateForward('/chat/chat-detail/' + this.user.id);
        } else {
          this.database.GetOne('users', this.user.id).then(
            (usr) => {
              // create chat
              const enquiry = {
                id: usr.id,
                clientName: usr.name,
                clientTable: usr.table,
                clientImg: usr.imageUrl,
                messages: [],
                msgCount: 0
              };
              this.database.CreateOne(enquiry, 'enquiries');
              this.navCtrl.navigateForward('/chat/chat-detail/' + usr.id);

            });
        }
      });
  }



  ngOnDestroy() {
    if (this.productsSub) {
      this.productsSub.unsubscribe();
    }
  }


}
