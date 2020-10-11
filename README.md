# Currency Converter Demo

A demo Angular application to convert currencies to/from CAD using the [Bank of
Canada's Valet API](https://www.bankofcanada.ca/valet/docs).

## Running the App

    $ git clone https://github.com/j-n-f/currency-converter-demo.git
    $ cd currency-converter-demo
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
*   If you start using the app at 16:20 ET, then perform a conversion at 16:40
    ET, there's no timer logic to go and fetch the new rates. You can refresh
    the page to make the app go fetch the rates again.
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
