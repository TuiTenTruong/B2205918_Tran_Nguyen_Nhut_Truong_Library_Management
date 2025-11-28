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
						@toggle-save="toggleSave"
						@borrow="borrowBook"
					/>
				</div>
				<div v-else class="col-12 text-center text-muted">
					<p>No books found. Try a different search term.</p>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
import BookCard from "@/components/BookCard.vue";
import BookService from "@/services/book.service";
import ReaderService from "@/services/reader.service";
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
	},
	watch: {
		searchTerm(newVal) {
			this.fetchBooks(newVal);
		},
	},
	methods: {
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
		async borrowBook(book) {
			if (!this.requireLogin()) return;

			if (book.SoQuyen <= 0) {
				toast.warn("Sách hiện không còn để mượn.");
				return;
			}

			// TODO: gọi API mượn sách nếu backend đã có
			// await BorrowService.borrow(book.MaSach);
			toast.success(
				`Đã thêm sách "${book.TenSach}" vào danh sách mượn (demo).`
			);
		},
	},
	watch: {
		searchTerm(newVal) {
			this.fetchBooks(newVal);
		},
	},
};
</script>
