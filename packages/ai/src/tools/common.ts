/**
 * Common types and utilities for MCP tools
 */

import { Contact, Company, Deal } from '@rolodex/core';

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface ToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

/**
 * Format a contact for display
 */
export function formatContact(contact: Contact): string {
  const lines: string[] = [
    `# ${contact.firstName} ${contact.lastName}`,
    '',
    `**Email:** ${contact.email}`,
  ];

  if (contact.phone) lines.push(`**Phone:** ${contact.phone}`);
  if (contact.title) lines.push(`**Title:** ${contact.title}`);
  if (contact.department) lines.push(`**Department:** ${contact.department}`);
  if (contact.status) lines.push(`**Status:** ${contact.status}`);
  if (contact.tags && contact.tags.length > 0) {
    lines.push(`**Tags:** ${contact.tags.join(', ')}`);
  }
  if (contact.notes) {
    lines.push('', '**Notes:**', contact.notes);
  }

  lines.push('', `*ID: ${contact.id}*`);
  lines.push(`*Created: ${contact.createdAt.toISOString()}*`);

  return lines.join('\n');
}

/**
 * Format a list of contacts
 */
export function formatContactList(contacts: Contact[], total: number): string {
  if (contacts.length === 0) {
    return 'No contacts found.';
  }

  const lines: string[] = [
    `Found ${total} contact(s). Showing ${contacts.length}:`,
    '',
  ];

  for (const contact of contacts) {
    const tags = contact.tags?.length ? ` [${contact.tags.join(', ')}]` : '';
    lines.push(
      `- **${contact.firstName} ${contact.lastName}** <${contact.email}>${tags}` +
        (contact.title ? ` - ${contact.title}` : '')
    );
  }

  return lines.join('\n');
}

/**
 * Format a company for display
 */
export function formatCompany(company: Company): string {
  const lines: string[] = [
    `# ${company.name}`,
    '',
  ];

  if (company.domain) lines.push(`**Domain:** ${company.domain}`);
  if (company.website) lines.push(`**Website:** ${company.website}`);
  if (company.industry) lines.push(`**Industry:** ${company.industry}`);
  if (company.size) lines.push(`**Size:** ${company.size} employees`);
  if (company.status) lines.push(`**Status:** ${company.status}`);
  if (company.revenue) {
    lines.push(`**Revenue:** ${company.revenue.currency} ${company.revenue.value.toLocaleString()}`);
  }
  if (company.phone) lines.push(`**Phone:** ${company.phone}`);
  if (company.email) lines.push(`**Email:** ${company.email}`);
  if (company.tags && company.tags.length > 0) {
    lines.push(`**Tags:** ${company.tags.join(', ')}`);
  }
  if (company.description) {
    lines.push('', '**Description:**', company.description);
  }

  lines.push('', `*ID: ${company.id}*`);
  lines.push(`*Created: ${company.createdAt.toISOString()}*`);

  return lines.join('\n');
}

/**
 * Format a list of companies
 */
export function formatCompanyList(companies: Company[], total: number): string {
  if (companies.length === 0) {
    return 'No companies found.';
  }

  const lines: string[] = [
    `Found ${total} company(ies). Showing ${companies.length}:`,
    '',
  ];

  for (const company of companies) {
    const industry = company.industry ? ` (${company.industry})` : '';
    const status = company.status ? ` [${company.status}]` : '';
    lines.push(`- **${company.name}**${industry}${status}`);
  }

  return lines.join('\n');
}

/**
 * Format a deal for display
 */
export function formatDeal(deal: Deal): string {
  const lines: string[] = [
    `# ${deal.name}`,
    '',
    `**Stage:** ${deal.stage}`,
    `**Status:** ${deal.status}`,
  ];

  if (deal.amount) {
    lines.push(`**Value:** ${deal.amount.currency} ${deal.amount.value.toLocaleString()}`);
  }
  if (deal.probability !== undefined) {
    lines.push(`**Probability:** ${deal.probability}%`);
  }
  if (deal.expectedCloseDate) {
    lines.push(`**Expected Close:** ${deal.expectedCloseDate.toISOString().split('T')[0]}`);
  }
  if (deal.actualCloseDate) {
    lines.push(`**Closed On:** ${deal.actualCloseDate.toISOString().split('T')[0]}`);
  }
  if (deal.source) lines.push(`**Source:** ${deal.source}`);
  if (deal.lostReason) lines.push(`**Lost Reason:** ${deal.lostReason}`);
  if (deal.tags && deal.tags.length > 0) {
    lines.push(`**Tags:** ${deal.tags.join(', ')}`);
  }
  if (deal.description) {
    lines.push('', '**Description:**', deal.description);
  }

  // Stage history
  if (deal.stageHistory && deal.stageHistory.length > 0) {
    lines.push('', '**Stage History:**');
    for (const entry of deal.stageHistory) {
      const entered = entry.enteredAt.toISOString().split('T')[0];
      lines.push(`  - ${entry.stage} (${entered})`);
    }
  }

  lines.push('', `*ID: ${deal.id}*`);
  lines.push(`*Created: ${deal.createdAt.toISOString()}*`);

  return lines.join('\n');
}

/**
 * Format a list of deals
 */
export function formatDealList(deals: Deal[], total: number): string {
  if (deals.length === 0) {
    return 'No deals found.';
  }

  const lines: string[] = [
    `Found ${total} deal(s). Showing ${deals.length}:`,
    '',
  ];

  for (const deal of deals) {
    const value = deal.amount
      ? ` - ${deal.amount.currency} ${deal.amount.value.toLocaleString()}`
      : '';
    const prob = deal.probability !== undefined ? ` (${deal.probability}%)` : '';
    lines.push(`- **${deal.name}** [${deal.stage}]${value}${prob}`);
  }

  return lines.join('\n');
}

/**
 * Format pipeline summary
 */
export function formatPipeline(summary: {
  stages: Array<{ stage: string; count: number; totalValue: number }>;
  totalDeals: number;
  totalValue: number;
}): string {
  const lines: string[] = [
    '# Pipeline Summary',
    '',
    `**Total Deals:** ${summary.totalDeals}`,
    `**Total Value:** $${summary.totalValue.toLocaleString()}`,
    '',
    '## By Stage',
    '',
  ];

  if (summary.stages.length === 0) {
    lines.push('No open deals in pipeline.');
  } else {
    for (const stage of summary.stages) {
      lines.push(
        `| ${stage.stage} | ${stage.count} deals | $${stage.totalValue.toLocaleString()} |`
      );
    }
  }

  return lines.join('\n');
}
