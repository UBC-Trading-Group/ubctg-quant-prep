# 06 — Data sources and APIs

Research pass: 2026-09-26. Focus: US/Canada and globally useful research data. These are source catalogs, not downloaded or audited datasets. Access to a website does not imply permission to redistribute its data. Exact plans, asset coverage and history should be checked before publishing a detailed comparison. Suggested projects are editorial proposals.

## Public economic and regulatory data

| Source | Coverage / audience | Access | Starter-project fit / limitation |
|---|---|---|---|
| [FRED](https://fred.stlouisfed.org/) | US and international macro; B–I | Public portal/API | Inflation, rates and macro dashboard; inspect original source and revision policy. |
| [ALFRED](https://alfred.stlouisfed.org/) | Historical economic-data vintages; I | Public | Compare revised data with information available at a historical decision date. |
| [Statistics Canada developer resources](https://www.statcan.gc.ca/en/developers) | Canadian official statistics; B–I | Public web services/downloads | Canadian macro dashboard; preserve series metadata and release dates. |
| [Bank of Canada Valet API](https://www.bankofcanada.ca/valet/docs) | Canadian central-bank series; B–I | Public API documentation | Canadian rates/FX project; documentation is script-rendered in this reader and needs endpoint-level verification. |
| [US BLS API](https://www.bls.gov/developers/) | Employment, inflation and labour; B–I | Public; API conditions apply | Labour/inflation exploration; account for releases and revisions. |
| [US BEA developer resources](https://www.bea.gov/resources/for-developers) | National/regional economic accounts; I | Public API resources | Growth and industry analysis; limited extracted page text, inspect API docs before use. |
| [US Census APIs](https://www.census.gov/data/developers.html) | Demographic/economic statistics; B–I | Public APIs | Estimation/Fermi benchmarks or regional economic features. |
| [US EIA Open Data](https://www.eia.gov/opendata/) | Energy; I | Public API resources | Energy supply/demand project; distinguish observations from release times. |
| [CFTC Commitments of Traders](https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm) | Futures positioning; I | Public reports | Positioning trends; reporting categories and publication lag matter. |
| [SEC EDGAR APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces) | US company filings/XBRL; I | Public, subject to SEC access guidance | Company-fundamentals or filing-text project; use filing timestamps, not period ends. |

## Academic factors and institutional research

| Source | Coverage / audience | Access | Starter-project fit / limitation |
|---|---|---|---|
| [Kenneth French Data Library](https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html) | Factors and portfolio returns; I; QR | Public research downloads | Factor regression and portfolio comparison; read dataset construction notes. |
| [AQR datasets](https://www.aqr.com/Insights/Datasets) | Momentum, value, quality, BAB and related portfolios; I | Public research datasets | Compare factor families; research returns are not an investable account track record. |
| [WRDS](https://wrds-www.wharton.upenn.edu/) | Institutional research-data gateway; I–A | University/institution subscriptions | Research datasets accessible through participating institutions; do not promise UBC has every product. |

## Commercial and community market-data sources

| Source | Coverage / audience | Access | Starter-project fit / limitation |
|---|---|---|---|
| [Nasdaq Data Link](https://www.nasdaq.com/products/data/data-link) | Financial/alternative datasets; I | Dataset-dependent licensing | Dataset discovery; free availability is product-specific. |
| [Databento](https://databento.com/) | Market-data APIs; I–A | Commercial; plans/entitlements vary | Intraday/microstructure research; inspect venue and schema before selection. |
| [Alpha Vantage](https://www.alphavantage.co/) | Financial-data APIs; B–I | Free/paid product mix | Small data-ingestion project; limits and real-time entitlements vary. |
| [Finnhub](https://finnhub.io/) | Market/fundamental APIs; B–I | Product/plan dependent | Candidate API; public page was script-rendered, detailed coverage not verified. |
| [Stooq](https://stooq.com/) | Market-data portal; B–I | Access/use terms to check | Candidate historical-price source; extracted content insufficient for coverage claims. |
| [LOBSTER](https://lobsterdata.com/) | Order-book research data; A | Access/license to check | Candidate microstructure source; script-rendered site, plans/sample data need follow-up. |
| [Kaggle datasets](https://www.kaggle.com/datasets) | Community-contributed data; B–A | Dataset-specific | Useful discovery, but original provenance, license, missing securities and cleaning must be checked individually. |

## Additional economic, exchange and alternative data

| Source | Use and access note |
|---|---|
| [New York Fed reference rates](https://www.newyorkfed.org/markets/reference-rates) | US reference-rate research; use methodology and publication dates for the chosen rate. |
| [FINRA Data](https://www.finra.org/finra-data) | Regulatory/market-data discovery; public and subscription products have different terms. |
| [Cboe VIX dashboard](https://www.cboe.com/us/indices/dashboard/vix/) | Volatility-index exploration; distinguish index data from tradable futures/options. |
| [CME DataMine](https://www.cmegroup.com/datamine.html) | Exchange historical data; commercial licensing and product-specific coverage. |
| [TMX historical trading data](https://www.tmxinfoservices.com/corporate-and-reference-data/historical-trading-data) | Canadian equities/derivatives source; commercial access, verify asset/product details. |
| [World Bank Open Data](https://data.worldbank.org/) | Country/economic indicators; public discovery for cross-country projects. |
| [IMF Data](https://data.imf.org/en) | International macroeconomic datasets; inspect frequency, definitions and revisions. |
| [BIS Data Portal](https://data.bis.org/) | Banking/credit/financial statistics; useful international context. |
| [OECD Data Explorer](https://data-explorer.oecd.org/) | Comparative economic indicators; script-rendered portal, dataset details not individually audited. |
| [NOAA NCEI](https://www.ncei.noaa.gov/) | Weather/climate data; potential energy/agriculture projects, temporal and geographic joins require care. |
| [GDELT](https://gdeltproject.org/) | News/event data; text/event-analysis projects, substantial source and coverage biases. |
| [Open Source Asset Pricing repository](https://github.com/OpenSourceAP/CrossSection) | Factor signal construction and linked data; inspect dependencies and license per output. |
| [CRSP research products](https://www.crsp.org/research/) | Institutional historical securities data; indexed official product source identified despite homepage redirect. Access is subscription/institution dependent. |
| [yfinance](https://ranaroussi.github.io/yfinance/) | Unofficial open-source Yahoo-data client. Not an official Yahoo API or a license to redistribute market data; inspect provider terms and reliability before choosing. |

The [Bank of Canada Valet how-to guide](https://www.bankofcanada.ca/valet-api-how-to/) provides readable official instructions and says registration is not required. Prefer it as the beginner entry point; actual endpoint execution was not verified here.

## Access limitations and known URL changes

- [SEDAR+](https://www.sedarplus.ca/) returned a bot-protection page. Find regulator documentation for Canadian filings and access rules; do not call this a verified automated API.
- [Open Source Asset Pricing](https://www.openassetpricing.com/) timed out; its project repository above supplies a usable alternative source.
- [Global-q](https://global-q.org/) could not be fetched; verify alternative author/source pages.
- `crsp.org` homepage redirected to Morningstar Market Indexes; use the separately identified research-product destination or WRDS product documentation, not the homepage, for securities-database discovery.
- Treasury Fiscal Data returned a reader error; US economic/rate coverage is supplied by FRED, NY Fed, BLS and BEA in this collection.
- Exact frequencies, history, adjusted prices, delisted securities, point-in-time fields and redistribution rights are product-level questions, not established for every source by this directory. Before a project, choose a specific dataset and check these properties. Avoid a falsely precise vendor comparison based on homepages.
