import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Plugins } from '@capacitor/core';
import { NavController, AlertController } from '@ionic/angular';
import { User, Status } from 'src/app/models/user';
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
  pendingOrder: Order[];
  orderTotal;
  showQr:boolean = false;
  constructor( public navCtrl: NavController,
               private authService: AuthService,
               private database: DatabaseService,
               public alertController: AlertController ) { }

  ngOnInit() {
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
              this.orderTotal = this.calculateAllOrdersTotal(this.pendingOrder);
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

  calculateAllOrdersTotal(orders){
    let total = 0;
    orders.forEach(order => {
      total += order ? order.products.reduce((a, b) => a + b.quantity * b.product.price, 0) : 0;  
    });
    return total;
  }

  changeQr(from){
    console.log(from);
    if(from === 'home'){
      this.showQr = false;
    }
    if(from === 'orders'){
      this.showQr = false;
    }
    if(from === 'more'){
      this.showQr = false;
    }
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
  
  logoutUser(){
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
}
