import { Component, OnDestroy } from '@angular/core';

import { Platform, ToastController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DatabaseService } from './services/database.service';
import { Subscription } from 'rxjs';


import { Notification, NotificationMessages } from 'src/app/models/notification';
import { Plugins } from '@capacitor/core';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { User } from './models/user';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnDestroy {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private database: DatabaseService,
    public toastController: ToastController
    ) {
      this.initializeApp();
    }
    
    user: User;
    private notificationSub: Subscription;
    first: boolean = true;
    notifications = [];
    
    initializeApp() {
      this.platform.ready().then(() => {
        this.statusBar.styleDefault();
        this.splashScreen.hide();
      });
      
      this.notificationSub = this.database.GetAll('notifications').subscribe(data => {        
        if(this.first){        
          this.first = false;
        }else{
          //sort notifications by date
          this.notifications = (data as Notification[]).sort((a, b) => b.date as any - (a.date as any));
          this.showNotification();              
        }        
      });
      
    }
    
    showNotification(){
      //get current User
      Plugins.Storage.get({ key: 'user-bd' }).then(
        (userData) => {
          if (userData.value) {
            this.user = JSON.parse(userData.value);
            if(this.user){
              if(this.notifications[0].receiverType == this.user.type){
                //show last notification message
                this.presentToast(this.notifications[0].message);
              }
            }
          }}
          );
          
        }
        
        async presentToast(message: string) {
          const toast = await this.toastController.create({
            buttons: [ {
                text: 'X',
                role: 'cancel',
                handler: () => {
                  console.log('Cancel clicked');
                }
              }
            ],
            message,
            duration: 3000
          });
          toast.present();
        }
        
        
        ngOnDestroy() {
          if (this.notificationSub) {
            this.notificationSub.unsubscribe();
          }
        }
      }
      