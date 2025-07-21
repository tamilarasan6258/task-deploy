import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartjsSummaryComponent } from './chartjs-summary.component';

describe('ChartjsSummaryComponent', () => {
  let component: ChartjsSummaryComponent;
  let fixture: ComponentFixture<ChartjsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartjsSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartjsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
