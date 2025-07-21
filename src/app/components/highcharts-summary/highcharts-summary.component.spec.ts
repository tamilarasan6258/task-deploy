import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighchartsSummaryComponent } from './highcharts-summary.component';

describe('HighchartsSummaryComponent', () => {
  let component: HighchartsSummaryComponent;
  let fixture: ComponentFixture<HighchartsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HighchartsSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HighchartsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
