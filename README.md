# Currency Converter Demo

A demo Angular application to convert currencies to/from CAD using the [Bank of
Canada's Valet API](https://www.bankofcanada.ca/valet/docs).

## Running the App

    $ git clone https://github.com/j-n-f/currency-converter-demo.git
    $ cd currency-converter-demo
    $ npm update
    $ ng serve --open

## Notes

*   BoC publishes daily conversion rates each day at 16:30 ET. If you try to get
    a conversion at 08:00 ET, the app will use a conversion rate from the most
    recent day with conversion data available.
*   Similarly, rates aren't published on weekends, so the conversion will use
    Friday's rates.
*   The conversion pane at the top will always tell you the conversion rate
    and the date that the rate was published.
*   The app should work properly if used in a timezone other than the BoC's (
    i.e. `America/Toronto`).
*   If you start the app before 16:30 ET on a weekday, the app will prompt you
    when new rates become available, and you can optionally update to have the
    latest rates. If you dismiss the prompt, you will have to refresh the page
    to get the new rates (this is indicated by a block of text at the bottom
    of the conversion pane).
*   You can test the rate update prompt with the query
    `/?forceUpdatePrompt=true` (i.e. `localhost:4200/?forceUpdatePrompt=true`)
*   If you use any kind of privacy plugin, or the BoC API is unavailable, an
    error message will be displayed. Adjust your browser and refresh the page.
*   The UI will display at most 4 decimal places on conversions (it will display
    fewer if the digits are all zero past the first 2 digits).
*   There are some CSS bugs in the Angular Material library. It appears that
    after selecting a valid currency that the Date Picker is still disabled (the
    label is faded, as for a disabled field). Note that the toggle (i.e.
    calendar icon) is not faded, and that you can use it to select a date.
*   Use of this app involves using the Valet API provided by the Bank of Canada,
    and as such you agree to the [terms](https://www.bankofcanada.ca/terms/)
    under which they make this data available for use.
*   This app should look decent on smaller screens, and has some amount of
    responsiveness.

## Room for Improvement

A few things I would do if I had more time:

*   The rate update feature doesn't check to see if it actually got the new
    rates. There should be retry logic to do that. It appears that rate
    information isn't published on holidays as well, so the logic would also
    need to know what holidays it shouldn't check on.
*   The `CurrencyConversionService` could update rates in the background, and
    create a `Subject` which the `CurrencyConversionComponent` would subscribe
    to, rather than having that logic driven by an interval timer in the
    `CurrencyConversionComponent`. This would also make it easier for multiple
    components to use the service. It would also remove the need to hack the
    refresh functionality in by having `CurrencyConversionComponent` restart
    itself to fetch rates. It would only have to update the range on the
    datepicker component.
*   `CurrencyConversionService` could be optimized to only request rate data
    that it doesn't already have.
*   `CurrencyConversionService` could use `localStorage` to reduce load on BoC's
    API, and enable offline functionality.
*   Some of the filtering performed in `CurrencyConversionComponent` would also
    be better placed in `CurrencyConversionService` (e.g. filtering out
    conversions that don't have rates for the full date range returned by the
    BoC API)
*   It might be possible to improve on the UX so that currencies that only have
    rates for part of the date range could still be used. It would involve
    updating the datepicker when a new currency is selected. (FWIW, only 3
    currencies listed by the API had gaps in their conversion rate history)
