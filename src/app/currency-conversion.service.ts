import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, pluck, publishReplay, refCount } from 'rxjs/operators';

import { CurrencyMetadata, CURRENCY_CODE_MAP } from './currency-info.data';

import * as mtz from 'moment-timezone'; 

function currencyCodeIsAlpha(code: string) : boolean {
  const re = /^[A-Z]{3}$/g;

  if (code.matchAll(re) !== null) {
    return true;
  }

  return false;
}
function currencyCodeIsNum(code: string) : boolean {
  const re = /^[0-9]{3}$/g;
  
  if (code.matchAll(re) !== null) {
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyConversionService {
  rates : object | null = null;

  constructor(private http: HttpClient, @Inject(LOCALE_ID) public locale: string){
  }

  /**
   * Given a currency code as string (either 3-character alpha or numeric),
   * return the metadata for that currency, or null if it wasn't found.
   *
   * e.g. for CAD you could pass "CAD", "cad", or "124"
   */
  getCurrencyMetadata(code: string): CurrencyMetadata | null {
    if (currencyCodeIsAlpha(code)) {
      let info = CURRENCY_CODE_MAP.find(
        (currency: CurrencyMetadata) => currency.alphaCode == code
      );
      return info ?? null;
    } else if (currencyCodeIsNum(code)) {
      let info = CURRENCY_CODE_MAP.find(
        (currency: CurrencyMetadata) => currency.numCode == code
      );
      return info ?? null;
    } else {
      return null;
    }
  }

  /**
   * Get a complete listing of all available currencies (per ISO standard)
   */
  getAll() {
    return CURRENCY_CODE_MAP;
  }

  /**
   * Provides a list of currency codes as strings that CAD can be converted
   * to/from. The function returns an observable that will provide an array of
   * those codes after collecting them from the BoC's API.
   */
  getAvailableConversions() : Observable<string[]>{
    let rspObserver = this.http.get(
      'https://www.bankofcanada.ca/valet/groups/FX_RATES_DAILY/json'
    ).pipe(
      // 1. Get the relevant key from inside the object
      pluck('groupDetails', 'groupSeries'),
      // 2. Get the keys in the group series (e.g. "FX[AAA][BBB]"
      map(series => Object.keys(series)),
      // 3. Convert the data into a convenient format (list of available codes)
      map((conversions: string[]) => {
        // Break up the array key into the two codes
        return conversions.map(x => {
          const re = /^FX([A-Z]{3})([A-Z]{3})$/;
          let matches  = x.match(re);
          // won't assume it always has "CAD" as the second code in the string
          return matches[1] == "CAD" ? matches[2] : matches[1];
        })
      })
    );
   
    //rspObserver.subscribe(x => console.log(x));

    return rspObserver;
  }

  /* Keep a local copy of conversion rates */
  storeRates(rates) {
    this.rates = rates;
  }

  /**
   * e.g. convert(1.00, 'CAD', 'USD')
   *      convert(1.00, 'CAD', 'USD', new Date(2020,0,1))
   *
   * Will return null when rates aren't loaded (or unavailable for some date),
   * or if an invalid currency is requested. Caller is responsible for
   * formatting the number.
   *
   * Note that the rate is returned as a tuple of [conversion, conversion_rate_date]
   **/
  convert(fromAmt: number, from: string, to: string, on: Date ) : [number, Date] | null {
    let rate = this.conversionRate(from, to, on);

    if (to != "CAD" && from != "CAD") {
      console.error("conversion must include CAD");
      return null;
    }
   
    // Tuple of [curency conversion, conversion rate date]
    return [fromAmt * rate[0], rate[1]];
  }

  conversionRate(from: string, to: string, on: Date) : [number, Date] | null {
    let dateString = on.toLocaleDateString('en-CA', {timeZone: 'America/Toronto'});
    let dailyRates = this.rates['observations'].find(e => e.d == dateString);

    if (dailyRates === undefined) {
      // We'll try moving backwards from the given date for at most 7 days until
      // we find a day that has conversion data. Otherwise we give up.
      for(var i = 1; i <= 7; i++){
        let testDate = new Date(on.getTime());
        testDate.setDate(testDate.getDate() - i);
        let testDateString = testDate.toLocaleDateString('en-CA', {timeZone: 'America/Toronto'});

        if (this.rates['observations'].some(e => e.d == testDateString)) {
          dailyRates = this.rates['observations'].find(e => e.d == testDateString); 
          on = testDate;
          break;
        }
      }
    }

    if (dailyRates === undefined) {
      // If dailyRates is still undefined, the user found a way to get the UI to
      // send an invalid date to the component.
      return null;
    }

    // dailyRates is available, so we return the conversion rate and the date of
    // that conversion rate
    if (from == "CAD") {
      let conversion = dailyRates[`FX${to}CAD`].v;
      conversion = conversion;
      return [1.0 / conversion, on];
    } else if (to == "CAD") {
      let conversion = dailyRates[`FX${from}CAD`].v;
      return [conversion, on];
    } else {
      console.error("conversion must include CAD");
      return null;
    }
  }

  /**
   * Provides a complete listing of historical exchange rates from the BoC. This
   * function returns an observable that will provide the raw data, but does not
   * need to be used by the caller. Once this function has been called once
   */
  getConversionRates() : Observable<object> {
    let rspObserver = this.http.get(
      `https://www.bankofcanada.ca/valet/observations/group/FX_RATES_DAILY/json`
    ).pipe(
      publishReplay(),
      refCount(),
    );

    rspObserver.subscribe({
      next: rates => this.storeRates(rates),
      error: e => console.error("conversion service error", e),
    });

    return rspObserver;
  }

  /**
   * If conversion data has been fetched, give the caller an array of valid
   * Date objects for conversion
   **/
  getValidConversionDates() : Date[] | null {
    if (this.rates) {
      let observations = this.rates['observations'];
      let dates = observations.map((o) => mtz.tz(o['d'] + 'T00:00:00', 'America/Toronto').toDate());

      return dates;
    } 

    return null;
  }
}
