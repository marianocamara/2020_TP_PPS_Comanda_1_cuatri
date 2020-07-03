import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PreparationsPage } from './preparations.page';

describe('PreparationsPage', () => {
  let component: PreparationsPage;
  let fixture: ComponentFixture<PreparationsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreparationsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PreparationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
