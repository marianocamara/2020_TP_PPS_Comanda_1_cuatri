import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Plugins, Toast } from '@capacitor/core';
import { NavController, IonSlides, AlertController } from '@ionic/angular';
import { User, Status } from 'src/app/models/user';
import { DatabaseService } from 'src/app/services/database.service';
import { WaitingListEntry } from 'src/app/models/waiting-list-entry';
import { NotificationMessages } from 'src/app/models/notification';
import { Subscription } from 'rxjs/internal/Subscription';
import { Order, OrderStatus } from 'src/app/models/order';


@Component({
  selector: 'app-customer',
  templateUrl: './customer.page.html',
  styleUrls: ['./customer.page.scss'],
})
export class CustomerPage implements OnInit {

  user: User; // = { imageUrl: 'assets/img/team-4-800x800.jpg'};
  isLoading = true;
  @ViewChild('slides') slides: IonSlides;
  disablePrevBtn = true;
  disableNextBtn = false;
  private ordersSub: Subscription;
  pendingOrder: Order[];


  // Optional parameters to pass to the swiper instance.
  // See http://idangero.us/swiper/api/ for valid options.
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    clickable: true
  };

  constructor(public navCtrl: NavController,
    private authService: AuthService,
    private database: DatabaseService,
    private alertController: AlertController) { }

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
            });
        }
        else {
          this.user = null;
          this.logoutUser();  
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
          if ((this.user as User).status === Status.Waiting_Table) {
            // abrir camara para elegir Qr mesa, luego redirigir a:
            this.navCtrl.navigateForward('/customer/waiting-list');
          }
        }
        else {
          this.user = null;
          this.logoutUser();  
        }
      }, () => {
        this.logoutUser();  
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

  next() {
    this.slides.slideNext();
  }


  prev() {
    this.slides.slidePrev();
  }


  doCheck() {
    let prom1 = this.slides.isBeginning();
    let prom2 = this.slides.isEnd();

    Promise.all([prom1, prom2]).then((data) => {
      data[0] ? this.disablePrevBtn = true : this.disablePrevBtn = false;
      data[1] ? this.disableNextBtn = true : this.disableNextBtn = false;
    });
  }


  navigationOptions() { // actualizar con codigo Qr
    this.database.GetOne('users', this.user.id)
      .then((user) => {
        if ((user as User).table) {
          // abrir camara para elegir Qr mesa, luego redirigir a:
          this.navCtrl.navigateForward('/customer/main/home');
        }
        else if ((user as User).status === Status.Recent_Enter) {
          // abrir camara para escanear Qr lista de espera
          // luego de leer Qr cambio el estado a 'waiting-table' y redirijo:
          this.database.UpdateSingleField('status', Status.Waiting_Table, 'users', this.user.id)
            .then(() => {
              this.database.CreateOne(JSON.parse(JSON.stringify(
                new WaitingListEntry({
                  id: user.id,
                  customerName: this.user.name,
                  customerImg: this.user.imageUrl,
                  date: new Date()
                }))), 'waiting-list')
                  .then(() => {
                    this.createNotification();
                    this.navCtrl.navigateForward('/customer/waiting-list')}
                  );
              });
          }
          else if ((user as User).status === Status.Waiting_Table) {
            this.navCtrl.navigateForward('/customer/waiting-list');
          }
      });
  }

  createNotification(){
    let notification = {
      senderType: 'cliente',
      receiverType: 'metre',
      message: NotificationMessages.User_Waiting_Table,
      date: new Date()
    };
    this.database.CreateOne(notification, 'notifications');
  }



}
