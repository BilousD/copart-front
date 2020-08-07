import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LotInfoComponent } from './lot-info.component';

describe('LotInfoComponent', () => {
  let component: LotInfoComponent;
  let fixture: ComponentFixture<LotInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LotInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LotInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
