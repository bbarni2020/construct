<script lang="ts">
	let { data } = $props();

	let projects = $derived(data.projects);
</script>

<h1 class="mt-5 mb-3 font-hero text-3xl font-medium">Review</h1>

<div class="flex flex-row gap-5">
	<div class="themed-box grow p-3">
		<h2 class="mb-2 text-xl font-bold">Filter & Sort</h2>
		<form method="POST" class="grid grid-cols-3 gap-3">
			<!-- Project status -->
			<label class="flex flex-col gap-1">
				<span class="font-medium">Status</span>
				<select
					class="border-3 border-amber-700 bg-amber-900 fill-amber-50 p-2 text-sm ring-amber-900 placeholder:text-amber-900 active:ring-3 grow"
					name="status"
					value="submitted"
					multiple
				>
					<option value="building">Building</option>
					<option value="submitted">Submitted</option>
					<option value="t1_approved">Review approved</option>
					<option value="t2_approved">YSWS review approved</option>
					<option value="finalized">Finalized</option>
					<option value="rejected">Rejected</option>
					<option value="rejected_locked">Rejected (locked)</option>
				</select>
			</label>

			<!-- Project -->
			<label class="flex flex-col">
				<span class="font-medium mb-1">Project</span>
				<input
                    type="text"
                    placeholder="search"
					class="themed-input-light border-b-0 py-1.5"
				/>
                <select
					class="themed-input-light grow"
					name="project"
					multiple
				>
					{#each projects as project}
						<option value={project.project.id} class="truncate">{project.project.name}</option>
					{/each}
				</select>
			</label>
		</form>
	</div>
	<div class="themed-box grow p-3 min-w-[30%]">
		<h2 class="text-xl font-bold">Leaderboard</h2>
	</div>
</div>
