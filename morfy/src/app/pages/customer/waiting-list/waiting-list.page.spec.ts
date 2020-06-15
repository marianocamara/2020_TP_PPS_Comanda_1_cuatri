import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WaitingListPage } from './waiting-list.page';

describe('WaitingListPage', () => {
  let component: WaitingListPage;
  let fixture: ComponentFixture<WaitingListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaitingListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WaitingListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
