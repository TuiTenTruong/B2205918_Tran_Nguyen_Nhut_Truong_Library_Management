<template>
	<nav
		class="sidebar bg-white border-end d-flex flex-column justify-content-between"
		:class="{
			'sidebar--mobile-open': isOpen,
			'd-none d-md-flex': true,
		}"
	>
		<div class="p-3">
			<div class="h5 fw-semibold mb-4">Library Management</div>

			<ul class="nav flex-column gap-1">
				<li class="nav-item">
					<RouterLink
						to="/"
						class="nav-link sidebar-link"
						exact-active-class="sidebar-link--active"
					>
						<i class="fa-solid fa-magnifying-glass me-2"></i>
						Search Books
					</RouterLink>
				</li>

				<li class="nav-item">
					<RouterLink
						to="/favorites"
						class="nav-link sidebar-link"
						active-class="sidebar-link--active"
					>
						<i class="fa-regular fa-heart me-2"></i>
						Favorite Books
					</RouterLink>
				</li>

				<li class="nav-item">
					<RouterLink
						to="/history"
						class="nav-link sidebar-link"
						active-class="sidebar-link--active"
					>
						<i class="fa-regular fa-clock me-2"></i>
						History
					</RouterLink>
				</li>

				<li class="nav-item">
					<RouterLink
						to="/profile"
						class="nav-link sidebar-link"
						active-class="sidebar-link--active"
					>
						<i class="fa-regular fa-user me-2"></i>
						Profile
					</RouterLink>
				</li>
			</ul>
		</div>

		<div class="p-3 border-top small text-muted">
			<div class="fw-semibold mb-1">Contact Us</div>
			<div>TNNT Library</div>
			<div></div>
			<div>library@tnnt.edu.vn</div>

			<button
				class="btn btn-outline-secondary w-100 rounded-pill mt-3 btn-sm"
				@click="handleLogout"
			>
				<i class="fa-solid fa-arrow-right-from-bracket me-1"></i>
				Logout
			</button>
		</div>
	</nav>

	<!-- Sidebar mobile (d-md-none) -->
	<nav
		class="sidebar sidebar--mobile bg-white border-end d-md-none"
		:class="{ 'sidebar--mobile-open': isOpen }"
	>
		<div class="p-3">
			<div class="d-flex align-items-center justify-content-between mb-3">
				<span class="fw-semibold">Menu</span>
				<button
					class="btn btn-sm btn-outline-secondary"
					@click="$emit('close')"
				>
					<i class="fa-solid fa-xmark"></i>
				</button>
			</div>

			<ul class="nav flex-column gap-1">
				<li class="nav-item">
					<RouterLink
						to="/"
						class="nav-link sidebar-link"
						active-class="sidebar-link--active"
						@click="$emit('close')"
					>
						<i class="fa-solid fa-magnifying-glass me-2"></i>
						Search Books
					</RouterLink>
				</li>
			</ul>
		</div>
	</nav>
</template>

<script>
import { logoutUser } from "@/utils/auth";
export default {
	name: "Sidebar",
	props: {
		isOpen: {
			type: Boolean,
			default: false,
		},
	},
	methods: {
		handleLogout() {
			logoutUser(this.$router);
		},
	},
};
</script>

<style scoped>
.sidebar {
	width: 260px;
	z-index: 1050;
}

/* Sidebar desktop: đứng yên khi cuộn */
@media (min-width: 768px) {
	.sidebar {
		position: sticky;
		top: 0;
		align-self: flex-start;
		height: 100vh;
		max-height: 100vh;
		overflow-y: auto; /* nếu không thích có thanh cuộn riêng thì bỏ dòng này */
	}
}

/* Sidebar mobile */
.sidebar--mobile {
	position: fixed;
	top: 0;
	bottom: 0;
	left: -260px;
	transition: left 0.25s ease;
}
.sidebar--mobile-open {
	left: 0;
}

.sidebar-link {
	color: #4b5563;
	border-radius: 999px;
	padding: 0.5rem 0.75rem;
	font-size: 0.9rem;
}
.sidebar-link:hover {
	background-color: #f3f4ff;
	color: #2563eb;
}
.sidebar-link--active {
	background-color: #eef2ff;
	color: #2563eb;
	font-weight: 600;
}
</style>
