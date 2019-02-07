# Lighthoose! 💡🏠

This runs [Google Lighthouse][lh] against a dynamic list of [URLs][urls] and saves the results in timestamped directories.

## Running Lighthoose

Lighthoose has two commands, `start` and `scan`.

 - `npm start` - launches a web server for browsing the scan results
 - `npm run scan` - fetches the URL list and scans each URL, saving results in the `reports/` directory

## Updating the URL List

Simply update the [URLs spreadsheet][urls].  If you need access, request it from within the Google Sheet, or email [cpfed@redhat.com](mailto:cpfed@redhat.com).


[lh]: https://developers.google.com/web/tools/lighthouse/
[urls]: https://docs.google.com/spreadsheets/d/1ydprkRRjge9hgu2P_dlnDnkqpScrLbVkUqb21q_EpnI/edit#gid=0
