<template>
	<div class="page">
		<div class="page__header">
			<div class="page__heading">
				<h1 class="page__title">Favorite Books</h1>
				<p class="page__subtitle">Your collection of favorite books</p>
			</div>

			<div class="favorite-summary" v-if="!isLoading">
				<i
					class="fa-solid fa-heart favorite-summary__icon text-danger"
				></i>
				<span class="favorite-summary__text">
					{{ totalFavorites }} favorites
				</span>
			</div>
		</div>

		<div v-if="isLoading" class="page__state">
			<p>Đang tải danh sách yêu thích...</p>
		</div>

		<div v-else>
			<div v-if="favoriteBooks.length === 0" class="page__state">
				<p>Bạn chưa có cuốn sách nào trong danh sách yêu thích.</p>
				<router-link to="/" class="page__state-link">
					Đi tới trang tìm kiếm sách
				</router-link>
			</div>

			<div v-else class="books-grid">
				<BookCard
					v-for="book in favoriteBooks"
					:key="book.MaSach"
					:book="book"
					:show-favorite="true"
					:show-save="false"
					@toggle-favorite="handleToggleFavorite"
					@borrow="handleBorrowBook"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import ReaderService from "@/services/reader.service";
import BookCard from "@/components/BookCard.vue";

export default {
	name: "FavoriteBooks",
	components: {
		BookCard,
	},
	data() {
		return {
			favoriteBooks: [],
			isLoading: false,
		};
	},
	computed: {
		totalFavorites() {
			return this.favoriteBooks.length;
		},
	},
	created() {
		this.loadFavorites();
	},
	methods: {
		// Hàm nạp danh sách sách yêu thích từ localStorage
		async loadFavorites() {
			try {
				this.isLoading = true;
				this.favoriteBooks = await ReaderService.getFavorites();
				this.favoriteBooks = this.favoriteBooks.map((item) => ({
					...item,
					_isLikedByMe: true,
				}));
			} catch (error) {
				console.error(error);
				toast.error("Không đọc được danh sách yêu thích");
				this.favoriteBooks = [];
			} finally {
				this.isLoading = false;
			}
		},

		// Hàm xử lý toggle yêu thích cho 1 cuốn sách
		async handleToggleFavorite(book) {
			try {
				await ReaderService.toggleFavorite(book.MaSach);
				this.favoriteBooks = this.favoriteBooks.filter(
					(b) => b.MaSach !== book.MaSach
				);
				toast.success(
					`Đã ${
						book._isLikedByMe ? "xóa khỏi" : "thêm vào"
					} danh sách yêu thích`
				);
			} catch (error) {
				console.error(error);
				toast.error("Không thể cập nhật danh sách yêu thích");
			}
		},

		// Hàm xử lý mượn sách từ trang yêu thích
		handleBorrowBook(book) {
			console.log("Borrow from favorite page:", book);
			toast.info("Chức năng mượn sách sẽ được cập nhật sau");
		},
	},
};
</script>

<style scoped>
.page {
	flex: 1;
	min-height: 100vh;
	padding: 24px 32px;
	background: #f5f7fb;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
}

.page__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24px;
	gap: 16px;
}

.page__heading {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.page__title {
	font-size: 24px;
	font-weight: 700;
	color: #111827;
}

.page__subtitle {
	font-size: 14px;
	color: #6b7280;
}

.favorite-summary {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 8px 16px;
	border-radius: 999px;
	background: #fee2e2;
}

.favorite-summary__icon {
	font-size: 16px;
	color: #ef4444;
}

.favorite-summary__text {
	font-size: 14px;
	font-weight: 500;
	color: #b91c1c;
}

.page__state {
	margin-top: 40px;
	text-align: center;
	color: #6b7280;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.page__state-link {
	font-size: 14px;
	font-weight: 500;
	text-decoration: none;
	color: #2563eb;
}

.page__state-link:hover {
	text-decoration: underline;
}

.books-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	gap: 20px;
}

/* responsive cho màn nhỏ */
@media (max-width: 768px) {
	.page {
		padding: 16px;
	}

	.page__header {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>
