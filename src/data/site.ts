/**
 * Single source of truth for business details and page content.
 * Everything here comes from the original website. Nothing (clients, statistics,
 * certifications, history) has been invented. Update copy here, not in components.
 */

export const contact = {
  email: 'agu.desmond@gmail.com',
  whatsappDisplay: '07474 736418',
  whatsappIntl: '447474736418',
  location: 'Glasgow, Scotland',
  coverage: 'UK-wide',
} as const;

export const links = {
  mailto: (subject = '247CREATIVEHUB Supply Chain Enquiry', body = '') =>
    `mailto:${contact.email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`,
  whatsapp: (text = '') => `https://wa.me/${contact.whatsappIntl}${text ? `?text=${encodeURIComponent(text)}` : ''}`,
};

export const nav = [
  { label: 'Services', href: '/#services', hasMenu: true },
  { label: 'Approach', href: '/#approach' },
  { label: 'Industries', href: '/#industries' },
  { label: 'About', href: '/#about' },
  { label: 'Photo & Video', href: '/photography' },
] as const;

export type ServiceId = 'spend' | 'supplier' | 'inventory' | 'resilience' | 'tender' | 'reporting';

export const services: {
  id: ServiceId;
  title: string;
  short: string;
  tagline: string;
  summary: string;
  includes: string[];
}[] = [
  {
    id: 'spend',
    title: 'Spend Analysis & Cost Reduction',
    short: 'Spend analysis',
    tagline: 'Find value leaks and measurable savings',
    summary:
      'Turn purchasing data into a clear view of value leaks, negotiation opportunities and measurable savings.',
    includes: [
      'Spend grouped by category, supplier and site',
      'Price variance and fragmented spend identified',
      'Negotiation and consolidation opportunities prioritised',
      'Savings measured against an agreed baseline',
    ],
  },
  {
    id: 'supplier',
    title: 'Supplier Performance',
    short: 'Supplier performance',
    tagline: 'Scorecards for OTIF, quality and lead time',
    summary:
      'Build practical scorecards around OTIF, quality, lead time and risk, then use the evidence to improve outcomes.',
    includes: [
      'Scorecards for on-time-in-full, quality and lead time',
      'Supplier risk considered alongside performance',
      'A simple structure for supplier review conversations',
      'Improvement actions, each with an owner',
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory Optimisation',
    short: 'Inventory optimisation',
    tagline: 'Release cash tied up in stock',
    summary:
      'Identify excess, slow-moving and at-risk stock, then release working capital without compromising availability.',
    includes: [
      'Excess, slow-moving and at-risk stock identified',
      'Stock levels reviewed against real demand',
      'Working capital release options, prioritised',
      'Availability protected for the items that matter',
    ],
  },
  {
    id: 'resilience',
    title: 'Supply Chain Resilience',
    short: 'Supply chain resilience',
    tagline: 'Map dependencies before disruption',
    summary:
      'Map critical dependencies and develop alternative sourcing and continuity actions before disruption happens.',
    includes: [
      'Critical suppliers, materials and dependencies mapped',
      'Single-source and concentration risks highlighted',
      'Alternative sourcing options explored',
      'Practical continuity actions agreed in advance',
    ],
  },
  {
    id: 'tender',
    title: 'Procurement & Tender Support',
    short: 'Procurement & tenders',
    tagline: 'Stronger specifications, evaluations and bids',
    summary:
      'Strengthen specifications, sourcing, evaluations, commercial analysis and supplier tender submissions.',
    includes: [
      'Better specifications and sourcing approaches',
      'Structured tender evaluation and commercial analysis',
      'Support preparing supplier tender submissions',
      'Procurement steps your team can repeat',
    ],
  },
  {
    id: 'reporting',
    title: 'Dashboards & Reporting',
    short: 'Dashboards & reporting',
    tagline: 'Excel and Power BI reporting that gets used',
    summary:
      'Create simple Excel and Power BI reporting for spend, suppliers, stock, savings and delivery performance.',
    includes: [
      'Excel and Power BI reporting',
      'Spend, supplier, stock, savings and delivery views',
      'Built around the decisions you actually make',
      'Designed for your team to maintain',
    ],
  },
];

export const processSteps = [
  {
    n: '01',
    title: 'Discover',
    text: 'Understand the challenge, priorities and available data.',
    output: 'An agreed focus and a realistic view of the data available.',
  },
  {
    n: '02',
    title: 'Diagnose',
    text: 'Analyse spend, suppliers, stock, process and risk.',
    output: 'Evidence showing where value, reliability or control is being lost.',
  },
  {
    n: '03',
    title: 'Improve',
    text: 'Prioritise practical actions, owners and measurable outcomes.',
    output: 'A short, prioritised plan with an owner and a measure for each action.',
  },
  {
    n: '04',
    title: 'Embed',
    text: 'Introduce controls and reporting your team can continue.',
    output: 'Simple routines and reporting your team can keep using.',
  },
];
