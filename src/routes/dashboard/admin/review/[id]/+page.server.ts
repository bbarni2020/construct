import { db } from '$lib/server/db/index.js';
import { project, user, devlog } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq, and, asc, sql, inArray } from 'drizzle-orm';
import type { Actions } from './$types';

export async function load({ locals, params }) {
	if (!locals.user) {
		throw error(500);
	}
	if (!locals.user.hasT1Review) {
		throw error(403, { message: 'get out, peasant' });
	}

	const id: number = parseInt(params.id);

	const queriedProject = await db
		.select({
			project: {
				id: project.id,
				name: project.name,
				description: project.description,
				url: project.url,
				createdAt: project.createdAt,
				status: project.status
			},
			user: {
				id: user.id,
				name: user.name,
				slackID: user.slackId,
				status: user.status
			},
			timeSpent: sql<number>`COALESCE(SUM(${devlog.timeSpent}), 0)`,
			devlogCount: sql<number>`COALESCE(COUNT(${devlog.id}), 0)`,
			lastUpdated: sql<Date>`CASE
      WHEN MAX(${devlog.createdAt}) IS NULL THEN ${project.updatedAt}
      WHEN MAX(${devlog.createdAt}) > ${project.updatedAt} THEN MAX(${devlog.createdAt})
      ELSE ${project.updatedAt}
    END`
		})
		.from(project)
		.leftJoin(devlog, and(eq(project.id, devlog.projectId), eq(devlog.deleted, false)))
		.leftJoin(user, eq(user.id, project.userId))
		.where(and(eq(project.id, id), eq(project.deleted, false)))
		.groupBy(project.id)
		.get();

	if (!queriedProject) {
		throw error(404, { message: 'project not found' });
	}

	const devlogs = await db
		.select()
		.from(devlog)
		.where(and(eq(devlog.projectId, queriedProject.project.id), eq(devlog.deleted, false)))
		.orderBy(asc(devlog.createdAt));

	return {
		project: queriedProject,
		devlogs
	};
}

export const actions = {
	default: async ({ locals, request }) => {
		if (!locals.user) {
			throw error(500);
		}
		if (!locals.user.hasT1Review) {
			throw error(403, { message: 'get out, peasant' });
		}

		const data = await request.formData();
		const statusFilter = data.getAll('status') as (typeof project.status._.data)[];

		const projectFilter = data.getAll('project').map((projectId) => {
			const parsedInt = parseInt(projectId.toString());
			if (!parsedInt) throw error(400, { message: 'malformed project filter' });
			return parseInt(projectId.toString());
		});

		const userFilter = data.getAll('user').map((userId) => {
			const parsedInt = parseInt(userId.toString());
			if (!parsedInt) throw error(400, { message: 'malformed user filter' });
			return parseInt(userId.toString());
		});

		const queriedProject = await db
			.select({
				project: {
					id: project.id,
					name: project.name,
					description: project.description,
					url: project.url,
					createdAt: project.createdAt,
					status: project.status
				},
				user: {
					id: user.id,
					name: user.name
				},
				timeSpent: sql<number>`COALESCE(SUM(${devlog.timeSpent}), 0)`,
				devlogCount: sql<number>`COALESCE(COUNT(${devlog.id}), 0)`
			})
			.from(project)
			.leftJoin(devlog, and(eq(project.id, devlog.projectId), eq(devlog.deleted, false)))
			.leftJoin(user, eq(user.id, project.userId))
			.where(
				and(
					eq(project.deleted, false),
					statusFilter.length > 0 ? inArray(project.status, statusFilter) : undefined,
					projectFilter.length > 0 ? inArray(project.id, projectFilter) : undefined,
					userFilter.length > 0 ? inArray(project.userId, userFilter) : undefined
				)
			)
			.groupBy(project.id)
			.get();

		return {
			projects,
			fields: {
				status: statusFilter,
				project: projectFilter,
				user: userFilter
			}
		};
	}
} satisfies Actions;
