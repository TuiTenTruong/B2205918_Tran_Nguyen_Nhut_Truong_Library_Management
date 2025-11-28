<template>
	<div class="card book-card h-100 shadow-sm">
		<div class="position-relative overflow-hidden book-card__image-wrapper">
			<img
				:src="coverUrl"
				:alt="book.TenSach"
				class="card-img-top book-card__image"
			/>

			<div
				class="position-absolute top-0 end-0 d-flex gap-1 p-2 align-items-center"
			>
				<span class="small text-danger ms-1">
					{{ book.YeuThich || 0 }}
				</span>
				<button
					class="book-card__icon-btn"
					:class="{
						'book-card__icon-love--active': book._isLikedByMe,
					}"
					@click.stop="$emit('toggle-favorite', book)"
				>
					<i class="fa-solid fa-heart"></i>
				</button>
				<button
					class="book-card__icon-btn"
					:class="{
						'book-card__icon-save--active': book._isSavedByMe,
					}"
					@click.stop="$emit('toggle-save', book)"
				>
					<i class="fa-solid fa-bookmark"></i>
				</button>
			</div>

			<span
				class="badge position-absolute bottom-0 end-0 m-2"
				:class="
					book.SoQuyen > 0
						? 'bg-success-subtle text-success-emphasis'
						: 'bg-danger-subtle text-danger-emphasis'
				"
			>
				{{ book.SoQuyen > 0 ? "Available" : "Out of stock" }}
			</span>
		</div>

		<div class="card-body d-flex flex-column">
			<h6 class="card-title mb-1 book-card__title flex-grow-1">
				{{ book.TenSach }}
			</h6>
			<p class="card-subtitle mb-1 text-muted small">
				{{ book.NguonGoc_TacGia }}
			</p>
			<p class="mb-2 small text-secondary">ID: {{ book.MaSach }}</p>

			<button
				class="btn btn-dark w-100 rounded-pill btn-sm book-card__borrow-btn"
				@click.stop="$emit('borrow', book)"
				:disabled="book.SoQuyen <= 0"
			>
				Borrow Book
			</button>
		</div>
	</div>
</template>
<script>
export default {
	name: "BookCard",
	props: {
		book: {
			type: Object,
			required: true,
		},
	},
	computed: {
		coverUrl() {
			const baseUrl =
				import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
			return `${baseUrl}/uploads/books/${this.book.AnhBia}`;
		},
	},
};
</script>
<style scoped>
.book-card {
	border-radius: 1rem;
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.book-card:hover {
	transform: translateY(-4px);
	box-shadow: 0 0.75rem 1.75rem rgba(15, 23, 42, 0.15);
}

.book-card__image-wrapper {
	height: 260px;
}
.book-card__image {
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: transform 0.3s ease;
}
.book-card:hover .book-card__image {
	transform: scale(1.05);
}

.book-card__icon-btn {
	border: none;
	background: #ffffff;
	width: 32px;
	height: 32px;
	border-radius: 999px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	font-size: 0.8rem;
	box-shadow: 0 2px 6px rgba(15, 23, 42, 0.18);
	transition: transform 0.2s ease, background-color 0.2s ease;
}
.book-card__icon-btn:hover {
	transform: scale(1.1);
}
.book-card__icon-love--active {
	color: red;
}

.book-card__icon-save--active {
	color: yellow;
}

.book-card__title {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
}

.book-card__borrow-btn:hover {
	transform: translateY(-1px);
	box-shadow: 0 0.5rem 1rem rgba(15, 23, 42, 0.25);
}
.book-card__borrow-btn:disabled {
	cursor: not-allowed;
	opacity: 0.65;
}
</style>
