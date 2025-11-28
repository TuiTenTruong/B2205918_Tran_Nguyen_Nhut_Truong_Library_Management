<template>
	<header
		class="bg-white border-bottom d-flex align-items-center justify-content-between px-3 px-md-4"
		style="height: 64px"
	>
		<button
			class="btn btn-link d-md-none p-0 me-2"
			type="button"
			@click="$emit('toggle-sidebar')"
		>
			<i class="fa-solid fa-bars fa-lg"></i>
		</button>

		<div class="fw-semibold d-none d-md-block">Library Management</div>

		<div class="ms-auto d-flex align-items-center gap-3">
			<span class="small text-muted">
				{{ formattedNow }}
			</span>
			<div
				class="rounded-circle d-flex align-items-center justify-content-center"
				style="width: 36px; height: 36px; background-color: #fde047"
			>
				<i class="fa-solid fa-user"></i>
			</div>
		</div>
	</header>
</template>

<script>
export default {
	name: "HeaderBar",
	data() {
		return {
			now: new Date(),
			timer: null,
		};
	},
	computed: {
		formattedNow() {
			return this.now.toLocaleString();
		},
	},
	mounted() {
		this.timer = setInterval(() => {
			this.now = new Date();
		}, 1000);
	},
	unmounted() {
		clearInterval(this.timer);
	},
};
</script>
