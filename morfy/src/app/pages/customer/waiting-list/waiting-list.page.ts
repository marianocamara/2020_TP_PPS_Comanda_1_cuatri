import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Plugins } from '@capacitor/core';
import { NavController, IonSlides, AlertController } from '@ionic/angular';
import { User, Status } from 'src/app/models/user';
import { DatabaseService } from 'src/app/services/database.service';
import { map } from 'rxjs/operators';
import { WaitingListEntry } from 'src/app/models/waiting-list-entry';


@Component({
  selector: 'app-waiting-list',
  templateUrl: './waiting-list.page.html',
  styleUrls: ['./waiting-list.page.scss'],
})
export class WaitingListPage implements OnInit {

  user: User;
  isLoading = true;
  @ViewChild('slides') slides: IonSlides;
  disablePrevBtn = true;
  disableNextBtn = false;
  myPosition = 8;
  // waitingList = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
  waitingList: WaitingListEntry[] = [];



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
    public alertController: AlertController) { }

  ngOnInit() {
    this.isLoading = true;
    Plugins.Storage.get({ key: 'user-bd' }).then(
      (userData) => {
        if (userData.value) {
          this.user = JSON.parse(userData.value);
          this.database.GetWithQuery('id', '==', this.user.id, 'users')
            .subscribe(user => {
              if (user.length > 0) { this.user = user[0]; }
              else { this.logout(); }
              this.database.GetAll('waiting-list')
                .subscribe(list => {
                  this.waitingList = (list as WaitingListEntry[]).sort((a, b) => (a.date as any).localeCompare(b.date));
                  this.myPosition = this.waitingList.findIndex(customer => customer.id === this.user.id) + 1;
                  this.isLoading = false;
                  console.log(this.waitingList);
                  console.log(this.myPosition);
                });
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

  ionViewWillEnter() {
    if (!this.user) {
      this.logout();
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
      //if((this.user as User).status === Status.Eating || (this.user as User).status === Status.Waiting_Order){
      if (false) {
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


  formatTitle = () => {
    return this.user.table ? `${this.user.table}` : `${this.myPosition}`;
  }


}
