# 07 — Projects, notebooks, libraries, and reproducible examples

Research pass: 2026-09-26. Public README/documentation inspected; code was not installed or executed. These are learning/research candidates, not verified profitable strategies. Check current releases, licenses and data dependencies when adopting. Open-source software can still require paid data or infrastructure.

## Backtesting and trading infrastructure

| Resource / source | Level; track | Suggested use / limitation |
|---|---|---|
| [QuantConnect LEAN](https://github.com/QuantConnect/Lean) | I–A; QR/QD | Event-driven engine with Python/C# examples; start with an existing example and inspect data assumptions. |
| [Backtesting.py](https://kernc.github.io/backtesting.py/) | B–I; QR | Relatively compact Python backtesting examples; inspect execution/fee assumptions. |
| [Backtrader](https://www.backtrader.com/) | I; QR/QD | Strategy, data-feed and broker abstractions; check package compatibility before choosing. |
| [VectorBT](https://vectorbt.dev/) | I; QR | Vectorized experiments; distinguish open-source package from paid offerings. |
| [Zipline Reloaded](https://github.com/stefan-jansen/zipline-reloaded) | I–A; QR/QD | Zipline-derived workflow; use current project docs rather than old Quantopian setup instructions. |
| [Original Zipline](https://github.com/quantopian/zipline) | I–A; historical reference | Original code reference; not a promise of a current hosted Quantopian service. |
| [pysystemtrade](https://github.com/pst-group/pysystemtrade) | A; QT/QR/QD | Systematic-trading implementation connected to Robert Carver's work; advanced engineering scope. |

## Portfolio construction, pricing, and statistical tools

| Resource / source | Level; track | Suggested use / limitation |
|---|---|---|
| [PyPortfolioOpt](https://pyportfolioopt.readthedocs.io/en/latest/) | I; QR | Compare simple portfolio estimators/constraints; optimization does not solve estimation error. |
| [CVXPY](https://www.cvxpy.org/) | I–A; QR/FE | Build a small constrained portfolio problem from mathematical formulation. |
| [Cvxportfolio](https://www.cvxportfolio.com/en/stable/) | I–A; QR | Portfolio optimization/simulation examples with trading costs. |
| [QuantLib](https://www.quantlib.org/) | A; FE/QD | Pricing/risk library; suitable for reproducing pricing examples after theory. |
| [statsmodels examples](https://www.statsmodels.org/stable/examples/index.html) | I; QR | Regression, time series and statistical diagnostics; adapt a documented example. |
| [scikit-learn examples](https://scikit-learn.org/stable/auto_examples/index.html) | I; QR/QD | Modeling and validation patterns; choose time-aware splits for financial sequences. |

## Worked projects and research repositories

| Resource / source | Level; track | Suggested use / limitation |
|---|---|---|
| [Stefan Jansen — Machine Learning for Trading](https://github.com/stefan-jansen/machine-learning-for-trading) | I–A; QR/QD | Book companion project/code collection; edition and dependencies matter. |
| [Hudson & Thames backtest tutorial](https://github.com/hudson-and-thames/backtest_tutorial) | I; QR | Walk through backtesting mechanics; inspect assumptions rather than copy results. |
| [je-suis-tm/quant-trading](https://github.com/je-suis-tm/quant-trading) | I; QR | Small illustrative scripts/projects. README explicitly assumes frictionless trades; useful as an exercise to add costs, not performance evidence. |
| [Microsoft Qlib](https://github.com/microsoft/qlib) | A; QR/QD | ML research workflow/framework; select dataset/market and evaluate leakage carefully. |
| [FinRL](https://github.com/AI4Finance-Foundation/FinRL) | A; QR/QD | Financial reinforcement-learning research framework; advanced optional track. |
| [ABIDES](https://github.com/abides-sim/abides) | A; QT/QR/QD | Agent-based discrete-event market simulation; results depend on simulated agents. |
| [ABIDES JPMC public](https://github.com/jpmorganchase/abides-jpmc-public) | A; QT/QR/QD | Related simulation framework; compare project scope/version before adopting. |
| [QuantEcon lectures](https://quantecon.org/lectures/) | B–A; QR/QD | Executable economics/computation examples; good source of bounded projects. |
| [Think Bayes notebooks](https://allendowney.github.io/ThinkBayes2/) | B–I; QT/QR | Small Bayesian inference projects with book explanations. |
| [Machine Learning for Factor Investing](https://www.mlfactor.com/) | I–A; QR | Factor-investing learning project sequence; cross-link book entry. |

## Discovery indexes, not automatic endorsements

- [Awesome Quant](https://github.com/wilsonfreitas/awesome-quant): broad categorized library/data index; evaluate individual projects.
- [Awesome Systematic Trading](https://github.com/paperswithbacktest/awesome-systematic-trading): broader strategy/resource discovery; migrated repository owner reflected here.

## More tools and bounded starting tasks

| Resource | Starting task / level |
|---|---|
| [bt](https://pmorissette.github.io/bt/) | B–I: run the synthetic-price example, then compare monthly and quarterly rebalancing with explicit costs. |
| [Riskfolio-Lib](https://riskfolio-lib.readthedocs.io/en/latest/) | I–A: compare equal weights against one risk-based allocation on the same training/test split. |
| [ARCH](https://arch.readthedocs.io/en/latest/) | I: fit a volatility model and evaluate forecasts against a simple historical-volatility baseline. |
| [pandas introductory tutorials](https://pandas.pydata.org/docs/getting_started/intro_tutorials/) | B: clean timestamps, join two series and explicitly report missing observations. |
| [NumPy learning](https://numpy.org/learn/) | B–I: simulate a random walk and compare empirical mean/variance with theoretical values. |
| [SciPy tutorials](https://docs.scipy.org/doc/scipy/tutorial/) | I: compare numerical integration with Monte Carlo for a simple expectation. |
| [Polars](https://docs.pola.rs/) | I: reproduce a pandas aggregation and check identical results before benchmarking. |
| [DuckDB](https://duckdb.org/docs/stable/) | I: query a local columnar dataset with SQL; documentation URL redirects, follow its current destination. |
| [Open Source Asset Pricing code](https://github.com/OpenSourceAP/CrossSection) | A: inspect one signal's construction and data dependencies. Full replication is not a small free-data exercise. |

These are proposed exercises, not executed notebooks. Matching-engine work is covered by LEAN/ABIDES as a study route; a self-contained beginner engine is not claimed here. QSTrader's attempted site was inaccessible; retain as an optional lead. Package installation, dependency compatibility and numerical verification belong to implementation after a project is selected.
