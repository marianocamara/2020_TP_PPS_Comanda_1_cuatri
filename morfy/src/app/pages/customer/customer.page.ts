import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Plugins } from '@capacitor/core';
import { NavController, IonSlides } from '@ionic/angular';
import { User, Status } from 'src/app/models/user';
import { DatabaseService } from 'src/app/services/database.service';
import { WaitingListEntry } from 'src/app/models/waiting-list-entry';
import { NotificationMessages } from 'src/app/models/notification';


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


  // Optional parameters to pass to the swiper instance.
  // See http://idangero.us/swiper/api/ for valid options.
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    clickable: true
  };

  constructor( public navCtrl: NavController,
               private authService: AuthService,
               private database: DatabaseService ) { }

  ngOnInit() {
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
      .then( (user) => {
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
