import { Component, OnInit } from '@angular/core';
import { NavController, IonItemSliding, LoadingController } from '@ionic/angular';

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  type: string;
}
export const ROUTES: RouteInfo[] = [
  { path: '/staff/employees', title: 'Personal',  icon: 'https://image.flaticon.com/icons/svg/2786/2786245.svg', class: '', type: 'supervisor'},
  { path: '/staff/tables', title: 'Mesas',  icon: 'https://image.flaticon.com/icons/svg/2843/2843652.svg', class: '', type: 'supervisor'},
  { path: '/staff/delivery', title: 'Delivery',  icon: 'https://image.flaticon.com/icons/svg/2786/2786408.svg', class: '', type: 'all'},
  { path: '/staff/stats', title: 'Estadisticas',  icon: 'https://image.flaticon.com/icons/svg/2786/2786428.svg', class: '', type: 'supervisor'},
  { path: '/turnos', title: 'Delivery',  icon: 'https://image.flaticon.com/icons/svg/2786/2786408.svg', class: '', type: 'Admin'},
  { path: '/empleados', title: 'Empleados',  icon: 'fas fa-user-alt', class: '', type: 'Admin'},
  { path: '/altas', title: 'Altas',  icon: 'fas fa-user-plus', class: '', type: 'Admin'}
];


@Component({
  selector: 'app-staff',
  templateUrl: './staff.page.html',
  styleUrls: ['./staff.page.scss'],
})
export class StaffPage implements OnInit {

  public user = { imageUrl: 'assets/img/team-4-800x800.jpg', type: 'supervisor'};
  public menuItems: any[];


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

  constructor( public navCtrl: NavController ) { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem.type === this.user.type || menuItem.type === 'all');
  }



}
