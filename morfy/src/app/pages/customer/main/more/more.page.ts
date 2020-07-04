import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ToastController, Platform } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Plugins } from '@capacitor/core';
import { User, Status } from 'src/app/models/user';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { DatabaseService } from 'src/app/services/database.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { Order, OrderStatus } from 'src/app/models/order';

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  type: string;
}
export const ROUTES: RouteInfo[] = [
  { path: '/survey', title: 'Encuestas', icon: 'https://image.flaticon.com/icons/svg/2698/2698444.svg', class: '', type: 'cliente' },
  { path: '/staff/delivery', title: 'Delivery', icon: 'https://image.flaticon.com/icons/svg/2786/2786408.svg', class: '', type: 'supervisor' },
  { path: '/staff/stats', title: 'Estadisticas', icon: 'https://image.flaticon.com/icons/svg/2786/2786428.svg', class: '', type: 'supervisor' },
  { path: '/customer/game-one', title: 'Juegos', icon: 'https://image.flaticon.com/icons/svg/3142/3142080.svg', class: '', type: 'cliente' },
  { path: '/customer/orders', title: 'Pedidos', icon: 'https://image.flaticon.com/icons/svg/2698/2698507.svg', class: '', type: 'cliente' },
  { path: '/altas', title: 'Altas', icon: 'fas fa-user-plus', class: '', type: 'Admin' },
  { path: '', title: 'Qr', icon: 'https://image.flaticon.com/icons/svg/3014/3014279.svg', class: '', type: 'todos' },
  { path: '', title: 'Salir', icon: 'https://image.flaticon.com/icons/svg/875/875558.svg', class: '', type: 'todos' }
];

@Component({
  selector: 'app-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
})
export class MorePage implements OnInit {
  enabledFunctions: boolean = false;
  isLoading = true;
  public user: User;
  public menuItems: any[];
  private ordersSub: Subscription;
  pendingOrder: Order[];

  constructor(public navCtrl: NavController,
    private authService: AuthService,
    private barcodeScanner: BarcodeScanner,
    public alertController: AlertController,
    private database: DatabaseService,
    public toastController: ToastController,
    private platform: Platform) { }
  ngOnInit() {
  }

  ionViewWillEnter() {
    this.isLoading = true;
    Plugins.Storage.get({ key: 'user-bd' }).then(
      (userData) => {
        if (userData.value) {
          this.user = JSON.parse(userData.value);
          this.menuItems = ROUTES.filter(menuItem => menuItem.type === this.user.type || menuItem.type === 'todos');
          this.isLoading = false;
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
      if(this.pendingOrder.length > 0){  
        this.presentAlert("Para finalizar sesión tiene que pagar la cuenta.", "Atención");
      }else{
        this.presentAlertLogoutAnon();
      }
    } else {
      this.presentAlertLogout();
    }
  }

  async presentAlert(message, header) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: header,
      message: message,
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

  gestionAction(menuItem) {
    if (menuItem.title === 'Salir') {
      this.logout();
    }
    else if (menuItem.title === 'Qr') {
      this.qrActions();
    }
    else {
      if (this.enabledFunctions) {
        this.navCtrl.navigateForward([menuItem.path]);
      } else {
        this.presentAlert("Debes haber solicitado tu pedido para acceder a esta funcionalidad.", "Lo lamentamos");
      }
    }
  }

  qrActions() {
    if (
      (this.platform.is('mobile') && !this.platform.is('hybrid')) ||
      this.platform.is('desktop')
    ) {
      this.presentToast("Se han habilitado las secciones Juegos, Encuestas y Pedidos.");
      this.enabledFunctions = true;
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
                if(this.user.type !== 'anonimo'){
                this.presentToast("Se han habilitado las secciones Juegos y Encuestas.");
              }else{
                //this.presentToast("Se han habilitado las secciones Juegos, Encuestas y Pedidos.");
              }
                this.enabledFunctions = true;
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

}
