# 09 — Papers and research collections

Checked 2026-09-26. This is a foundational reading and discovery collection, not an exhaustive bibliography of quantitative finance. Topic selection and proposed exercises are editorial judgments. Abstract/source inspection does not mean each paper was replicated. Publisher access may require a library; author-hosted manuscripts and preprints can differ from the final article.

## Foundational and applied readings

| Paper / source | Topic and level | Why include / possible exercise |
|---|---|---|
| [Portfolio Selection — Markowitz](https://onlinelibrary.wiley.com/doi/10.1111/j.1540-6261.1952.tb01525.x) | I; portfolio theory | Mean–variance framework; plot an efficient frontier and show sensitivity to estimated inputs. |
| [Common risk factors in the returns on stocks and bonds — Fama/French](https://www.sciencedirect.com/science/article/pii/0304405X93900235) | I–A; asset pricing | Factor-model foundations; pair with French's data library. |
| [Efficient Capital Markets: II — Fama](https://onlinelibrary.wiley.com/doi/10.1111/j.1540-6261.1991.tb04636.x) | I–A; empirical finance | Market-efficiency testing and interpretation; a reading-discussion resource rather than a trading recipe. |
| [Time Series Momentum — Moskowitz/Ooi/Pedersen](https://www.aqr.com/Insights/Research/Journal-Article/Time-Series-Momentum) | I–A; systematic strategies | Study trend signals, asset scaling and evaluation; compare with transaction-cost assumptions. |
| [Value and Momentum Everywhere — Asness/Moskowitz/Pedersen](https://www.aqr.com/Insights/Research/Journal-Article/Value-and-Momentum-Everywhere) | I–A; cross-asset factors | Compare signal families; link associated AQR datasets. |
| [Betting Against Beta — Frazzini/Pedersen](https://www.aqr.com/Insights/Research/Journal-Article/Betting-Against-Beta) | A; factor construction | Understand beta, leverage assumptions and portfolio constraints. |
| [Honey, I Shrunk the Sample Covariance Matrix — Ledoit/Wolf](https://ledoit.net/honey.pdf) | I–A; estimation | Compare covariance estimators in portfolio optimization. Author PDF was indexed; direct reader fetch varied by hostname. |
| [The Pricing of Options and Corporate Liabilities — Black/Scholes](https://www.journals.uchicago.edu/doi/pdf/10.1086/260062) | A; FE | Pricing and replication foundations; implement a pricing/Greeks exercise after prerequisite study. |
| [High-frequency trading in a limit order book — Avellaneda/Stoikov](https://math.nyu.edu/inmemoriam/avellaneda/HighFrequencyTrading.pdf) | A; market making | Explore inventory-sensitive quoting under the model's assumptions. A simulator is not evidence of live profitability. |
| [Continuous Auctions and Insider Trading — Kyle](https://people.stern.nyu.edu/lpederse/courses/LAP/papers/Information%2CFundamental/Kyle85.pdf) | A; microstructure | Information and price impact. University-hosted reading copy; consult original publication for citation. |
| [The Probability of Backtest Overfitting — Bailey et al.](https://www.davidhbailey.com/dhbpapers/backtest-prob.pdf) | I–A; validation | Simulate selection among many strategies and examine selection bias. |
| [The Deflated Sharpe Ratio — Bailey/López de Prado](https://www.davidhbailey.com/dhbpapers/deflated-sharpe.pdf) | A; performance evaluation | Examine selection and non-normality corrections; report the assumptions and trial-count uncertainty. |
| [Empirical Asset Pricing via Machine Learning — Gu/Kelly/Xiu](https://www.nber.org/papers/w25398) | A; ML/asset pricing | Compare model classes and evaluation design; a full replication has substantial data requirements. |
| [Financial Machine Learning — Kelly/Xiu](https://www.nber.org/papers/w31502) | A; survey | Map the literature before selecting a project. Indexed publisher summary inspected; direct fetch inconsistent. |
| [Deep Hedging — Buehler et al.](https://arxiv.org/abs/1802.03042) | A; ML/FE | Hedging with market frictions; compare to a simpler hedging baseline. |
| [DeepLOB — Zhang/Zohren/Roberts](https://arxiv.org/abs/1808.03668) | A; order-book ML | Sequence models for order-book prediction; focus on temporal validation and dataset limitations. |

## Research hubs and replication sources

| Collection | Use / limitation |
|---|---|
| [arXiv quantitative finance](https://arxiv.org/archive/q-fin) | New preprints by topic. Posting is not peer review or an endorsement. |
| [NBER financial ML survey and references](https://www.nber.org/papers/w31502) | Literature map; working-paper and published versions can differ. |
| [AQR research](https://www.aqr.com/Insights) | Practitioner papers; pair with its [datasets](https://www.aqr.com/Insights/Datasets). Commercial author's perspective should remain visible. |
| [Two Sigma insights](https://www.twosigma.com/insights/) | Research and engineering; filter substantive technical pieces from corporate announcements. |
| [Marco Avellaneda papers](https://math.nyu.edu/inmemoriam/avellaneda/Papers.html) | Mathematical-finance papers and author material. |
| [Marcos López de Prado publications](https://www.quantresearch.org/Publications.htm) | Financial ML, portfolio construction and validation; author bibliography. |
| [David Bailey papers](https://www.davidhbailey.com/dhbpapers/) | Author preprints including backtest methodology; broader mathematics also included. |
| [Tobias Moskowitz research data](https://faculty.som.yale.edu/tobymoskowitz/research/data/) | Connections between papers and data; useful replication discovery. |
| [Kenneth French Data Library](https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html) | Factor portfolio definitions and data. Cross-listed intentionally with data category. |
| [IAQF](https://www.iaqf.org/) | Student competition papers and advanced seminars; educational project examples, not canonical findings. |

## Editorial scope

Publish themed reading sequences rather than a chronological paper dump: portfolio estimation; factors; validation; market making; derivatives; financial ML. Begin each with prerequisites, one anchor paper, its data/code if available and a modest reproduction target.

Almgren–Chriss optimal execution was investigated and its identity/content confirmed, but the accessible copy found was an unrelated mirror; hold its direct download until an author/publisher destination is established. SSRN search was reader-blocked; use author bibliographies rather than representing inaccessible search results as individually reviewed papers. Specialist credit, rates and stochastic-volatility literatures are better surfaced through the textbooks and their bibliographies until the club actually runs those reading groups.
