<template>
	<div class="library-page">
		<div class="mb-3">
			<h1 class="h4 mb-1 fw-semibold">Danh mục thư viện</h1>
			<p class="small text-muted mb-0" v-if="!searchTerm">
				Duyệt qua bộ sưu tập của chúng tôi hoặc sử dụng tìm kiếm để tìm
				những gì bạn cần.
			</p>
		</div>

		<!-- Filters -->
		<section class="mb-3">
			<div class="row g-2 align-items-end">
				<!-- Search box -->
				<div class="col-12 col-lg-6">
					<label class="form-label mb-1 small text-muted"
						>Tìm kiếm</label
					>
					<div class="input-group">
						<span class="input-group-text">
							<i class="fa-solid fa-magnifying-glass"></i>
						</span>
						<input
							type="text"
							class="form-control"
							v-model.lazy="searchTerm"
							placeholder="Tìm theo tên sách, mã sách, hoặc danh mục..."
						/>
					</div>
					<small class="text-muted d-block mt-1">
						Tìm thấy {{ filteredBooks.length }} cuốn sách.
					</small>
				</div>

				<!-- Status -->
				<div class="col-12 col-sm-6 col-lg-6">
					<label class="form-label mb-1 small text-muted"
						>Trạng thái</label
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
					v-if="paginatedBooks.length > 0"
					v-for="book in paginatedBooks"
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
					<p>
						Không tìm thấy sách nào. Hãy thử từ khóa tìm kiếm khác.
					</p>
				</div>
			</div>

			<!-- Pagination -->
			<div v-if="totalPages > 1" class="d-flex justify-content-end mt-4">
				<nav>
					<ul class="pagination pagination-sm mb-0">
						<li
							class="page-item"
							:class="{ disabled: currentPage === 1 }"
						>
							<button
								class="page-link"
								@click="goToPage(currentPage - 1)"
								:disabled="currentPage === 1"
							>
								<i class="fa-solid fa-chevron-left"></i>
							</button>
						</li>
						<li
							v-for="page in visiblePages"
							:key="page"
							class="page-item"
							:class="{ active: currentPage === page }"
						>
							<button class="page-link" @click="goToPage(page)">
								{{ page }}
							</button>
						</li>
						<li
							class="page-item"
							:class="{ disabled: currentPage === totalPages }"
						>
							<button
								class="page-link"
								@click="goToPage(currentPage + 1)"
								:disabled="currentPage === totalPages"
							>
								<i class="fa-solid fa-chevron-right"></i>
							</button>
						</li>
					</ul>
				</nav>
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
			currentPage: 1,
			itemsPerPage: 12,
		};
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
		paginatedBooks() {
			const start = (this.currentPage - 1) * this.itemsPerPage;
			const end = start + this.itemsPerPage;
			return this.filteredBooks.slice(start, end);
		},
		totalPages() {
			return Math.ceil(this.filteredBooks.length / this.itemsPerPage);
		},
		borrowMinDate() {
			const d = new Date();
			d.setDate(d.getDate() + 1);
			return this.formatDateForInput(d);
		},
		// Hàm lấy ngày tối đa (14 ngày kể từ hôm nay)
		borrowMaxDate() {
			const d = new Date();
			d.setDate(d.getDate() + 14);
			return this.formatDateForInput(d);
		},
		visiblePages() {
			const pages = [];
			const maxVisible = 5;
			let start = Math.max(
				1,
				this.currentPage - Math.floor(maxVisible / 2)
			);
			let end = Math.min(this.totalPages, start + maxVisible - 1);

			if (end - start < maxVisible - 1) {
				start = Math.max(1, end - maxVisible + 1);
			}

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}
			return pages;
		},
	},
	created() {
		this.initData();
	},
	mounted() {
		// Cập nhật lại trạng thái yêu thích từ localStorage khi mount
		this.syncFavoritesFromLocal();
	},
	activated() {
		// Cập nhật lại trạng thái yêu thích khi component được kích hoạt lại
		this.syncFavoritesFromLocal();
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
		syncFavoritesFromLocal() {
			// Đồng bộ trạng thái yêu thích từ localStorage
			const favoriteBooks = JSON.parse(
				localStorage.getItem("favoriteBooks") || "[]"
			);
			const favoriteSet = new Set(favoriteBooks);

			// Cập nhật lại _isLikedByMe cho các books hiện tại
			this.books.forEach((book) => {
				book._isLikedByMe = favoriteSet.has(book.MaSach);
			});

			// Cập nhật myFavoriteIds để đồng bộ với localStorage
			this.myFavoriteIds = favoriteBooks;
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
					// Đồng bộ vào localStorage
					localStorage.setItem(
						"favoriteBooks",
						JSON.stringify(this.myFavoriteIds)
					);
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

					// Cập nhật localStorage để đồng bộ
					let favoriteList = [];
					try {
						const raw = localStorage.getItem("favoriteBooks");
						if (raw) {
							const parsed = JSON.parse(raw);
							if (Array.isArray(parsed)) favoriteList = parsed;
						}
					} catch (e) {}

					if (res.data.isLiked) {
						if (!favoriteList.includes(book.MaSach)) {
							favoriteList.push(book.MaSach);
						}
					} else {
						favoriteList = favoriteList.filter(
							(id) => id !== book.MaSach
						);
					}
					localStorage.setItem(
						"favoriteBooks",
						JSON.stringify(favoriteList)
					);

					// Cập nhật myFavoriteIds để đồng bộ
					this.myFavoriteIds = favoriteList;

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
			this.borrowDate = this.borrowMaxDate;
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
		goToPage(page) {
			if (page >= 1 && page <= this.totalPages) {
				this.currentPage = page;
				window.scrollTo({ top: 0, behavior: "smooth" });
			}
		},
	},
	watch: {
		searchTerm(newVal) {
			this.currentPage = 1;
			this.fetchBooks(newVal);
		},
		selectedStatus() {
			this.currentPage = 1;
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

/* Pagination */
.pagination {
	gap: 4px;
}

.page-link {
	border-radius: 6px;
	border: 1px solid #e5e7eb;
	color: #374151;
	min-width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 8px;
}

.page-link:hover:not(:disabled) {
	background-color: #f3f4f6;
	border-color: #d1d5db;
	color: #111827;
}

.page-item.active .page-link {
	background-color: #2563eb;
	border-color: #2563eb;
	color: white;
}

.page-item.disabled .page-link {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>
