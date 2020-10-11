import { ValidatorFn, AbstractControl } from '@angular/forms';
import { CurrencyMetadata } from './currency-info.data';

/**
 * This validator is used for a form control which lets the user select a
 * currency. It just verifies that the value is an object of the type used to
 * represent currencies in this application.
 **/
export function CurrencyValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    if (control.value instanceof CurrencyMetadata) {
      return null;
    } else {
      return {unrecognizedCurrency: {value: control.value}};
    }
  };
}
