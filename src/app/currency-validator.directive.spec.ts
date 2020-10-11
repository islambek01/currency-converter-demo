import { CurrencyValidator } from './currency-validator.directive';
import { FormControl } from '@angular/forms';
import { CURRENCY_CODE_MAP } from './currency-info.data';

describe('CurrencyValidator', () => {
  it('should mark text values as invalid', () => {
    let validator = CurrencyValidator();
    let control = new FormControl('', [validator]);
    let value = "some text";
    control.setValue(value);

    expect(control.invalid).toBeTruthy();
  });
  
  it('should mark numeric values as invalid', () => {
    let validator = CurrencyValidator();
    let control = new FormControl('', [validator]);
    let value = 1234;
    control.setValue(value);

    expect(control.invalid).toBeTruthy();
  });

  it('should mark a CurrencyMetadata object as valid', () => {
    let validator = CurrencyValidator();
    let control = new FormControl('', [validator]);
    let value = CURRENCY_CODE_MAP[0];
    control.setValue(value);

    expect(control.valid).toBeTruthy();
  });
});

