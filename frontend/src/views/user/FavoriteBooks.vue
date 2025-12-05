<template>
	<div class="page">
		<div class="page__header">
			<div class="page__heading">
				<h1 class="page__title">Sách yêu thích</h1>
				<p class="page__subtitle">Bộ sưu tập sách yêu thích của bạn</p>
			</div>

			<div class="favorite-summary" v-if="!isLoading">
				<i
					class="fa-solid fa-heart favorite-summary__icon text-danger"
				></i>
				<span class="favorite-summary__text">
					{{ totalFavorites }} cuốn
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
		<div
			v-if="showBorrowModal && selectedBook"
			class="borrow-modal-backdrop"
		>
			<div class="borrow-modal">
				<h5 class="borrow-modal__title">Xác nhận mượn sách</h5>

				<div class="borrow-modal__body">
					<div class="mb-2">
						<div class="small text-muted">Tên sách</div>
						<div class="fw-semibold">
							{{ selectedBook.TenSach }}
						</div>
					</div>

					<div class="mb-2">
						<div class="small text-muted">Tác giả</div>
						<div>{{ selectedBook.NguonGoc_TacGia }}</div>
					</div>

					<div class="mb-2 d-flex gap-3">
						<div>
							<div class="small text-muted">Mã sách</div>
							<div>{{ selectedBook.MaSach }}</div>
						</div>
						<div>
							<div class="small text-muted">Số quyển còn</div>
							<div>{{ selectedBook.SoQuyen }}</div>
						</div>
					</div>

					<div class="mt-3">
						<label class="form-label small fw-semibold">
							Chọn ngày trả (tối đa 14 ngày)
						</label>
						<input
							v-model="borrowDate"
							type="date"
							class="form-control"
							:min="borrowMinDate"
							:max="borrowMaxDate"
						/>
						<div class="form-text">
							Từ {{ borrowMinDate }} đến {{ borrowMaxDate }}
						</div>
					</div>
				</div>

				<div class="borrow-modal__footer">
					<button
						type="button"
						class="btn btn-light btn-sm"
						@click="closeBorrowModal"
					>
						Hủy
					</button>
					<button
						type="button"
						class="btn btn-primary btn-sm"
						:disabled="!borrowDate"
						@click="confirmBorrow"
					>
						Xác nhận mượn
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import ReaderService from "@/services/reader.service";
import BorrowService from "@/services/borrow.service";
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
			showBorrowModal: false,
			selectedBook: null,
			borrowDate: "",
		};
	},
	computed: {
		totalFavorites() {
			return this.favoriteBooks.length;
		},
		borrowMinDate() {
			const d = new Date();
			d.setDate(d.getDate() + 1);
			return this.formatDateForInput(d);
		},
		borrowMaxDate() {
			const d = new Date();
			d.setDate(d.getDate() + 14);
			return this.formatDateForInput(d);
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
			if (!this.requireLogin()) return;

			if (book.SoQuyen <= 0) {
				toast.warn("Sách hiện đã hết, không thể mượn.");
				return;
			}

			this.selectedBook = book;
			this.borrowDate = this.borrowMaxDate;
			this.showBorrowModal = true;
		},
		requireLogin() {
			const token = localStorage.getItem("readerToken");
			if (!token) {
				toast.info("Vui lòng đăng nhập để sử dụng chức năng này.");
				this.$router.push({
					path: "/auth",
					query: { mode: "login" },
				});
				return false;
			}
			return true;
		},
		formatDateForInput(date) {
			const y = date.getFullYear();
			const m = String(date.getMonth() + 1).padStart(2, "0");
			const d = String(date.getDate()).padStart(2, "0");
			return `${y}-${m}-${d}`;
		},
		closeBorrowModal() {
			this.showBorrowModal = false;
			this.selectedBook = null;
			this.borrowDate = "";
		},
		async confirmBorrow() {
			if (!this.requireLogin()) return;
			if (!this.selectedBook || !this.borrowDate) return;

			try {
				const res = await BorrowService.borrowSelf(
					this.selectedBook.MaSach,
					this.borrowDate
				);

				if (!res.success) {
					toast.error(res.message || "Không thể mượn sách.");
					return;
				}

				toast.success(res.message || "Mượn sách thành công.");
				this.closeBorrowModal();
				await this.loadFavorites();
			} catch (error) {
				console.error("Lỗi mượn sách:", error);
				const message =
					error?.response?.data?.message ||
					"Có lỗi xảy ra khi mượn sách.";
				toast.error(message);
			}
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

.borrow-modal-backdrop {
	position: fixed;
	inset: 0;
	background: rgba(15, 23, 42, 0.55);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1050;
}

.borrow-modal {
	width: 100%;
	max-width: 420px;
	background: #ffffff;
	border-radius: 12px;
	box-shadow: 0 20px 40px rgba(15, 23, 42, 0.3);
	padding: 16px 18px 14px;
}

.borrow-modal__title {
	font-size: 16px;
	font-weight: 600;
	margin-bottom: 8px;
}

.borrow-modal__body {
	font-size: 14px;
	color: #374151;
}

.borrow-modal__footer {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
	margin-top: 16px;
}
</style>
