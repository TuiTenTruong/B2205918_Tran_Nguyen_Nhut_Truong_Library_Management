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
						active-class="sidebar-link--active"
					>
						<i class="fa-solid fa-magnifying-glass me-2"></i>
						Search Books
					</RouterLink>
				</li>

				<li class="nav-item">
					<a class="nav-link sidebar-link disabled">
						<i class="fa-regular fa-heart me-2"></i>
						Favorite Books
					</a>
				</li>

				<li class="nav-item">
					<a class="nav-link sidebar-link disabled">
						<i class="fa-regular fa-bookmark me-2"></i>
						Saved Books
					</a>
				</li>

				<li class="nav-item">
					<a class="nav-link sidebar-link disabled">
						<i class="fa-regular fa-clock me-2"></i>
						History
					</a>
				</li>

				<li class="nav-item">
					<a class="nav-link sidebar-link disabled">
						<i class="fa-regular fa-user me-2"></i>
						Profile
					</a>
				</li>

				<li class="nav-item">
					<a class="nav-link sidebar-link disabled">
						<i class="fa-regular fa-comments me-2"></i>
						Chatbot
					</a>
				</li>
			</ul>
		</div>

		<div class="p-3 border-top small text-muted">
			<div class="fw-semibold mb-1">Contact Us</div>
			<div>Kalasalingam University</div>
			<div>IT Department</div>
			<div>library@klu.ac.in</div>

			<button
				class="btn btn-outline-secondary w-100 rounded-pill mt-3 btn-sm"
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
export default {
	name: "Sidebar",
	props: {
		isOpen: {
			type: Boolean,
			default: false,
		},
	},
};
</script>

<style scoped>
.sidebar {
	width: 260px;
	z-index: 1050;
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
</style>
