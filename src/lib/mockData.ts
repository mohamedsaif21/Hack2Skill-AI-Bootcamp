export interface RiskClause {
  id: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  clauseName: string;
  excerpt: string;
  explanation: string;
  location: string; // e.g., "p. 4 §2.1"
  lineIndex: number; // approximate line index in the document text to position the rail tab
}

export interface MockDocument {
  id: string;
  name: string;
  status: "ready" | "processing" | "error";
  size: string;
  uploadedAt: string;
  text: string;
  risks: RiskClause[];
}

export const MOCK_DOCUMENTS: MockDocument[] = [
  {
    id: "employment-agreement",
    name: "employment_agreement_john_doe.pdf",
    status: "ready",
    size: "1.2 MB",
    uploadedAt: "June 19, 2026 14:15",
    text: `EMPLOYMENT AGREEMENT

This Employment Agreement (the "Agreement") is entered into as of June 1, 2026, by and between Vertex Technologies LLC (the "Company") and John Doe (the "Employee").

1. POSITION AND DUTIES
The Employee shall serve in the position of Senior Solutions Engineer. The Employee will report directly to the Chief Technology Officer and perform such duties as are customary for this position.

2. COMPENSATORY STRUCTURE AND BENEFITS
The Employee shall receive a base salary of $145,000 per annum, paid in accordance with the Company's standard payroll schedule. The Employee is eligible for standard health benefits and 15 days of paid time off (PTO) annually.

3. INTELLECTUAL PROPERTY ASSIGNMENT
The Employee hereby covenants, agrees, and assigns to the Company all rights, title, and interest in and to all inventions, software, designs, algorithms, improvements, and business plans developed, authored, or conceived by the Employee during the course of employment, including any ideas generated during off-hours, using personal electronic equipment, or unrelated to the Company’s primary line of business.

4. NON-COMPETE RESTRICTIONS AND COVENANTS
For a period of thirty-six (36) months following the termination of this Agreement for any reason, the Employee shall not, directly or indirectly, engage in, operate, manage, control, participate in, perform services for, or consult with any business entity that competes, or plans to compete, with the business of the Company within the United States of America.

5. TERMINATION AND SEVERANCE
The Company may terminate the Employee's employment at any time, with or without cause, effective immediately upon written notice. In the event of termination without cause, the Employee shall receive 2 weeks of base salary as severance. The Employee may terminate this employment upon giving no less than ninety (90) days prior written notice.

6. MISCELLANEOUS PROVISIONS
This Agreement constitutes the entire understanding of the parties. Any modification must be in writing. This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware.`,
    risks: [
      {
        id: "risk-noncompete",
        severity: "HIGH",
        clauseName: "Restrictive Non-Compete",
        excerpt: "For a period of thirty-six (36) months following the termination of this Agreement for any reason, the Employee shall not, directly or indirectly, engage in, operate, manage, control, participate in, perform services for, or consult with any business entity that competes, or plans to compete, with the business of the Company within the United States of America.",
        explanation: "A 36-month post-employment non-compete covering the entire United States is extremely restrictive, likely unenforceable in many jurisdictions, and severely impacts future employment options.",
        location: "p. 3 §4.1",
        lineIndex: 14,
      },
      {
        id: "risk-ip-assignment",
        severity: "MEDIUM",
        clauseName: "Overbroad IP Assignment",
        excerpt: "assigns to the Company all rights, title, and interest in and to all inventions, software, designs, algorithms, improvements, and business plans developed, authored, or conceived by the Employee during the course of employment, including any ideas generated during off-hours, using personal electronic equipment, or unrelated to the Company’s primary line of business.",
        explanation: "Assigning off-hours personal projects created with personal equipment is overbroad and usurps employee IP rights outside of direct work hours and duties.",
        location: "p. 2 §3.0",
        lineIndex: 11,
      },
      {
        id: "risk-termination",
        severity: "LOW",
        clauseName: "Asymmetrical Notice Clause",
        excerpt: "The Company may terminate the Employee's employment at any time, with or without cause, effective immediately upon written notice... The Employee may terminate this employment upon giving no less than ninety (90) days prior written notice.",
        explanation: "The contract enforces immediate termination capability for the company, while demanding a lengthy 90-day notice period from the employee.",
        location: "p. 3 §5.0",
        lineIndex: 17,
      }
    ]
  },
  {
    id: "saas-terms",
    name: "cloudflare_enterprise_terms.docx",
    status: "ready",
    size: "420 KB",
    uploadedAt: "June 19, 2026 15:42",
    text: `ENTERPRISE SUBSCRIPTION AGREEMENT

This Enterprise Subscription Agreement ("Agreement") governs the purchase and use of the Cloud Services provided by CloudNexus Inc. ("Provider").

1. SCOPE OF SERVICES
Provider grants Customer a non-exclusive, non-transferable right to access and use the Cloud Services solely for Customer’s internal operations.

2. SERVICE LEVEL AGREEMENT (SLA) & PERFORMANCE
Provider warrants a Service Availability SLA of 99.9% in any calendar month. In the event of a breach of this warranty, Customer’s sole and exclusive remedy, and Provider’s entire liability, shall be the receipt of a service credit equal to 5% of the monthly fee. Under no circumstances shall Provider's cumulative liability for outages exceed $500.

3. FEES AND AUTOMATIC RENEWALS
Customer agrees to pay all fees specified in the Order Form. The initial subscription term will automatically renew for successive 12-month periods. The fees for each renewal period will automatically increase by fifteen percent (15%) over the fees of the preceding period without further notice.

4. DATA PROCESSING AND RETENTION
Provider collects and processes Customer Data in accordance with its Privacy Policy. Upon termination of the subscription or this Agreement, Customer Data will be permanently and irreversibly purged from Provider's active and backup database servers within fourteen (14) calendar days, with no archive files preserved.

5. TERM AND TERMINATION
This Agreement remains in effect until the subscription expires or is terminated. Either party may terminate for material breach if the breaching party fails to cure within 30 days of receipt of written notice.`,
    risks: [
      {
        id: "risk-sla-limitation",
        severity: "HIGH",
        clauseName: "Exclusionary SLA & Low Liability Cap",
        excerpt: "Customer’s sole and exclusive remedy, and Provider’s entire liability, shall be the receipt of a service credit equal to 5% of the monthly fee. Under no circumstances shall Provider's cumulative liability for outages exceed $500.",
        explanation: "Capping outage liability at $500 and excluding all other damages protects the provider but leaves the customer vulnerable to business disruptions without meaningful recourse.",
        location: "p. 2 §2.0",
        lineIndex: 5,
      },
      {
        id: "risk-price-increase",
        severity: "MEDIUM",
        clauseName: "Unnotified Automatic Fee Increase",
        excerpt: "The fees for each renewal period will automatically increase by fifteen percent (15%) over the fees of the preceding period without further notice.",
        explanation: "Automatic 15% year-over-year pricing escalators without notice can compound rapidly and budget-lock client operations.",
        location: "p. 3 §3.0",
        lineIndex: 8,
      },
      {
        id: "risk-data-retention",
        severity: "LOW",
        clauseName: "Short Data Purging Window",
        excerpt: "Upon termination of the subscription or this Agreement, Customer Data will be permanently and irreversibly purged from Provider's active and backup database servers within fourteen (14) calendar days, with no archive files preserved.",
        explanation: "14 days is a short grace period to export critical business data before permanent deletion upon contract termination.",
        location: "p. 4 §4.0",
        lineIndex: 11,
      }
    ]
  }
];

export const MOCK_QNA: Record<string, Record<string, { answer: string; citations: string[] }>> = {
  "employment-agreement": {
    "what are the non-compete terms?": {
      answer: "The agreement contains a very restrictive non-compete clause. It binds the Employee for thirty-six (36) months [p. 3 §4.1] post-termination. The geographic scope is exceptionally broad, prohibiting competitive activities, consultation, or participation with any competing business entity within the entire United States of America [p. 3 §4.1]. This length and scope pose a high risk to future career flexibility.",
      citations: ["p. 3 §4.1"]
    },
    "how is intellectual property handled?": {
      answer: "Under the contract, the Employee assigns all rights, title, and interest [p. 2 §3.0] to the Company. This includes all inventions, software, algorithms, and business plans developed during employment. Significantly, this assignment also captures ideas generated during off-hours, using personal equipment, or completely unrelated to the Company's business [p. 2 §3.0], which constitutes a medium risk.",
      citations: ["p. 2 §3.0"]
    },
    "what is the notice period for termination?": {
      answer: "The notice period in the contract is highly asymmetrical. The Company is permitted to terminate the Employee's employment with or without cause immediately [p. 3 §5.0] upon written notice. However, if the Employee wishes to terminate, they must provide at least ninety (90) days prior written notice [p. 3 §5.0].",
      citations: ["p. 3 §5.0"]
    },
    "default": {
      answer: "This document is an Employment Agreement between Vertex Technologies LLC and John Doe. The main risks flagged in this contract relate to the three-year nationwide non-compete restriction [p. 3 §4.1], the broad intellectual property assignment covering off-hours and personal devices [p. 2 §3.0], and the asymmetrical termination notice requirement [p. 3 §5.0]. Let me know if you would like me to unpack any of these specific sections.",
      citations: ["p. 3 §4.1", "p. 2 §3.0", "p. 3 §5.0"]
    }
  },
  "saas-terms": {
    "what is the SLA credit?": {
      answer: "The service provider promises a Service Availability SLA of 99.9% [p. 2 §2.0]. However, if they fail to meet this threshold, the Customer's sole and exclusive remedy is limited to a service credit of 5% [p. 2 §2.0] of the monthly fee. Crucially, the total cumulative liability for outages is capped at just $500 [p. 2 §2.0], meaning the customer cannot recover actual operational damages.",
      citations: ["p. 2 §2.0"]
    },
    "does pricing increase?": {
      answer: "Yes, the contract includes an automatic price renewal clause. Upon completion of the initial term, the contract auto-renews for 12-month periods, with the fees increasing by 15% automatically [p. 3 §3.0] over the preceding period. This escalation takes place without any further notice [p. 3 §3.0] to the customer.",
      citations: ["p. 3 §3.0"]
    },
    "what happens to customer data?": {
      answer: "Upon termination of the agreement or subscription, the Provider is required to purge Customer Data within 14 calendar days [p. 4 §4.0]. This deletion is permanent and irreversible, applying to active and backup servers, with no archive files preserved [p. 4 §4.0]. This creates a low risk of losing data if transition planning is delayed.",
      citations: ["p. 4 §4.0"]
    },
    "default": {
      answer: "This is a SaaS Subscription Agreement for Cloud Services by CloudNexus Inc. Key risk alerts include the restrictive SLA liability cap of $500 [p. 2 §2.0], the automatic annual 15% price escalator without notice [p. 3 §3.0], and a short 14-day deletion window for customer data post-termination [p. 4 §4.0].",
      citations: ["p. 2 §2.0", "p. 3 §3.0", "p. 4 §4.0"]
    }
  }
};
