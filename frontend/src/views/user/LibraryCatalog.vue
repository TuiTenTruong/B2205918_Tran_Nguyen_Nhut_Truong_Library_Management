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

export default {
	name: "LibraryCatalog",
	components: { BookCard },
	data() {
		return {
			searchTerm: "",
			selectedStatus: "",
			books: [],
			allCategories: [],
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
	},
	watch: {
		searchTerm(newVal) {
			this.fetchBooks(newVal);
		},
	},
	methods: {
		async fetchBooks(query = "") {
			try {
				if (query) {
					this.books = await BookService.searchBooks(query);
				} else {
					this.books = await BookService.getAllBooks();
				}
			} catch (error) {
				console.error("Error fetching books:", error);
				this.books = [];
			}
		},

		async toggleFavorite(book) {
			try {
				const res = await ReaderService.toggleFavorite(book.MaSach);

				// cập nhật giao diện
				if (res.success) {
					book._isLikedByMe = res.data.isLiked; // cờ local cho user hiện tại
					book.YeuThich = res.data.likes; // counter tổng từ backend
				}
			} catch (error) {
				console.error("Lỗi toggle favorite:", error);
			}
		},

		async toggleSave(book) {
			try {
				const res = await ReaderService.toggleSave(book.MaSach);
				if (res.success) {
					book._isSavedByMe = res.data.isSaved;
				}
			} catch (error) {
				console.error("Lỗi toggle save:", error);
			}
		},

		borrowBook(book) {
			if (book.SoQuyen <= 0) {
				alert("Book is not available right now.");
				return;
			}
			alert(`Borrowing book: ${book.TenSach}`);
		},
	},
	created() {
		this.fetchBooks();
	},
};
</script>
