import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EchartsSummaryComponent } from './echarts-summary.component';

describe('EchartsSummaryComponent', () => {
  let component: EchartsSummaryComponent;
  let fixture: ComponentFixture<EchartsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EchartsSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EchartsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
