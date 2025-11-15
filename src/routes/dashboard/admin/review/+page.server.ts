import { db } from '$lib/server/db/index.js';
import { project, user, devlog } from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { eq, and, or, sql } from 'drizzle-orm';
import type { Actions } from './$types';

export async function load({ params, locals }) {
	if (!locals.user) {
		throw error(500);
	}
	if (!locals.user.hasT1Review) {
		// TODO: make the 403 page a script that runs a memory filler to use up ram and crash your browser :D
		throw error(403, { message: 'get out, peasant' });
	}

	// TODO: make the database not stupid so it doesn't have to left join every single devlog
	const projects = await db
		.select({
			project: {
				id: project.id,
				name: project.name,
				description: project.description,
				url: project.url,
			},
			user: {
				id: user.id,
				name: user.name
			},
			timeSpent: sql<number>`COALESCE(SUM(${devlog.timeSpent}), 0)`
		})
		.from(project)
		.leftJoin(devlog, and(eq(project.id, devlog.projectId), eq(devlog.deleted, false)))
		.leftJoin(user, eq(project.userId, user.id))
		.where(and(eq(project.deleted, false), eq(project.status, 'submitted')))
		.groupBy(project.id);

	return {
		projects
	};
}

export const actions = {
	default: async ({ locals, params }) => {
		if (!locals.user) {
			throw error(500);
		}
		if (!locals.user.hasT1Review) {
			throw error(403, { message: 'get out, peasant' });
		}

		const id: number = parseInt(params.id);

		const queriedProject = await db
			.select()
			.from(project)
			.where(
				and(
					eq(project.id, id),
					eq(project.userId, locals.user.id),
					eq(project.deleted, false),
					or(eq(project.status, 'building'), eq(project.status, 'rejected'))
				)
			)
			.get();

		if (!queriedProject) {
			throw error(404);
		}

		// TODO: change when shipping is properly implemented
		await db
			.update(project)
			.set({
				status: 'submitted'
			})
			.where(
				and(
					eq(project.id, queriedProject.id),
					eq(project.userId, locals.user.id),
					eq(project.deleted, false)
				)
			);

		return redirect(303, '/dashboard/projects');
	}
} satisfies Actions;
