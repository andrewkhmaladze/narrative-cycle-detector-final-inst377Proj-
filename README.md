# Narrative Cycle Detector

## Project Description

Narrative Cycle Detector - The web application that checks whether an investment-related topic is gaining public and market attention.

The user enters a topic, like `large language models`, the the app uses Supabase to map that topic to a related ETF. Continuing my prior example, `large language models` is mapped to `BOTZ`.

Then the app uses backend API routes to collect data from:

-Alpha Vantage for ETF price data
-NewsAPI for news article data
-Zenserp for search result visibility data
-Supabase for topic mappings and search history

At the top of the app display, result cards are shown. Then the ETF closing price chart and newsAPI daily article trend chart follows as the user scrolls down. Lastly, the weekly Narrative Strength Score is shown as well as the acompanying explanations.

The Weekly Narrative Strength Score is a simple project formula:

```text
Narrative Strength Score =
(7-Day News Article Count ÷ 10)
+ (Search Visibility Score ÷ 100)
+ (7-Day ETF Percentage Change x 2)


```

## Target Browsers

This project is for and was tested on a desktop running Google Chrome (The project was not tested on or meant for iOS/Android mobile use).


## Developer Manual

[to view the Developer Manual](docs/developer-manual.md)