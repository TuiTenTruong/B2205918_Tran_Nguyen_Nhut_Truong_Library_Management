<template>
	<div class="d-flex min-vh-100 bg-body-tertiary position-relative">
		<!-- overlay mobile -->
		<div
			class="layout-overlay"
			:class="{ 'layout-overlay--active': sidebarOpen }"
			@click="toggleSidebar"
		></div>

		<!-- Sidebar -->
		<Sidebar :is-open="sidebarOpen" @close="toggleSidebar" />

		<!-- Main content -->
		<div class="flex-grow-1 d-flex flex-column">
			<HeaderBar @toggle-sidebar="toggleSidebar" />
			<main class="container py-3 py-md-4">
				<router-view />
			</main>
		</div>
	</div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import HeaderBar from "@/components/HeaderBar.vue";

export default {
	name: "MainLayout",
	components: { Sidebar, HeaderBar },
	data() {
		return {
			sidebarOpen: false,
		};
	},
	methods: {
		toggleSidebar() {
			this.sidebarOpen = !this.sidebarOpen;
		},
	},
};
</script>

<style scoped>
.layout-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.45);
	z-index: 1040;
	opacity: 0;
	pointer-events: none;
	transition: opacity 0.25s ease;
}

.layout-overlay--active {
	opacity: 1;
	pointer-events: auto;
}
</style>
