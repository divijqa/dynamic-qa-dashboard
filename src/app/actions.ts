'use server'

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interface matching our Prisma Metric schema structure
export interface DashboardMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

/**
 * Server Action: Fetches real-time telemetry metrics directly from the PostgreSQL database
 */
export async function getDashboardMetrics(): Promise<DashboardMetric[]> {
  try {
    // 1. Fetch data from the database using Prisma Client
    const dbMetrics = await prisma.metric.findMany({
      orderBy: {
        timestamp: 'desc'
      },
      take: 3 // Retrieve the latest 3 analytical parameters
    });

    // 2. If the database is completely empty (no seed data yet), fall back to standard base values
    if (dbMetrics.length === 0) {
      return [
        { id: '1', title: 'Active Automations (DB Fallback)', value: '1,248', change: '+12%', isPositive: true },
        { id: '2', title: 'API Response Time (DB Fallback)', value: '42ms', change: '-4%', isPositive: true },
        { id: '3', title: 'System Error Rate (DB Fallback)', value: '0.04%', change: '+0.01%', isPositive: false },
      ];
    }

    // 3. Map the raw database records into our cleaner dashboard data format
    return dbMetrics.map(item => ({
      id: item.id,
      title: item.title,
      value: item.value.toString(), // Convert numerical values to display strings
      change: '+0%', // Placeholder calculation metrics
      isPositive: true
    }));

  } catch (error) {
    console.error('❌ Failed to fetch database metrics:', error);
    // Return base arrays if database connectivity drops entirely
    return [
      { id: 'err-1', title: 'Connection State Error', value: 'Offline', change: '0%', isPositive: false }
    ];
  }
}
