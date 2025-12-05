<template>
	<div class="container-fluid py-3 book-detail-page">
		<!-- Back -->
		<div class="mb-3 d-flex justify-content-between align-items-center">
			<button
				class="btn btn-link p-0 d-inline-flex align-items-center"
				@click="goBack"
			>
				<i class="fa-solid fa-arrow-left me-1"></i>
				<span>Quay lại danh mục</span>
			</button>
		</div>

		<!-- Loading / lỗi -->
		<div v-if="loading" class="text-center text-muted py-5">
			<div class="spinner-border spinner-border-sm me-2"></div>
			Đang tải thông tin sách...
		</div>
		<div v-else-if="error" class="alert alert-danger">
			{{ error }}
		</div>

		<!-- Nội dung chính -->
		<div v-else-if="book" class="row g-3">
			<!-- Cover -->
			<div class="col-12 col-lg-4">
				<div class="card border-0 shadow-sm h-100">
					<div class="card-body d-flex flex-column">
						<div class="book-detail-cover-wrapper mb-3">
							<img
								:src="coverUrl"
								:alt="book.TenSach"
								class="book-detail-cover-img"
								@error="onImgError"
							/>
						</div>

						<div class="d-flex flex-column gap-2 mt-auto">
							<button
								class="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center btn-sm"
								:class="{ 'btn-fav-active': isFavorite }"
								@click="toggleFavorite"
								:disabled="favoriteLoading"
							>
								<i
									class="fa-solid fa-heart me-1"
									:class="{ 'text-danger': isFavorite }"
								></i>
								<span v-if="favoriteLoading"
									>Đang cập nhật...</span
								>
								<span v-else>
									{{
										isFavorite
											? "Xóa khỏi yêu thích"
											: "Thêm vào yêu thích"
									}}
								</span>
							</button>

							<button
								class="btn btn-dark w-100 d-flex align-items-center justify-content-center btn-sm"
								@click="openBorrowModal"
								:disabled="!canBorrow"
							>
								<i class="fa-solid fa-book-open me-1"></i>
								<span v-if="canBorrow">Mượn sách này</span>
								<span v-else>Hết sách</span>
							</button>

							<!-- Nút đặt trước khi sách hết -->
							<button
								v-if="!canBorrow"
								class="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center btn-sm"
								@click="handleReservation"
								:disabled="reservationLoading || hasReservation"
							>
								<i class="fa-solid fa-clock me-1"></i>
								<span v-if="reservationLoading"
									>Đang xử lý...</span
								>
								<span v-else-if="hasReservation">
									Đã đặt trước (Vị trí:
									{{ reservationPosition }})
								</span>
								<span v-else>Đặt trước sách này</span>
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Thông tin chi tiết -->
			<div class="col-12 col-lg-8">
				<div class="card border-0 shadow-sm mb-3">
					<div class="card-body">
						<div
							class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2"
						>
							<div>
								<h2 class="h4 fw-semibold mb-1">
									{{ book.TenSach }}
								</h2>
								<p class="mb-1 text-muted small">
									<span v-if="book.NguonGoc_TacGia">
										By {{ book.NguonGoc_TacGia }}
									</span>
									<span v-if="book.NamXuatBan">
										· {{ book.NamXuatBan }}
									</span>
								</p>
								<p
									class="mb-0 text-muted small"
									v-if="publisherName"
								>
									Publisher: {{ publisherName }}
								</p>
							</div>

							<div class="text-end small text-muted">
								<div>
									<strong>Book ID:</strong> {{ book.MaSach }}
								</div>
								<div v-if="book.createdAt">
									<small>
										Added: {{ formatDate(book.createdAt) }}
									</small>
								</div>
							</div>
						</div>

						<hr />

						<!-- Description -->
						<div class="mb-3">
							<h6 class="fw-semibold mb-1">Mô tả</h6>
							<p class="mb-0 small text-muted" v-if="book.MoTa">
								{{ book.MoTa }}
							</p>
							<p class="mb-0 small text-muted" v-else>
								Sách này chưa có mô tả.
							</p>
						</div>

						<!-- Thông tin thêm -->
						<div class="row g-3 small">
							<div class="col-6 col-md-3">
								<div class="text-muted">Năm xuất bản</div>
								<div class="fw-semibold">
									{{ book.NamXuatBan || "-" }}
								</div>
							</div>
							<div class="col-6 col-md-3">
								<div class="text-muted">Số lượng</div>
								<div class="fw-semibold">
									{{
										book.SoQuyen != null
											? book.SoQuyen
											: "-"
									}}
								</div>
							</div>
							<div class="col-6 col-md-3">
								<div class="text-muted">Đơn giá</div>
								<div class="fw-semibold">
									{{ formatPrice(book.DonGia) }}
								</div>
							</div>
							<div class="col-6 col-md-3">
								<div class="text-muted">Lượt thích</div>
								<div class="fw-semibold">
									{{
										book.YeuThich != null
											? book.YeuThich
											: 0
									}}
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Stats nhỏ -->
				<div class="row g-3">
					<div class="col-12 col-md-4">
						<div class="card border-0 shadow-sm h-100">
							<div
								class="card-body d-flex flex-column justify-content-between small"
							>
								<div class="d-flex align-items-center mb-1">
									<i
										class="fa-regular fa-circle-check me-2"
									></i>
									<span class="text-muted">Tình trạng</span>
								</div>
								<div class="fw-semibold">
									<span v-if="book.SoQuyen > 0">
										Còn {{ book.SoQuyen }} cuốn
									</span>
									<span v-else> Hết sách </span>
								</div>
							</div>
						</div>
					</div>

					<div class="col-12 col-md-4">
						<div class="card border-0 shadow-sm h-100">
							<div
								class="card-body d-flex flex-column justify-content-between small"
							>
								<div class="d-flex align-items-center mb-1">
									<i class="fa-solid fa-heart me-2"></i>
									<span class="text-muted"
										>Yêu thích của bạn</span
									>
								</div>
								<div class="fw-semibold">
									{{
										isFavorite
											? "Trong danh sách yêu thích"
											: "Chưa có trong danh sách"
									}}
								</div>
							</div>
						</div>
					</div>

					<div class="col-12 col-md-4">
						<div class="card border-0 shadow-sm h-100">
							<div
								class="card-body d-flex flex-column justify-content-between small"
							>
								<div class="d-flex align-items-center mb-1">
									<i class="fa-solid fa-barcode me-2"></i>
									<span class="text-muted">Mã sách</span>
								</div>
								<div class="fw-semibold">
									{{ book.MaSach || "N/A" }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Modal mượn sách -->
		<div v-if="showBorrowModal" class="modal-backdrop-custom">
			<div class="modal-dialog-custom">
				<div class="card border-0 shadow">
					<div
						class="card-header bg-white d-flex justify-content-between align-items-center"
					>
						<h6 class="mb-0 fw-semibold">Mượn sách</h6>
						<button
							class="btn btn-sm btn-outline-secondary"
							@click="closeBorrowModal"
							:disabled="borrowLoading"
						>
							<i class="fa-solid fa-xmark"></i>
						</button>
					</div>
					<div class="card-body small">
						<p class="mb-2">Bạn đang mượn:</p>
						<p class="fw-semibold mb-2">
							{{ book.TenSach }}
						</p>
						<p class="text-muted mb-3 small">
							Chọn ngày trả sách. Thời gian mượn tối đa là
							<strong>14 ngày</strong>.
						</p>
						<div class="mb-3">
							<label class="form-label small fw-semibold">
								Ngày trả *
							</label>
							<input
								type="date"
								class="form-control"
								v-model="borrowDueDate"
								:min="minBorrowDate"
								:max="maxBorrowDate"
								required
							/>
							<div class="form-text small">
								Từ {{ formatDate(today) }} đến
								{{ formatDate(maxBorrowDateObj) }}.
							</div>
						</div>

						<div class="d-flex justify-content-end gap-2">
							<button
								class="btn btn-outline-secondary btn-sm"
								@click="closeBorrowModal"
								:disabled="borrowLoading"
							>
								Hủy
							</button>
							<button
								class="btn btn-dark btn-sm"
								@click="submitBorrow"
								:disabled="borrowLoading"
							>
								<span v-if="borrowLoading">Đang xử lý...</span>
								<span v-else>Xác nhận mượn</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Modal xác nhận đặt trước -->
		<div v-if="showConfirmModal" class="modal-backdrop-custom">
			<div class="modal-dialog-custom">
				<div class="card border-0 shadow">
					<div
						class="card-header bg-white d-flex justify-content-between align-items-center"
					>
						<h6 class="mb-0 fw-semibold">Xác nhận đặt trước</h6>
						<button
							class="btn btn-sm btn-outline-secondary"
							@click="closeConfirmModal"
							:disabled="reservationLoading"
						>
							<i class="fa-solid fa-xmark"></i>
						</button>
					</div>
					<div class="card-body small">
						<p class="mb-2">
							Bạn có muốn đặt trước sách
							<strong>"{{ book?.TenSach }}"</strong>?
						</p>
						<p class="text-muted small mb-3">
							Khi sách có sẵn, bạn sẽ có
							<strong>48 giờ</strong> để đến mượn.
						</p>

						<div class="d-flex justify-content-end gap-2">
							<button
								class="btn btn-outline-secondary btn-sm"
								@click="closeConfirmModal"
								:disabled="reservationLoading"
							>
								Hủy
							</button>
							<button
								class="btn btn-primary btn-sm"
								@click="confirmReservation"
								:disabled="reservationLoading"
							>
								<span v-if="reservationLoading"
									>Đang xử lý...</span
								>
								<span v-else>Xác nhận</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import BookService from "@/services/book.service";
import ReaderService from "@/services/reader.service";
import BorrowService from "@/services/borrow.service";
import ReservationService from "@/services/reservation.service";
import { toast } from "vue3-toastify";

export default {
	name: "BookDetail",
	data() {
		return {
			book: null,
			loading: false,
			error: "",

			isFavorite: false,
			favoriteLoading: false,

			showBorrowModal: false,
			borrowDueDate: "",
			borrowLoading: false,

			// Đặt trước
			reservationLoading: false,
			hasReservation: false,
			reservationPosition: 0,
			reservationStatus: "",

			showConfirmModal: false,

			today: new Date(),
		};
	},
	computed: {
		bookId() {
			return this.$route.params.id;
		},
		coverUrl() {
			if (!this.book || !this.book.AnhBia) {
				return "/placeholder-book.png";
			}
			return `/uploads/books/${this.book.AnhBia}`;
		},
		publisherName() {
			// nếu sau này anh load thêm NXB thì sửa lại chỗ này
			return this.book?.TenNXB || "";
		},
		canBorrow() {
			return this.book && this.book.SoQuyen > 0;
		},
		// dạng yyyy-mm-dd cho input date
		minBorrowDate() {
			const d = new Date();
			// cho mượn bắt đầu từ hôm nay
			return this.toDateInputValue(d);
		},
		maxBorrowDateObj() {
			const d = new Date();
			d.setDate(d.getDate() + 14);
			return d;
		},
		maxBorrowDate() {
			return this.toDateInputValue(this.maxBorrowDateObj);
		},
	},
	created() {
		this.loadBook();
	},
	watch: {
		// nếu navigate giữa các sách khác nhau bằng router-link
		"$route.params.id"() {
			this.loadBook();
		},
	},
	methods: {
		goBack() {
			if (window.history.length > 1) {
				this.$router.back();
			} else {
				this.$router.push("/");
			}
		},
		onImgError(e) {
			e.target.src = "/placeholder-book.png";
		},
		toDateInputValue(d) {
			const year = d.getFullYear();
			const month = String(d.getMonth() + 1).padStart(2, "0");
			const day = String(d.getDate()).padStart(2, "0");
			return `${year}-${month}-${day}`;
		},
		formatDate(date) {
			if (!date) return "-";
			const d = new Date(date);
			if (Number.isNaN(d.getTime())) return "-";
			return d.toLocaleDateString("vi-VN");
		},
		formatPrice(value) {
			if (value == null || Number.isNaN(Number(value))) return "-";
			return Number(value).toLocaleString("vi-VN") + " đ";
		},
		requireLogin() {
			const token = localStorage.getItem("readerToken");
			if (!token) {
				toast.info("Vui lòng đăng nhập để sử dụng chức năng này.");
				this.$router.push({ path: "/auth", query: { mode: "login" } });
				return false;
			}
			return true;
		},

		// Load sách từ backend
		async loadBook() {
			this.loading = true;
			this.error = "";
			this.book = null;
			this.isFavorite = false;
			this.hasReservation = false;
			this.reservationPosition = 0;
			try {
				const res = await BookService.getBookById(this.bookId);
				const data = res?.data || res;
				if (!data) {
					this.error = "Không tìm thấy sách.";
					return;
				}
				this.book = data;
				this.syncFavoriteFromLocal();
				// Kiểm tra đã đặt trước chưa
				await this.checkReservationStatus();
			} catch (err) {
				console.error(err);
				this.error =
					err?.response?.data?.message ||
					"Không tải được thông tin sách.";
			} finally {
				this.loading = false;
			}
		},

		// Đồng bộ trạng thái yêu thích từ localStorage
		syncFavoriteFromLocal() {
			try {
				const raw = localStorage.getItem("favoriteBooks");
				if (!raw || !this.book) {
					this.isFavorite = false;
					return;
				}
				const list = JSON.parse(raw);
				if (!Array.isArray(list)) {
					this.isFavorite = false;
					return;
				}
				this.isFavorite = list.includes(this.book.MaSach);
			} catch (e) {
				this.isFavorite = false;
			}
		},

		// Toggle favorite: gọi API + lưu localStorage
		async toggleFavorite() {
			if (!this.requireLogin() || !this.book) return;
			this.favoriteLoading = true;
			try {
				await ReaderService.toggleFavorite(this.book.MaSach);

				// update local state
				this.isFavorite = !this.isFavorite;

				// update global like count nếu có
				if (typeof this.book.YeuThich === "number") {
					if (this.isFavorite) {
						this.book.YeuThich += 1;
					} else if (this.book.YeuThich > 0) {
						this.book.YeuThich -= 1;
					}
				}

				// localStorage
				let list = [];
				try {
					const raw = localStorage.getItem("favoriteBooks");
					if (raw) {
						const parsed = JSON.parse(raw);
						if (Array.isArray(parsed)) list = parsed;
					}
				} catch (e) {}

				if (this.isFavorite) {
					if (!list.includes(this.book.MaSach)) {
						list.push(this.book.MaSach);
					}
					toast.success("Đã thêm vào sách yêu thích.");
				} else {
					list = list.filter((id) => id !== this.book.MaSach);
					toast.info("Đã xoá khỏi sách yêu thích.");
				}
				localStorage.setItem("favoriteBooks", JSON.stringify(list));
			} catch (error) {
				console.error(error);
				const msg =
					error?.response?.data?.message ||
					"Không thể cập nhật sách yêu thích.";
				toast.error(msg);
			} finally {
				this.favoriteLoading = false;
			}
		},

		openBorrowModal() {
			if (!this.requireLogin() || !this.book || !this.canBorrow) return;
			this.borrowDueDate = this.maxBorrowDate; // default max
			this.showBorrowModal = true;
		},
		closeBorrowModal() {
			if (this.borrowLoading) return;
			this.showBorrowModal = false;
		},

		// Gọi API mượn sách
		async submitBorrow() {
			if (!this.requireLogin() || !this.book) return;
			if (!this.borrowDueDate) {
				toast.error("Vui lòng chọn ngày trả.");
				return;
			}
			this.borrowLoading = true;
			try {
				const res = await BorrowService.borrowSelf(
					this.book.MaSach,
					this.borrowDueDate
				);
				const ok = res?.success ?? true;
				if (!ok) {
					throw new Error(res?.message || "Borrow failed");
				}
				toast.success("Mượn sách thành công.");
				this.showBorrowModal = false;

				// giảm số lượng nếu backend không trả lại book mới
				if (
					typeof this.book.SoQuyen === "number" &&
					this.book.SoQuyen > 0
				) {
					this.book.SoQuyen -= 1;
				}
			} catch (error) {
				console.error(error);
				const msg =
					error?.response?.data?.message ||
					error.message ||
					"Có lỗi xảy ra khi mượn sách.";
				toast.error(msg);
			} finally {
				this.borrowLoading = false;
			}
		},

		// Kiểm tra trạng thái đặt trước
		async checkReservationStatus() {
			if (!this.book) return;
			const token = localStorage.getItem("readerToken");
			if (!token) return;

			try {
				const res = await ReservationService.getQueuePosition(
					this.book.MaSach
				);
				if (res.success && res.data) {
					this.hasReservation = true;
					this.reservationPosition = res.data.position || 0;
					this.reservationStatus = res.data.status || "";
				}
			} catch (err) {
				// 404 = chưa đặt trước
				this.hasReservation = false;
				this.reservationPosition = 0;
			}
		},

		// Xử lý đặt trước sách
		async handleReservation() {
			if (!this.requireLogin() || !this.book) return;

			if (this.hasReservation) {
				toast.info("Bạn đã đặt trước sách này rồi.");
				return;
			}

			this.showConfirmModal = true;
		},

		closeConfirmModal() {
			if (this.reservationLoading) return;
			this.showConfirmModal = false;
		},

		async confirmReservation() {
			this.reservationLoading = true;
			try {
				const res = await ReservationService.createReservation(
					this.book.MaSach
				);
				if (res.success) {
					toast.success(res.message || "Đặt trước sách thành công!");
					this.hasReservation = true;
					this.reservationPosition = res.data?.viTriHangDoi || 1;
					this.reservationLoading = false;
					this.showConfirmModal = false;
				} else {
					toast.error(res.message || "Không thể đặt trước sách.");
				}
			} catch (error) {
				console.error(error);
				const msg =
					error?.response?.data?.message ||
					"Có lỗi xảy ra khi đặt trước sách.";
				toast.error(msg);
			} finally {
				this.reservationLoading = false;
			}
		},
	},
};
</script>

<style scoped>
.book-detail-page {
	background-color: #f5f7fb;
	min-height: 100vh;
}

/* Cover */
.book-detail-cover-wrapper {
	width: 100%;
	padding-top: 140%;
	position: relative;
	background-color: #e5e7eb;
	border-radius: 0.75rem;
	overflow: hidden;
}
.book-detail-cover-img {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: contain;
}

/* Favorite button */
.btn-fav-active {
	background-color: #fee2e2;
	border-color: #fca5a5;
}

/* Modal */
.modal-backdrop-custom {
	position: fixed;
	inset: 0;
	background-color: rgba(15, 23, 42, 0.45);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1050;
}
.modal-dialog-custom {
	max-width: 480px;
	width: 100%;
	padding: 0 12px;
}
</style>
