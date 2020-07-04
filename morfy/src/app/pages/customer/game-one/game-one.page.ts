import { Component, OnInit } from '@angular/core';
import { OrderStatus, Order } from 'src/app/models/order';
import { User } from 'src/app/models/user';
import { Plugins } from '@capacitor/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { DatabaseService } from 'src/app/services/database.service';
import { NavController, AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-game-one',
  templateUrl: './game-one.page.html',
  styleUrls: ['./game-one.page.scss'],
})
export class GameOnePage implements OnInit {

  user: User;
  isLoading = true;
  private ordersSub: Subscription;
  pendingOrder: Order[];

  secretNumber: number = Math.floor((Math.random() * 100) + 1);
  numberSelected: number;

  
  constructor(public navCtrl: NavController,
    private authService: AuthService,
    private database: DatabaseService,
    public alertController: AlertController) { }

  ngOnInit() {
    this.isLoading = true;
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
          this.logout();
        }
      }, () => {
        this.logout();
      }
    );
  }

  play(){
    if(this.numberSelected === undefined){
      this.presentAlert("Debes ingresar un numero.", "Atención");
    }
    else if(this.numberSelected < 1 || this.numberSelected > 100 ){
      this.presentAlert("Debes seleccionar un número entre 1 y 100.", "Atención");
    }
    else if((this.secretNumber - this.numberSelected) < 5  && (this.secretNumber - this.numberSelected) > -5){
      if(this.numberSelected < this.secretNumber){
        this.presentAlert("El número misterioso es más grande. (Ayudita: la diferencia es menor a 5)", "¡Estuviste muy cerca!");
      }
      if(this.numberSelected > this.secretNumber){
        this.presentAlert("El número misterioso es más chico. (Ayudita: la diferencia es menor a 5)", "¡Estuviste muy cerca!");
      }
    }
    else if((this.secretNumber - this.numberSelected) < 10  && (this.secretNumber - this.numberSelected) > -10){
      if(this.numberSelected < this.secretNumber){
        this.presentAlert("El número misterioso es más grande. (Ayudita: la diferencia es menor a 10)", "¡Estuviste bastante cerca!");
      }
      if(this.numberSelected > this.secretNumber){
        this.presentAlert("El número misterioso es más chico. (Ayudita: la diferencia es menor a 10)", "¡Estuviste bastante cerca!");
      }
    }
    else if(this.numberSelected < this.secretNumber){
      this.presentAlert("El número misterioso es más grande.", "¡Te estas acercando!");
    }
    else if(this.numberSelected > this.secretNumber){
      this.presentAlert("El número misterioso es más chico.", "¡Te estas acercando!");
    }
    
    if(this.numberSelected == this.secretNumber){
      this.presentAlert("El número misterioso era el " + this.secretNumber +". A la hora de pagar tu cuenta, veras el descuento aplicado en tu primer pedido cargado. ¡Felicitaciones!", "¡FELICITACIONES!");

      this.winner();
    }
    console.log(this.secretNumber);
    this.numberSelected = 0;
  }
  
  winner(){    
    if(!this.pendingOrder[0].hasDisscount){
    this.database.UpdateSingleField('hasDisscount', true, 'orders', this.pendingOrder[0].id).then(
      () => { 
        setTimeout(() => {
          this.navCtrl.navigateForward('/customer/main/home');
        }, 1000);
      }
    );
  }else{
    this.navCtrl.navigateForward('/customer/main/home');
  }
    
  }

  ionViewWillEnter() {
    if (!this.user) {
      this.logout();
    }
    if(this.pendingOrder){
      if(this.pendingOrder[0].hasDisscount !== undefined && this.pendingOrder[0].hasDisscount ){
        this.presentAlert("Recuerde que ya ha recibido el beneficio, solo jugara por diversión.", "Recordatorio");
      }
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
