#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { verifyDocument, VerifyDocumentInputSchema } from './tools/verify-document.tool';
import { lookupPolicy, LookupPolicyInputSchema } from './tools/lookup-policy.tool';
import { checkMedicalNecessity, CheckNecessityInputSchema } from './tools/check-necessity.tool';
import { calculateBenefit, CalculateBenefitInputSchema } from './tools/calculate-benefit.tool';

const server = new Server(
  {
    name: 'papaya-assessment-tools',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Register tools list
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'verifyDocument',
        description: 'Verifies presence, integrity, and validity of required claim documents',
        inputSchema: {
          type: 'object',
          properties: {
            claimId: { type: 'string' },
            documents: { type: 'array' },
            requiredDocTypes: { type: 'array', items: { type: 'string' } },
          },
          required: ['claimId', 'documents'],
        },
      },
      {
        name: 'lookupPolicy',
        description: 'Looks up policy terms, validity dates, annual limits and exclusions',
        inputSchema: {
          type: 'object',
          properties: {
            policyNumber: { type: 'string' },
            serviceDate: { type: 'string' },
            diagnosisIcd10: { type: 'string' },
          },
          required: ['policyNumber', 'serviceDate', 'diagnosisIcd10'],
        },
      },
      {
        name: 'checkMedicalNecessity',
        description: 'Evaluates medical necessity of treatments and medications based on diagnosis',
        inputSchema: {
          type: 'object',
          properties: {
            diagnosisIcd10: { type: 'string' },
            diagnosisDescription: { type: 'string' },
            items: { type: 'array' },
            lengthOfStayDays: { type: 'number' },
          },
          required: ['diagnosisIcd10', 'diagnosisDescription', 'items', 'lengthOfStayDays'],
        },
      },
      {
        name: 'calculateBenefit',
        description: 'Calculates payable amounts, copay, and deductibles according to policy rules',
        inputSchema: {
          type: 'object',
          properties: {
            claimId: { type: 'string' },
            items: { type: 'array' },
            policy: { type: 'object' },
          },
          required: ['claimId', 'items', 'policy'],
        },
      },
    ],
  };
});

// Handle tool invocation
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'verifyDocument': {
        const parsed = VerifyDocumentInputSchema.parse(args);
        const result = await verifyDocument(parsed);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'lookupPolicy': {
        const parsed = LookupPolicyInputSchema.parse(args);
        const result = await lookupPolicy(parsed);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'checkMedicalNecessity': {
        const parsed = CheckNecessityInputSchema.parse(args);
        const result = await checkMedicalNecessity(parsed);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'calculateBenefit': {
        const parsed = CalculateBenefitInputSchema.parse(args);
        const result = await calculateBenefit(parsed);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err: unknown) {
    const error = err as Error;
    return {
      isError: true,
      content: [{ type: 'text', text: `Tool error [${name}]: ${error.message}` }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('Papaya MCP Assessment Server running on stdio\n');
}

main().catch(error => {
  process.stderr.write(`Fatal MCP Server Error: ${error}\n`);
  process.exit(1);
});
