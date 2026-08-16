import { AuditLog } from '../../../src/types';
import { logger } from '../utils/logger';
import { queryPostgres } from '../config/postgres';

export class AuditService {
  private inMemoryLogs: AuditLog[] = [];

  constructor() {
    this.inMemoryLogs.push({
      id: 'log-boot-001',
      userId: 'usr-admin-1',
      username: 'admin_transport',
      action: 'SYSTEM_BOOT',
      resource: 'SYSTEM',
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      result: 'SUCCESS',
      details: 'Transportation microservice initialized with Neon PostgreSQL database.'
    });
  }

  public async logEvent(params: {
    userId?: string;
    username?: string;
    action: string;
    resource: string;
    resourceId?: string;
    result?: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
    details?: string;
    ipAddress?: string;
  }): Promise<AuditLog> {
    const entry: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: params.userId || 'anonymous',
      username: params.username || 'system',
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      timestamp: new Date().toISOString(),
      ipAddress: params.ipAddress || '127.0.0.1',
      result: params.result || 'SUCCESS',
      details: params.details || ''
    };

    this.inMemoryLogs.unshift(entry);
    logger.info(`[AUDIT] ${entry.action} by ${entry.username} on ${entry.resource}: ${entry.result}`);

    // Asynchronously persist to Neon PostgreSQL audit_logs table
    queryPostgres(`
      INSERT INTO audit_logs (id, timestamp, user_id, action, entity, entity_id, details, ip_address, hash)
      VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING;
    `, [
      entry.id,
      entry.userId,
      entry.action,
      entry.resource,
      entry.resourceId || null,
      JSON.stringify({ details: entry.details, result: entry.result, username: entry.username }),
      entry.ipAddress,
      `hash-${entry.id}`
    ]).catch(err => {
      logger.warn('Failed to insert audit log into Postgres', { error: err.message });
    });

    return entry;
  }

  public getRecentLogs(limit: number = 100): AuditLog[] {
    return this.inMemoryLogs.slice(0, limit);
  }
}

export const auditService = new AuditService();

