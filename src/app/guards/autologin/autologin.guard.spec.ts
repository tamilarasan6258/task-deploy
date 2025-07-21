import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { autologinGuard } from './autologin.guard';

describe('autologinGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => autologinGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
