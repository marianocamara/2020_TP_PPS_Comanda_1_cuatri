import { Component, OnInit } from '@angular/core';
import { NavController, IonItemSliding, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.page.html',
  styleUrls: ['./staff.page.scss'],
})
export class StaffPage implements OnInit {

  user = { imageUrl: 'assets/img/team-4-800x800.jpg'};

  employees = [
    { name: 'Braian',
      lastName: 'Cardozo',
      imgUrl: 'http://bdatechnical.com/wp-content/uploads/2019/06/empty-profile-250x250.jpg'
    },
    { name: 'Mariano',
      lastName: 'Camara',
      imgUrl: 'https://x1.xingassets.com/assets/frontend_minified/img/users/nobody_m.original.jpg'
    },
    { name: 'Ariel',
      lastName: 'Traut',
      imgUrl: 'http://bdatechnical.com/wp-content/uploads/2019/06/empty-profile-250x250.jpg'
    },
    {
      name: 'Pepe',
      lastName: 'Pepon',
      imgUrl: 'https://x1.xingassets.com/assets/frontend_minified/img/users/nobody_m.original.jpg'
    },
    { name: 'Pepin',
      lastName: 'Pepon',
      imgUrl: 'http://bdatechnical.com/wp-content/uploads/2019/06/empty-profile-250x250.jpg'
    },
  ];

  confirmaciones = [
    { titulo: 'Mesa 7',
      texto: 'Este es un texto de prueba'
    },
    { titulo: 'Mesa 3',
    texto: 'Este es un texto de prueba'
    },
    { titulo: 'Delivery Pedido #23',
    texto: 'Este es un texto de prueba'
    }
  ];

  constructor( public navCtrl: NavController,
               private loadingCtrl: LoadingController ) { }

  ngOnInit() {
    this.confirmaciones = [];
  }


  goToProfile() {
  }


  confirm(item: IonItemSliding) {
    item.close();
    this.loadingCtrl.create({ message: 'Confirmando...' }).then(loadingEl => {
      loadingEl.present();
      setTimeout (() => {
        loadingEl.dismiss();
     }, 1000);
    });
  }

}
