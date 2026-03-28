import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddAuditLogs1704067200000 implements MigrationInterface {
  name = 'AddAuditLogs1704067200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            default: `(LOWER(HEX(RANDOMBLOB(16))))`,
          },
          {
            name: 'actionType',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'entityType',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'entityId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'walletAddress',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'beforeState',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'afterState',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'userAgent',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'correlationId',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for efficient querying
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_logs_userId',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_logs_entityType',
        columnNames: ['entityType'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_logs_actionType',
        columnNames: ['actionType'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_logs_createdAt',
        columnNames: ['createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_logs_entityId',
        columnNames: ['entityId'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_logs_userId_createdAt',
        columnNames: ['userId', 'createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_logs_actionType_createdAt',
        columnNames: ['actionType', 'createdAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_logs');
  }
}
