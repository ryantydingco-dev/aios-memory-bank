import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "smartlead_campaign_and_mailbox_analysis.ipynb"


def md(text: str):
    return {"cell_type": "markdown", "metadata": {}, "source": text}


def code(text: str):
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": text,
    }


nb = {
    "nbformat": 4,
    "nbformat_minor": 5,
    "metadata": {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3",
        },
        "language_info": {"name": "python", "version": "3"},
    },
    "cells": [
    md(
        "# Smartlead campaign and mailbox analysis\n\n"
        "## tl;dr\n\n"
        "- Double down first on **DealThreads staffing owners** and **Creative Alternatives law/retreat audiences**; they have the strongest positive-reply evidence.\n"
        "- Do not scale Race Season or Trade Show Exhibitors unchanged: they generate replies, but few or no positive outcomes.\n"
        "- **159 of 233 mailboxes have zero active campaign assignments**. The idle capacity is concentrated in DealThreads, Vantage Outbound, Calendar Group, and Restoration Homes."
    ),
    md(
        "## Context & Methods\n\n"
        "This notebook records a read-only snapshot from Smartlead on August 23, 2026. "
        "Campaign comparisons use the 12 campaigns with at least one send; portfolio counts retain all 38 campaigns. "
        "Mailbox usage is based on Smartlead's shared-campaign status.\n\n"
        "### Key Assumptions\n\n"
        "- A positive reply is the primary outcome; opens and raw replies are supporting indicators.\n"
        "- Smartlead's displayed reply-rate denominator is not re-derived because the campaign list does not expose its exact denominator.\n"
        "- Recent mailbox bounce percentages are treated as directional only where Smartlead reports insufficient volume for a health grade."
    ),
    md("## Data"),
    code(
        "from pathlib import Path\n"
        "import pandas as pd\n\n"
        "ROOT = Path.cwd()\n"
        "if not (ROOT / 'campaign_performance.csv').exists():\n"
        "    ROOT = Path('smartlead_analysis_2026-08-23')\n"
        "campaigns = pd.read_csv(ROOT / 'campaign_performance.csv')\n"
        "mailboxes = pd.read_csv(ROOT / 'mailbox_family_capacity.csv')\n"
        "portfolio = pd.read_csv(ROOT / 'portfolio_summary.csv')\n"
        "exceptions = pd.read_csv(ROOT / 'mailbox_exceptions.csv')\n"
        "campaigns.shape, mailboxes.shape, portfolio.shape, exceptions.shape"
    ),
    md("### 1. Validate inputs"),
    code(
        "assert len(campaigns) == 12\n"
        "assert int(portfolio.set_index('metric').loc['campaigns_total', 'value']) == 38\n"
        "assert mailboxes['accounts'].sum() == 233\n"
        "assert mailboxes['idle_no_active'].sum() == 159\n"
        "assert mailboxes['daily_capacity'].sum() == 5835\n"
        "assert campaigns['sent'].sum() == 65822\n"
        "assert campaigns['replies'].sum() == 277\n"
        "assert campaigns['positive_replies'].sum() == 14\n"
        "'All reconciliation checks passed'"
    ),
    md("## Results"),
    md("### 2. Rank campaigns by positive-outcome evidence"),
    code(
        "def decision(row):\n"
        "    if row.positive_replies >= 3 and row.positive_share_of_replies_pct >= 3.5:\n"
        "        return 'Double down'\n"
        "    if row.positive_replies >= 1 and row.positive_share_of_replies_pct >= 5:\n"
        "        return 'Scale carefully'\n"
        "    if row.replies >= 10 and row.positive_replies == 0:\n"
        "        return 'Rewrite before scaling'\n"
        "    if row.positive_replies >= 1:\n"
        "        return 'Optimize before scaling'\n"
        "    return 'Hold / insufficient positive signal'\n\n"
        "campaigns['decision'] = campaigns.apply(decision, axis=1)\n"
        "ranked = campaigns.sort_values(['positive_replies', 'positive_share_of_replies_pct', 'replies'], ascending=False)\n"
        "ranked[['campaign','status','sent','replies','positive_replies','positive_share_of_replies_pct','decision']]"
    ),
    md("### 3. Quantify idle capacity by brand family"),
    code(
        "mailboxes['idle_share'] = mailboxes['idle_no_active'] / mailboxes['accounts']\n"
        "mailboxes['healthy_available'] = mailboxes['idle_no_active'] - mailboxes['disconnected']\n"
        "mailboxes.sort_values('idle_no_active', ascending=False)[['family','accounts','idle_no_active','idle_share','daily_capacity','disconnected','never_assigned']]"
    ),
    md("### 4. Produce the recommended first-wave allocation"),
    code(
        "allocation = pd.DataFrame([\n"
        "    {'family':'DealThreads','first_wave_mailboxes':25,'daily_send_ceiling':500,'motion':'Resume Staffing Owners (General); hold the other 25 for a clean adjacent-segment test'},\n"
        "    {'family':'Vantage Outbound','first_wave_mailboxes':10,'daily_send_ceiling':250,'motion':'Dedicated Vantage offer pilot across healthy domains; exclude disconnected/high-bounce exceptions'},\n"
        "    {'family':'Calendar Group','first_wave_mailboxes':10,'daily_send_ceiling':250,'motion':'Dedicated Calendar Group pilot after offer and prior sending issue are confirmed'},\n"
        "    {'family':'Restoration Homes','first_wave_mailboxes':3,'daily_send_ceiling':60,'motion':'One mailbox per domain only after ICP and offer are confirmed'},\n"
        "    {'family':'Creative Alternatives','first_wave_mailboxes':0,'daily_send_ceiling':0,'motion':'No net-new sender scale; reallocate existing active senders toward law/retreat winners'}\n"
        "])\n"
        "allocation"
    ),
    md(
        "## Takeaways\n\n"
        "1. **Resume DealThreads Staffing Owners (General) first.** It generated 5 positive replies and the strongest positive share among scaled campaigns.\n"
        "2. **Concentrate Creative Alternatives on law and retreat-season audiences.** Law National produced 3 positives at scale; Law Firm Administrators is an early supporting signal.\n"
        "3. **Rewrite before scaling reply-heavy/positive-light campaigns.** Race Season has 11 replies and zero positives; Trade Show Exhibitors has 50 replies but only one positive.\n"
        "4. **Activate unused brands through isolated pilots.** Vantage, Calendar Group, and Restoration Homes should not borrow Creative Alternatives messaging or sender identity."
    ),
    ],
}

OUT.write_text(json.dumps(nb, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
validated = json.loads(OUT.read_text(encoding="utf-8"))
assert validated["nbformat"] == 4
assert all(cell["cell_type"] in {"markdown", "code"} for cell in validated["cells"])
print(OUT)
