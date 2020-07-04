import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { IonItemSliding, LoadingController, NavController, AlertController, ModalController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { User } from 'src/app/models/user';
import { DatabaseService } from 'src/app/services/database.service';
import { AuthService } from 'src/app/services/auth.service';
import { Chart } from 'chart.js';
import { Order } from 'src/app/models/order';


@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
})
export class StatsPage implements OnInit {

  private employeesSub: Subscription;
  isLoading = true;
  user: User;
  @ViewChild('barCanvas', { static: true }) barCanvas: ElementRef;
  @ViewChild('doughnutCanvas', { static: true }) doughnutCanvas: ElementRef;
  @ViewChild('lineCanvas', { static: true }) lineCanvas: ElementRef;
  private barChart: Chart;
  private doughnutChart: Chart;
  private lineChart: Chart;
  improvementData = {
    comida: 0,
    bebida: 0,
    atencion: 0,
    ambiente: 0,
    precios: 0,
    limpieza: 0,
    nada: 0,
    ubicacion: 0
  };
  satisfactionData = [0, 0, 0, 0, 0];
  salesData = [0, 0, 0, 0, 0, 0, 0, 0];

  constructor(
              private loadingCtrl: LoadingController,
              private authService: AuthService,
              public navCtrl: NavController,
              private database: DatabaseService,
              public alertController: AlertController,
              private modalController: ModalController
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.database.GetAll('surveys').subscribe((surveys) => {
      Object.keys(this.improvementData).forEach(v => this.improvementData[v] = 0);
      this.salesData = [0, 0, 0, 0, 0, 0, 0, 0];
      surveys.forEach(survey => {
        this.setSatisfaction(survey.fields.overallScore.answer);
        this.setImprovement(survey.fields.couldImprove.answer);
      });
      this.database.GetAll('orders').subscribe((orders: Order[]) => {
        this.setSales(orders);
        this.createCharts();
        this.isLoading = false;
      });
    });
  }


  ionViewWillEnter() {
    this.isLoading = true;
    Plugins.Storage.get({ key: 'user-bd' }).then(
      (userData) => {
        if (userData.value) {
          this.user = JSON.parse(userData.value);
        }
        else {
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
            this.logout();
          }
        }
      ]
    });

    await alert.present();
  }


  setSatisfaction(score) {
    switch (score) {
      case 1:
        this.satisfactionData[0]++;
        break;
      case 2:
        this.satisfactionData[1]++;
        break;
      case 3:
        this.satisfactionData[2]++;
        break;
      case 4:
        this.satisfactionData[3]++;
        break;
      case 5:
        this.satisfactionData[4]++;
        break;
      default:
        break;
    }
  }


  setImprovement(checkboxOptions) {
    checkboxOptions.forEach((checkbox, index ) => {
      // console.log(checkbox.isChecked);
      this.improvementData[checkbox.val] += (checkbox.isChecked === true) ? 1 : 0;
    });
  }


  setSales(orders: Order[]) {
    orders.forEach((order) => {
      const orderMonth = new Date(order.date).getMonth();
      this.salesData[orderMonth]++;
    });
  }


  createCharts() {
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Comida', 'Bebida', 'Atencion', 'Ambiente', 'Precios', 'Limpieza', 'Nada', 'Ubicacion'],
        datasets: [
          {
            label: '# de votos',
            data: Object.values(this.improvementData),
            backgroundColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(250, 99, 200, 1)',
              'rgba(116, 116, 116, 1)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      }
    });

    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['1', '2', '3', '4', '5'],
        datasets: [
          {
            label: '# of Votes',
            data: this.satisfactionData,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ],
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF6384', '#36A2EB', '#FFCE56']
          }
        ]
      }
    });

    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto'],
        datasets: [
          {
            label: 'Primer semestre',
            fill: false,
            lineTension: 0.1,
            backgroundColor: 'rgba(75,192,192,0.4)',
            borderColor: 'rgba(75,192,192,1)',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgba(75,192,192,1)',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(75,192,192,1)',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: this.salesData,
            spanGaps: false
          }
        ]
      }
    });
  }

}
