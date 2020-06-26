import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Plugins } from '@capacitor/core';
import { User, Status } from 'src/app/models/user';

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  type: string;
}
export const ROUTES: RouteInfo[] = [
  { path: '/customer/poll', title: 'Encuestas',  icon: 'https://image.flaticon.com/icons/svg/3122/3122059.svg', class: '', type: 'cliente'},
  { path: '/customer/orders', title: 'Pedido',  icon: 'https://image.flaticon.com/icons/svg/833/833314.svg', class: '', type: 'cliente'},
  { path: '/staff/delivery', title: 'Delivery',  icon: 'https://image.flaticon.com/icons/svg/2786/2786408.svg', class: '', type: 'supervisor'},
  { path: '/staff/stats', title: 'Estadisticas',  icon: 'https://image.flaticon.com/icons/svg/2786/2786428.svg', class: '', type: 'supervisor'},
  { path: '/customer/games', title: 'Juegos',  icon: 'https://image.flaticon.com/icons/svg/2972/2972351.svg', class: '', type: 'cliente'},
  { path: '/altas', title: 'Altas',  icon: 'fas fa-user-plus', class: '', type: 'Admin'},
  { path: '', title: 'Salir',  icon: 'https://image.flaticon.com/icons/svg/875/875558.svg', class: '', type: 'todos'},
];

@Component({
  selector: 'app-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
})
export class MorePage implements OnInit {

  isLoading = true;
  public user: User; 
  public menuItems: any[];

  constructor( public navCtrl: NavController,
    private authService: AuthService,
    public alertController: AlertController ) { }
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
      if((this.user as User).status === Status.Eating || (this.user as User).status === Status.Waiting_Order){
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
                this.navCtrl.navigateBack('');
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
    } else {
      this.navCtrl.navigateForward([menuItem.path]);
    }
  }


}
