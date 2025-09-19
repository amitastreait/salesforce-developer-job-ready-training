# Template-Triggered Prompt Flows in Agentforce / Salesforce

This document describes use cases where **Template-Triggered Prompt Flows** are useful, designs of the flows, sample Prompt Templates, and scenarios. Use it as reference for implementing flows + prompt templates in your org.

---

## What is a Template-Triggered Prompt Flow

- A flow that gets invoked from a Prompt Template; runs logic (filtering, fetching related records, looping) to build **Prompt Instructions** that get inserted into the prompt at runtime.  
- More powerful than simple merge fields because you can do decision logic, loops, fetching related/child records, summarisation etc.  
- Salesforce documentation: “Add a Flow to Your Prompt Template” shows how to build one and include it. :contentReference[oaicite:0]{index=0}  
- Flows can be reusable across multiple prompt templates. :contentReference[oaicite:1]{index=1}

---

## When & Why Use Flows in Prompt Templates

Use flows when you need:

- Dynamic context beyond single record fields  
- Conditional logic and filtering (e.g. only recent, only active, only certain statuses)  
- Summaries / aggregation of related records  
- To reuse same logic across many prompt templates  
- To ensure prompts are grounded in up-to-date CRM / related data

---

## Scenario Summary Table

Here are multiple scenarios, their purpose, flow design, prompt template usage, and benefit, in table form.

| # | Scenario / Goal | Context / Trigger | Flow Design / Key Elements | Prompt Template Usage | Benefit |
|---|------------------|---------------------|-------------------------------|--------------------------|---------|
| 1 | Customer Support: Recent Related Cases Summary | Agent opens a Case; wants summary of recent related Cases for same Account (excluding current case) | Inputs: Case.Id, Account.Id ▪ Get Records: last 5 Cases for Account, exclude current ▪ Filter: only Open or recently Closed ▪ Loop & Add Prompt Instructions summarizing each Case (Subject, Status, LastUpdated) | Template includes something like: `Flow:Get_Related_Cases_Summary` in the prompt where "Here are recent related cases:" | Agents get context quickly; avoids redundant research; improves speed and quality of support responses |
| 2 | Sales: Opportunity Follow-up Recommendations | Rep preparing follow-up email on an Opportunity; wants past outcome & suggestions | Inputs: Opportunity.Id, Account.Id ▪ Get related past Opportunities (won/lost) ▪ Fetch feedback or customer notes ▪ Filter by time and outcome ▪ Loop through and Add Prompt Instructions (product, outcome, feedback) | Prompt uses `Flow:Get_Past_Opportunity_Outcomes` and asks for talk-points / products + draft message | More informed follow-ups; personalized; leverages history to improve win rates |
| 3 | Onboarding / Customer Health Dashboard Insights | Before customer meeting: need a health digest (support, CSAT, usage) | Inputs: Account.Id ▪ Get Records: open/recent cases, CSAT responses, usage metrics ▪ Decision: thresholds (e.g. too many open cases) ▪ Loop & summarise key items ▪ Add Prompt Instructions: counts, trends, issues | Prompt includes `Flow:Get_Health_Metrics` and asks for agenda items, urgent issues, plans | Prepares agents well; identifies issues ahead; improves customer satisfaction by being proactive |
| 4 | Marketing / Customer Engagement: Personalized Newsletter / Offers | When sending newsletter / email to guest/user based on past behavior | Inputs: User/Guest Id, preferences if available ▪ Get past events/offers attended/clicked ▪ Get upcoming events/offers matching interests ▪ Filter duplicates; upcoming only ▪ Loop and summarise events/offers ▪ Add Prompt Instructions | Prompt uses `Flow:Get_Recommended_Events_Offers` and asks to craft engaging email, include call to action etc. | More relevant communications; higher engagement; automates part of content creation |
| 5 | Compliance / Legal / Risk: Policy or Contract Review Summary | Reviewing contract / policy change; need summary of past versions, precedents, risks | Inputs: Policy or Contract Id ▪ Get historical versions / change logs ▪ Get related precedents / legal documents ▪ Filter major changes, recent versions ▪ Loop and summarise each change ▪ Add Prompt Instructions: clause changed, from-to, risk | Prompt uses `Flow:Get_Policy_Change_History` and asks to highlight risks & suggest improved wording | Speeds up legal/compliance review; surfaces risk; helps consistency & clarity in policy writing |
| 6 | (From Trailhead example) Newsletter with Experiences / Events | Marketing or Guest Relations wants to include all experiences/events during a stay in a newsletter | Inputs: Reservation record, Experience records ▪ Get all Experience records for stay ▪ Loop through each experience ▪ Add Prompt Instructions: Experience Name, Location, Details etc. | Prompt template includes `Flow:Get_Experience_Newsletter_Data` to replace static merge fields with flow data; then builds newsletter using that flow resource. :contentReference[oaicite:2]{index=2} | Gives dynamic list of what guest can participate in; automates content; reduces manual merge field maintenance |

---

## Sample End-to-End Example

Below is a detailed flow design + prompt template for a support scenario.

### Flow: `Get_Related_Cases_and_KB_Context`

**Inputs**  
- Case.Id  
- Account.Id  

**Flow Elements**

1. **Get Records** – Related Cases  
   - Fetch Cases where Account = Input.Account.Id AND Case.Id ≠ Input.Case.Id  
   - Order by LastModifiedDate DESC  
   - Limit: 5  

2. **Get Records** – Knowledge Base Articles  
   - Fetch KB_Article (or custom object) where Product = Input.Case.Product__c AND Status = “Active”  

3. **Decision** (optional) – Urgency Flag  
   - E.g. if number of open cases > threshold, mark path to include urgency note  

4. **Loop** – Through Related Cases  
   - For each, **Add Prompt Instructions**:  
     ```
     Case: {Subject}, Status: {Status}, Last Updated: {LastModifiedDate}.
     ```

5. **Loop** – Through KB Articles  
   - For each, **Add Prompt Instructions**:  
     ```
     Article: {Title}, Summary: {Summary_of_Article}.
     ```

6. **Activate** the flow (must be an active flow to be used in prompt templates)

---

### Prompt Template: Support Context + Draft Reply

You are a support agent handling Case: Input:Case.Subject for Account: Input:Case.Account.Name.

Here is relevant context from prior cases and knowledge base:
Flow:Get_Related_Cases_and_KB_Context

Using this, draft a response that:

acknowledges the issue,

refers to similar previous cases if helpful,

links or refers to relevant KB articles (if appropriate),

outlines next steps clearly.
