<template>
	<div class="container-fluid py-3 admin-page">
		<div
			class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3"
		>
			<div>
				<h4 class="fw-bold mb-1">Quản lý phiếu mượn</h4>
				<p class="text-muted mb-0 small">
					Tạo và quản lý các phiếu mượn sách
				</p>
			</div>
			<button class="btn btn-dark btn-sm" @click="openCreateModal">
				<i class="fa-solid fa-plus me-1"></i>
				Tạo phiếu mượn
			</button>
		</div>

		<!-- Bảng phiếu mượn -->
		<div class="card border-0 shadow-sm">
			<div
				class="card-header bg-white border-0 d-flex justify-content-between align-items-center"
			>
				<h6 class="mb-0 fw-semibold">Danh sách phiếu mượn</h6>
				<button
					class="btn btn-outline-secondary btn-sm"
					@click="loadBorrows"
					:disabled="loading"
				>
					<i class="fa-solid fa-rotate me-1"></i>
					Làm mới
				</button>
			</div>
			<div class="card-body p-0">
				<div v-if="loading" class="py-3 text-center text-muted small">
					Đang tải danh sách phiếu mượn...
				</div>
				<div
					v-else-if="borrows.length === 0"
					class="py-3 text-center text-muted small"
				>
					Không có phiếu mượn nào.
				</div>
				<div v-else class="table-responsive">
					<table
						class="table table-borderless align-middle mb-0 admin-borrow-table"
					>
						<thead>
							<tr>
								<th class="text-nowrap">Mã phiếu</th>
								<th class="text-nowrap">Email độc giả</th>
								<th>Sách</th>
								<th class="text-nowrap">Ngày mượn</th>
								<th class="text-nowrap">Hạn trả</th>
								<th class="text-nowrap">Ngày trả thực tế</th>
								<th class="text-nowrap">Trạng thái</th>
								<th class="text-end text-nowrap">Hành động</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="b in borrows" :key="b.MaPhieuMuon">
								<td class="text-nowrap small text-muted">
									{{ b.MaPhieuMuon }}
								</td>
								<td class="text-nowrap">
									{{ b.readerEmail || b.MaDocGia }}
								</td>
								<td class="admin-borrow-table__book">
									{{ b.bookTitle || b.MaSach }}
								</td>
								<td class="text-nowrap">
									{{ formatDate(b.NgayMuon) }}
								</td>
								<td class="text-nowrap">
									{{ formatDate(b.NgayTra) }}
								</td>
								<td class="text-nowrap">
									{{
										b.NgayTraThucTe
											? formatDate(b.NgayTraThucTe)
											: "-"
									}}
								</td>
								<td>
									<span
										class="status-chip"
										:class="statusClass(b.TinhTrang)"
									>
										{{ b.TinhTrang }}
									</span>
								</td>
								<td class="text-end text-nowrap">
									<button
										class="btn btn-sm btn-outline-success me-1"
										:disabled="
											(b.TinhTrang !== 'Đang mượn' &&
												b.TinhTrang !== 'Quá hạn') ||
											returningId === b.MaPhieuMuon
										"
										@click="openReturnModal(b)"
									>
										<span
											v-if="returningId === b.MaPhieuMuon"
										>
											...
										</span>
										<span v-else> Trả sách </span>
									</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Modal tạo phiếu mượn -->
		<div v-if="showCreateModal" class="modal-backdrop-custom">
			<div class="modal-dialog-custom">
				<div class="card border-0 shadow">
					<div
						class="card-header bg-white d-flex justify-content-between align-items-center"
					>
						<h6 class="mb-0 fw-semibold">Tạo phiếu mượn</h6>
						<button
							class="btn btn-sm btn-outline-secondary"
							@click="closeCreateModal"
						>
							<i class="fa-solid fa-xmark"></i>
						</button>
					</div>
					<div class="card-body">
						<form @submit.prevent="submitCreateBorrow">
							<!-- READER SEARCH -->
							<div class="mb-3">
								<label class="form-label small fw-semibold">
									Độc giả
								</label>
								<div class="input-group input-group-sm mb-2">
									<input
										v-model="readerSearch"
										type="text"
										class="form-control"
										placeholder="Tìm theo tên, email hoặc nhập mã độc giả"
										@keyup.enter.prevent="searchReaders"
									/>
									<button
										class="btn btn-outline-secondary"
										type="button"
										@click="searchReaders"
										:disabled="readerSearching"
									>
										<span v-if="readerSearching">...</span>
										<span v-else>Tìm</span>
									</button>
								</div>

								<div v-if="selectedReader" class="small mb-2">
									<strong>Đã chọn:</strong>
									{{ selectedReader.MaDocGia }} -
									{{ selectedReader.HoLot }}
									{{ selectedReader.Ten }}
								</div>

								<div
									v-if="readerResults.length"
									class="border rounded small"
									style="max-height: 200px; overflow: auto"
								>
									<table class="table table-sm mb-0">
										<tbody>
											<tr
												v-for="r in readerResults"
												:key="r.MaDocGia"
												@click="chooseReader(r)"
												class="table-hover-row"
												style="cursor: pointer"
											>
												<td class="text-nowrap">
													{{ r.MaDocGia }}
												</td>
												<td>
													{{ r.HoLot }} {{ r.Ten
													}}<br />
													<span class="text-muted">
														{{ r.Email }}
													</span>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
								<div class="form-text small">
									* Bạn cũng có thể nhập trực tiếp mã độc giả.
								</div>
							</div>

							<!-- BOOK SEARCH -->
							<div class="mb-3">
								<label class="form-label small fw-semibold">
									Sách
								</label>
								<div class="input-group input-group-sm mb-2">
									<input
										v-model="bookSearch"
										type="text"
										class="form-control"
										placeholder="Tìm theo tên sách hoặc mã sách"
										@keyup.enter.prevent="searchBooks"
									/>
									<button
										class="btn btn-outline-secondary"
										type="button"
										@click="searchBooks"
										:disabled="bookSearching"
									>
										<span v-if="bookSearching">...</span>
										<span v-else>Tìm</span>
									</button>
								</div>

								<div v-if="selectedBook" class="small mb-2">
									<strong>Đã chọn:</strong>
									{{ selectedBook.MaSach }} -
									{{ selectedBook.TenSach }}
								</div>

								<div
									v-if="bookResults.length"
									class="border rounded small"
									style="max-height: 200px; overflow: auto"
								>
									<table class="table table-sm mb-0">
										<tbody>
											<tr
												v-for="bk in bookResults"
												:key="bk.MaSach"
												@click="chooseBook(bk)"
												class="table-hover-row"
												style="cursor: pointer"
											>
												<td class="text-nowrap">
													{{ bk.MaSach }}
												</td>
												<td>
													{{ bk.TenSach }}<br />
													<span class="text-muted">
														{{ bk.TacGia }}
													</span>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
								<div class="form-text small">
									* Bạn cũng có thể nhập trực tiếp mã sách.
								</div>
							</div>

							<div class="row">
								<div class="mb-3 col-12 col-md-6">
									<label class="form-label small fw-semibold">
										Ngày mượn
									</label>
									<input
										type="date"
										class="form-control bg-light"
										v-model="form.NgayMuon"
										:min="todayDate"
										:max="todayDate"
										required
										readonly
									/>
									<div class="form-text small">
										Ngày mượn là hôm nay.
									</div>
								</div>
								<div class="mb-3 col-12 col-md-6">
									<label class="form-label small fw-semibold">
										Hạn trả
									</label>
									<input
										type="date"
										class="form-control"
										v-model="form.NgayTra"
										:min="minDueDate"
										:max="maxDueDate"
										required
									/>
									<div class="form-text small">
										Tối đa 14 ngày kể từ ngày mượn.
									</div>
								</div>
							</div>

							<div class="d-flex justify-content-end gap-2 mt-2">
								<button
									type="button"
									class="btn btn-outline-secondary btn-sm"
									@click="closeCreateModal"
									:disabled="creating"
								>
									Hủy
								</button>
								<button
									type="submit"
									class="btn btn-dark btn-sm"
									:disabled="creating"
								>
									<span v-if="creating">Đang tạo...</span>
									<span v-else>Tạo phiếu</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>

		<!-- Modal trả sách -->
		<div v-if="showReturnModal" class="modal-backdrop-custom">
			<div class="modal-dialog-custom">
				<div class="card border-0 shadow">
					<div
						class="card-header bg-white d-flex justify-content-between align-items-center"
					>
						<h6 class="mb-0 fw-semibold">Trả sách</h6>
						<button
							class="btn btn-sm btn-outline-secondary"
							@click="closeReturnModal"
						>
							<i class="fa-solid fa-xmark"></i>
						</button>
					</div>
					<div class="card-body">
						<p class="small text-muted mb-2">
							Xác nhận trả sách cho:
						</p>
						<ul class="small mb-3">
							<li>
								<strong>Mã phiếu mượn:</strong>
								{{ currentBorrow?.MaPhieuMuon }}
							</li>
							<li>
								<strong>Độc giả:</strong>
								{{ currentBorrow?.MaDocGia }}
							</li>
							<li>
								<strong>Sách:</strong>
								{{ currentBorrow?.MaSach }}
							</li>
						</ul>

						<div class="mb-3">
							<label class="form-label small fw-semibold">
								Ngày trả
							</label>
							<input
								type="date"
								class="form-control"
								v-model="returnDate"
								required
							/>
						</div>

						<div class="d-flex justify-content-end gap-2 mt-2">
							<button
								type="button"
								class="btn btn-outline-secondary btn-sm"
								@click="closeReturnModal"
								:disabled="returning"
							>
								Hủy
							</button>
							<button
								type="button"
								class="btn btn-success btn-sm"
								@click="submitReturnBorrow"
								:disabled="returning"
							>
								<span v-if="returning">Đang xử lý...</span>
								<span v-else>Xác nhận trả</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import BorrowService from "@/services/borrow.service";
import ReaderService from "@/services/reader.service";
import BookService from "@/services/book.service";
import { toast } from "vue3-toastify";

export default {
	name: "AdminBorrows",
	data() {
		return {
			borrows: [],
			readers: [],
			books: [],

			// phần tìm kiếm reader
			readerSearch: "",
			readerResults: [],
			readerSearching: false,
			selectedReader: null,

			// phần tìm kiếm book
			bookSearch: "",
			bookResults: [],
			bookSearching: false,
			selectedBook: null,

			loading: false,
			returning: false,
			returningId: null,

			showCreateModal: false,
			creating: false,
			form: {
				MaDocGia: "",
				MaSach: "",
				NgayMuon: "",
				NgayTra: "",
			},

			showReturnModal: false,
			currentBorrow: null,
			returnDate: "",
		};
	},
	computed: {
		// Ngày hôm nay (dạng YYYY-MM-DD)
		todayDate() {
			return new Date().toISOString().slice(0, 10);
		},
		// Ngày trả tối thiểu = ngày mượn
		minDueDate() {
			return this.form.NgayMuon || this.todayDate;
		},
		// Ngày trả tối đa = ngày mượn + 14 ngày
		maxDueDate() {
			const base = this.form.NgayMuon
				? new Date(this.form.NgayMuon)
				: new Date();
			const max = new Date(base);
			max.setDate(base.getDate() + 14);
			return max.toISOString().slice(0, 10);
		},
	},
	created() {
		this.loadReadersAndBooks().then(() => {
			this.loadBorrows();
		});
	},
	methods: {
		async loadBorrows() {
			this.loading = true;
			try {
				const res = await BorrowService.getAllBorrowsAdmin();
				const raw = res?.data || res || [];
				let list = Array.isArray(raw) ? raw : raw.data || [];

				// Map title sách
				const bookMap = {};
				for (const b of this.books) {
					bookMap[b.MaSach] = b;
				}
				
				// Map email độc giả
				const readerMap = {};
				for (const r of this.readers) {
					readerMap[r.MaDocGia] = r;
				}
				
				list = list.map((b) => ({
					...b,
					bookTitle: bookMap[b.MaSach]?.TenSach || b.MaSach,
					readerEmail: readerMap[b.MaDocGia]?.Email || null,
				}));

				this.borrows = list;
			} catch (error) {
				console.error(error);
				toast.error("Không tải được danh sách phiếu mượn.");
			} finally {
				this.loading = false;
			}
		},
		async loadReadersAndBooks() {
			try {
				// Độc giả (dùng API admin)
				const readersRes = await ReaderService.getAllReaders();
				const rRaw = readersRes?.data || readersRes || [];
				this.readers = Array.isArray(rRaw) ? rRaw : rRaw.data || [];

				// Sách (có thể dùng BookService.getAllBooks)
				const booksRes = await BookService.getAllBooks();
				this.books = Array.isArray(booksRes)
					? booksRes
					: booksRes.data || [];
			} catch (error) {
				console.error(error);
			}
		},
		formatDate(date) {
			if (!date) return "";
			const d = new Date(date);
			if (Number.isNaN(d.getTime())) return "";
			return d.toLocaleDateString("en-US");
		},
		statusClass(status) {
			if (status === "Đã trả") return "status-chip--returned";
			if (status === "Đang mượn") return "status-chip--borrowed";
			if (status === "Quá hạn") return "status-chip--overdue";
			return "status-chip--default";
		},

		openCreateModal() {
			const today = new Date();
			const iso = today.toISOString().slice(0, 10);
			const after14 = new Date(
				today.getFullYear(),
				today.getMonth(),
				today.getDate() + 14
			)
				.toISOString()
				.slice(0, 10);

			this.form = {
				MaDocGia: "",
				MaSach: "",
				NgayMuon: iso,
				NgayTra: after14,
			};

			this.readerSearch = "";
			this.readerResults = [];
			this.selectedReader = null;

			this.bookSearch = "";
			this.bookResults = [];
			this.selectedBook = null;

			this.showCreateModal = true;
		},

		closeCreateModal() {
			if (this.creating) return;
			this.showCreateModal = false;
		},

		async submitCreateBorrow() {
			this.creating = true;
			try {
				// Lấy mã nhân viên từ localStorage
				const raw = localStorage.getItem("staffInfo");
				let msnv = null;
				if (raw) {
					try {
						const info = JSON.parse(raw);
						msnv = info?.MSNV || null;
					} catch (e) {}
				}

				const payload = {
					MaDocGia: this.form.MaDocGia,
					MaSach: this.form.MaSach,
					NgayMuon: this.form.NgayMuon,
					NgayTra: this.form.NgayTra,
					NhanVienXuLy: msnv,
				};

				const res = await BorrowService.createBorrowAdmin(payload);
				if (!res.success || !res.data) {
					toast.error(res.message || "Tạo phiếu mượn thất bại.");
					return;
				}

				toast.success("Tạo phiếu mượn thành công.");
				this.showCreateModal = false;
				this.loadBorrows();
			} catch (error) {
				console.error(error);
				const msg =
					error?.response?.data?.message || "Lỗi khi tạo phiếu mượn.";
				toast.error(msg);
			} finally {
				this.creating = false;
			}
		},

		// ====== Trả sách ======
		openReturnModal(borrow) {
			this.currentBorrow = borrow;
			this.returnDate = new Date().toISOString().slice(0, 10);
			this.showReturnModal = true;
		},

		closeReturnModal() {
			if (this.returning) return;
			this.showReturnModal = false;
			this.currentBorrow = null;
		},
		async submitReturnBorrow() {
			if (!this.currentBorrow) return;
			this.returning = true;
			this.returningId = this.currentBorrow.MaPhieuMuon;
			try {
				const res = await BorrowService.returnBorrowAdmin(
					this.currentBorrow.MaPhieuMuon,
					this.returnDate
				);
				if (!res.success || !res.data) {
					toast.error(res.message || "Trả sách thất bại.");
					return;
				}
				toast.success("Trả sách thành công.");
				this.showReturnModal = false;
				this.currentBorrow = null;
				this.loadBorrows();
			} catch (error) {
				console.error(error);
				const msg =
					error?.response?.data?.message || "Lỗi khi trả sách.";
				toast.error(msg);
			} finally {
				this.returning = false;
				this.returningId = null;
			}
		},
		async searchReaders() {
			if (!this.readerSearch.trim()) {
				this.readerResults = [];
				this.selectedReader = null;
				this.form.MaDocGia = "";
				return;
			}
			this.readerSearching = true;
			try {
				const res = await ReaderService.getAllReaders({
					search: this.readerSearch,
					limit: 10,
				});

				console.log("searchReaders response:", res);

				// res là { success, data, pagination } từ API
				if (res?.success && Array.isArray(res.data)) {
					this.readerResults = res.data;
				} else if (Array.isArray(res)) {
					this.readerResults = res;
				} else if (res?.data && Array.isArray(res.data)) {
					this.readerResults = res.data;
				} else {
					this.readerResults = [];
				}

				console.log("readerResults:", this.readerResults);

				if (this.readerResults.length === 0) {
					toast.info("Không tìm thấy độc giả phù hợp.");
				}
			} catch (error) {
				console.error("searchReaders error:", error);
				toast.error("Lỗi khi tìm kiếm độc giả.");
			} finally {
				this.readerSearching = false;
			}
		},

		chooseReader(r) {
			this.selectedReader = r;
			this.form.MaDocGia = r.MaDocGia;
			// Có thể clear list cho gọn
			// this.readerResults = [];
		},

		async searchBooks() {
			if (!this.bookSearch.trim()) {
				this.bookResults = [];
				this.selectedBook = null;
				this.form.MaSach = "";
				return;
			}
			this.bookSearching = true;
			try {
				// FE BookService.searchBooks đã gọi /api/books/search?keyword=
				const res = await BookService.searchBooks(this.bookSearch);
				// book.controller searchBooks trả { success, message, count, data }
				const raw = res?.data || res || [];
				this.bookResults = Array.isArray(raw) ? raw : raw.data || [];
			} catch (error) {
				console.error(error);
				toast.error("Không tìm được sách.");
			} finally {
				this.bookSearching = false;
			}
		},

		chooseBook(bk) {
			this.selectedBook = bk;
			this.form.MaSach = bk.MaSach;
			// this.bookResults = [];
		},
	},
};
</script>

<style scoped>
.admin-page {
	background-color: #f5f7fb;
	min-height: 100vh;
}

.admin-borrow-table thead th {
	font-size: 0.8rem;
	color: #6b7280;
	border-bottom: 1px solid #e5e7eb;
}

.admin-borrow-table tbody td {
	font-size: 0.85rem;
	border-top: 1px solid #f3f4f6;
}

.admin-borrow-table__book {
	max-width: 260px;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}

/* status chip */
.status-chip {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 90px;
	padding: 0.2rem 0.9rem;
	border-radius: 999px;
	font-size: 0.8rem;
	font-weight: 600;
}
.status-chip--returned {
	background-color: #dcfce7;
	color: #15803d;
}
.status-chip--borrowed {
	background-color: #e0e7ff;
	color: #111827;
}
.status-chip--overdue {
	background-color: #fee2e2;
	color: #b91c1c;
}
.status-chip--default {
	background-color: #e5e7eb;
	color: #374151;
}

/* modal đơn giản */
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
