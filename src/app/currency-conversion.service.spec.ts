import { TestBed } from '@angular/core/testing';

import { CurrencyConversionService } from './currency-conversion.service';

import { HttpClientModule } from '@angular/common/http';

describe('CurrencyConversionService', () => {
  let service: CurrencyConversionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
      ]
    });
    service = TestBed.inject(CurrencyConversionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
