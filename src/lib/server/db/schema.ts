import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: integer('id').primaryKey(), // User ID
	slackId: text('slack_id').notNull().unique(), // Slack ID
	profilePicture: text('profilePicture').notNull(), // Profile pic URL
	name: text('name').notNull(), // Username on Slack

	status: text('status', { enum: ['trusted', 'default', 'warned', 'banned'] })
		.notNull()
		.default('default'), // User status
	// TODO: implement this properly everywhere

	hasSessionAuditLogs: integer('has_session_audit_logs', { mode: 'boolean' })
		.notNull()
		.default(false), // Has access to session audit logs
	hasProjectAuditLogs: integer('has_project_audit_logs', { mode: 'boolean' })
		.notNull()
		.default(false), // Has access to project audit logs

	hasT1Review: integer('has_t1_review', { mode: 'boolean' }).notNull().default(false), // Has access to t1 review
	hasT2Review: integer('has_t2_review', { mode: 'boolean' }).notNull().default(false), // Has access to t2 review

	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(new Date(Date.now())), // Account creation timestamp
	lastLoginAt: integer('last_login_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(new Date(Date.now())) // Last login timestamp
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull()
});

// TODO: implement this
export const sessionAuditLog = sqliteTable('session_audit_log', {
	id: integer('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => user.id),
	type: text('type', { enum: ['login', 'logout', 'session_expire'] }).notNull(),
	timestamp: integer('timestamp', { mode: 'timestamp_ms' }).notNull()
});

export const project = sqliteTable('project', {
	id: integer('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => user.id),

	name: text('name'),
	description: text('description'),
	url: text('url'),

	status: text('status', {
		enum: [
			'building',
			'submitted',
			't1_approved',
			't2_approved',
			'finalized',
			'rejected',
			'rejected_locked'
		] // rejected == can still re-ship, rejected_locked == can't re-ship
	})
		.notNull()
		.default('building'),
	deleted: integer('deleted', { mode: 'boolean' }).notNull().default(false), // Projects aren't actually deleted, just marked as deleted (I cba to deal with foreign key delete issues for audit logs)

	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(new Date(Date.now())),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(new Date(Date.now()))
});

// TODO: implement this
export const projectAuditLog = sqliteTable('project_audit_log', {
	id: integer('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => user.id), // Project owner
	actionUserId: integer('action_user_id')
		.notNull()
		.references(() => user.id), // User who carried out the action (can be different to userId if it was done by an admin)
	projectId: integer('project_id')
		.notNull()
		.references(() => project.id),
	type: text('type', { enum: ['create', 'update', 'delete'] }).notNull(),

	name: text('name'),
	description: text('description'),
	url: text('url'),

	timestamp: integer('timestamp', { mode: 'timestamp_ms' }).notNull()
});

// T1 review: approve/reject
// TODO: implement this
export const t1Review = sqliteTable('t1_review', {
	id: integer('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => user.id),
	projectId: integer('project_id')
		.notNull()
		.references(() => project.id),

	feedback: text('feedback'),
	notes: text('notes'),
	action: text('action', { enum: ['approve', 'reject', 'reject_lock'] }).notNull(),

	timestamp: integer('timestamp', { mode: 'timestamp_ms' }).notNull()
});

// TODO: implement this
export const t2Review = sqliteTable('t2_review', {
	id: integer('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => user.id),
	projectId: integer('project_id')
		.notNull()
		.references(() => project.id),

	feedback: text('feedback'),
	notes: text('notes'),
	multiplier: real('multiplier').notNull().default(1.0),

	timestamp: integer('timestamp', { mode: 'timestamp_ms' }).notNull()
});

export const devlog = sqliteTable('devlog', {
	id: integer('id').primaryKey(),
	userId: integer('user_id').references(() => user.id),
	projectId: integer('project_id')
		.notNull()
		.references(() => project.id),

	description: text('description').notNull(),
	timeSpent: integer('time_spent').notNull(), // Time spent in mins
	image: text('image').notNull(),
	model: text('model'),

	deleted: integer('deleted', { mode: 'boolean' }).notNull().default(false), // Works the same as project deletion
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Project = typeof project.$inferSelect;

export type SessionAuditLog = typeof sessionAuditLog.$inferSelect;
export type ProjectAuditLog = typeof projectAuditLog.$inferSelect;

export type T1Review = typeof t1Review.$inferSelect;
export type T2Review = typeof t2Review.$inferSelect;
