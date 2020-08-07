import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CopartExtractorComponent } from './copart-extractor.component';

describe('CopartExtractorComponent', () => {
  let component: CopartExtractorComponent;
  let fixture: ComponentFixture<CopartExtractorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CopartExtractorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopartExtractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
