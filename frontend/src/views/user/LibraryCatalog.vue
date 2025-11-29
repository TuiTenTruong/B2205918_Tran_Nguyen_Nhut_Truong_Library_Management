<template>
	<div class="library-page">
		<div class="mb-3">
			<h1 class="h4 mb-1 fw-semibold">Library Catalog</h1>
			<p class="small text-muted mb-0" v-if="!searchTerm">
				Browse our collection or use the search to find what you need.
			</p>
		</div>

		<!-- Filters -->
		<section class="mb-3">
			<div class="row g-2 align-items-end">
				<!-- Search box -->
				<div class="col-12 col-lg-6">
					<label class="form-label mb-1 small text-muted"
						>Search</label
					>
					<div class="input-group">
						<span class="input-group-text">
							<i class="fa-solid fa-magnifying-glass"></i>
						</span>
						<input
							type="text"
							class="form-control"
							v-model.lazy="searchTerm"
							placeholder="Search by title, accession number, or category..."
						/>
					</div>
					<small class="text-muted d-block mt-1">
						Found {{ filteredBooks.length }} books.
					</small>
				</div>

				<!-- Status -->
				<div class="col-12 col-sm-6 col-lg-6">
					<label class="form-label mb-1 small text-muted"
						>Status</label
					>
					<select
						class="form-select form-select-sm"
						v-model="selectedStatus"
					>
						<option value="">Tất cả trạng thái</option>
						<option value="available">Còn sách</option>
						<option value="outOfStock">Hết sách</option>
					</select>
				</div>
			</div>
		</section>

		<!-- Book grid -->
		<section>
			<div class="row g-3 w-100">
				<div
					v-if="filteredBooks.length > 0"
					v-for="book in filteredBooks"
					:key="book.MaSach"
					:class="['col-6 col-md-4', 'col-lg-3']"
				>
					<BookCard
						:book="book"
						@toggle-favorite="toggleFavorite"
						@borrow="openBorrowModal"
					/>
				</div>
				<div v-else class="col-12 text-center text-muted">
					<p>No books found. Try a different search term.</p>
				</div>
			</div>
		</section>
	</div>
	<div v-if="showBorrowModal && selectedBook" class="borrow-modal-backdrop">
		<div class="borrow-modal">
			<h5 class="borrow-modal__title">Xác nhận mượn sách</h5>

			<div class="borrow-modal__body">
				<div class="mb-2">
					<div class="small text-muted">Tên sách</div>
					<div class="fw-semibold">{{ selectedBook.TenSach }}</div>
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
</template>

<script>
import BookCard from "@/components/BookCard.vue";
import BookService from "@/services/book.service";
import ReaderService from "@/services/reader.service";
import BorrowService from "@/services/borrow.service";
import { toast } from "vue3-toastify";
export default {
	name: "LibraryCatalog",
	components: { BookCard },
	data() {
		return {
			searchTerm: "",
			selectedStatus: "",
			books: [],
			myFavoriteIds: [],
			showBorrowModal: false,
			selectedBook: null,
			borrowDate: "",
		};
	},
	async created() {
		await this.fetchMyFavoriteIds();
		await this.fetchBooks();
	},
	computed: {
		filteredBooks() {
			return this.books.filter((book) => {
				if (this.selectedStatus === "available") {
					return book.SoQuyen > 0;
				}
				if (this.selectedStatus === "outOfStock") {
					return book.SoQuyen === 0;
				}
				return true;
			});
		},
		borrowMinDate() {
			return this.formatDateForInput(new Date());
		},
		// Hàm lấy ngày tối đa (14 ngày kể từ hôm nay)
		borrowMaxDate() {
			const d = new Date();
			d.setDate(d.getDate() + 14);
			return this.formatDateForInput(d);
		},
	},
	created() {
		this.initData();
	},
	methods: {
		async initData() {
			await this.fetchMyFavoriteIds();
			await this.fetchBooks();
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
		async fetchMyFavoriteIds() {
			try {
				const res = await ReaderService.getMyProfile();
				if (
					res.success &&
					res.data &&
					Array.isArray(res.data.YeuThichSach)
				) {
					this.myFavoriteIds = res.data.YeuThichSach;
				} else {
					this.myFavoriteIds = [];
				}
			} catch (error) {
				console.error("Lỗi lấy profile:", error);
				this.myFavoriteIds = [];
			}
		},

		// gọi API lấy sách
		async fetchBooks(query = "") {
			try {
				const list = query
					? await BookService.searchBooks(query)
					: await BookService.getAllBooks();

				const favoriteSet = new Set(this.myFavoriteIds);

				this.books = list.map((book) => ({
					...book,
					_isLikedByMe: favoriteSet.has(book.MaSach),
				}));
				console.log("Fetched books:", this.books);
			} catch (error) {
				console.error("Error fetching books:", error);
				toast.error("Không tải được danh sách sách.");
				this.books = [];
			}
		},

		// YÊU THÍCH SÁCH
		async toggleFavorite(book) {
			if (!this.requireLogin()) return;

			try {
				const res = await ReaderService.toggleFavorite(book.MaSach);
				if (res.success) {
					book._isLikedByMe = res.data.isLiked;
					book.YeuThich = res.data.likes;
					toast.success(
						res.data.isLiked
							? "Đã thêm vào danh sách yêu thích."
							: "Đã bỏ khỏi danh sách yêu thích."
					);
				} else {
					toast.error(res.message || "Không thể cập nhật yêu thích.");
				}
			} catch (error) {
				console.error("Lỗi toggle favorite:", error);
				toast.error("Có lỗi xảy ra khi cập nhật yêu thích.");
			}
		},

		// MƯỢN SÁCH
		openBorrowModal(book) {
			if (!this.requireLogin()) return;

			if (book.SoQuyen <= 0) {
				toast.warn("Sách hiện đã hết, không thể mượn.");
				return;
			}

			this.selectedBook = book;
			this.borrowDate = this.borrowMinDate;
			this.showBorrowModal = true;
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
				await this.fetchBooks(this.searchTerm);
			} catch (error) {
				console.error("Lỗi mượn sách:", error);
				const message =
					error?.response?.data?.message ||
					"Có lỗi xảy ra khi mượn sách.";
				toast.error(message);
			}
		},
	},
	watch: {
		searchTerm(newVal) {
			this.fetchBooks(newVal);
		},
	},
};
</script>
<style scoped>
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
