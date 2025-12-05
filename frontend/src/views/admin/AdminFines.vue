<template>
	<div class="container-fluid py-3 admin-page">
		<!-- Header -->
		<div
			class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3"
		>
			<div>
				<h4 class="fw-bold mb-1">Quản lí tiền phạt</h4>
				<p class="text-muted mb-0 small">
					Theo dõi và quản lý tiền phạt của độc giả
				</p>
			</div>
			<div class="text-muted small">
				Cập nhật lần cuối:
				{{ lastUpdated ? formatDateTime(lastUpdated) : "—" }}
			</div>
		</div>

		<!-- Summary cards -->
		<div class="row g-3 mb-3">
			<div class="col-12 col-md-4">
				<div class="card border-0 shadow-sm h-100">
					<div class="card-body">
						<div
							class="d-flex justify-content-between align-items-center mb-2"
						>
							<span class="text-muted small">Tổng tiền phạt</span>
							<i class="fa-solid fa-coins"></i>
						</div>
						<div class="fs-5 fw-semibold">
							{{ formatCurrency(stats.totalFine) }}
						</div>
						<div class="small text-muted">
							Tổng số tiền phạt đã ghi nhận
						</div>
					</div>
				</div>
			</div>
			<div class="col-12 col-md-4">
				<div class="card border-0 shadow-sm h-100">
					<div class="card-body">
						<div
							class="d-flex justify-content-between align-items-center mb-2"
						>
							<span class="text-muted small">Chưa thu</span>
							<i class="fa-regular fa-circle-xmark"></i>
						</div>
						<div class="fs-5 fw-semibold text-danger">
							{{ formatCurrency(stats.unpaidFine) }}
						</div>
						<div class="small text-muted">
							{{ stats.unpaidCount }} bản ghi
						</div>
					</div>
				</div>
			</div>
			<div class="col-12 col-md-4">
				<div class="card border-0 shadow-sm h-100">
					<div class="card-body">
						<div
							class="d-flex justify-content-between align-items-center mb-2"
						>
							<span class="text-muted small">Đã thu</span>
							<i class="fa-regular fa-circle-check"></i>
						</div>
						<div class="fs-5 fw-semibold text-success">
							{{ formatCurrency(stats.paidFine) }}
						</div>
						<div class="small text-muted">
							{{ stats.paidCount }} bản ghi
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Filters -->
		<div class="card border-0 shadow-sm mb-3">
			<div
				class="card-header bg-white border-0 d-flex justify-content-between align-items-center flex-wrap gap-2"
			>
				<h6 class="mb-0 fw-semibold">Bản ghi tiền phạt</h6>
				<div class="d-flex align-items-center gap-2 flex-wrap">
					<div class="input-group input-group-sm">
						<span class="input-group-text">
							<i class="fa-solid fa-magnifying-glass"></i>
						</span>
						<input
							type="text"
							class="form-control"
							placeholder="Tìm theo tên, email hoặc mã độc giả..."
							v-model="searchKeyword"
							@keyup.enter="loadFines"
						/>
					</div>
					<select
						class="form-select form-select-sm w-auto"
						v-model="statusFilter"
						@change="handleFilterChange"
					>
						<option value="all">Tất cả</option>
						<option value="unpaid">Chưa thu</option>
						<option value="paid">Đã thu</option>
					</select>
					<button
						class="btn btn-outline-secondary btn-sm d-flex align-items-center"
						@click="loadFines"
						:disabled="loading"
					>
						<i class="fa-solid fa-rotate me-1"></i>
						Làm mới
					</button>
				</div>
			</div>

			<div class="card-body p-0">
				<div v-if="loading" class="py-3 text-center text-muted small">
					Đang tải dữ liệu tiền phạt...
				</div>
				<div
					v-else-if="fines.length === 0"
					class="py-3 text-center text-muted small"
				>
					Không tìm thấy bản ghi tiền phạt nào.
				</div>
				<div v-else class="table-responsive">
					<table
						class="table table-borderless align-middle mb-0 admin-fine-table"
					>
						<thead>
							<tr>
								<th>Độc giả</th>
								<th class="text-nowrap">Mã phiếu mượn</th>
								<th class="text-nowrap">Sách</th>
								<th class="text-nowrap">Ngày mượn</th>
								<th class="text-nowrap">Hạn trả</th>
								<th class="text-nowrap">Ngày trả thực tế</th>
								<th class="text-nowrap text-end">
									Số tiền phạt
								</th>
								<th class="text-nowrap">Trạng thái</th>
								<th class="text-end text-nowrap">Hành động</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="item in fines" :key="item.MaPhieuMuon">
								<td>
									<div class="fw-semibold">
										{{ item.readerName || "Unknown" }}
									</div>
									<div class="text-muted small">
										{{ item.MaDocGia }}
									</div>
								</td>
								<td class="text-nowrap">
									{{ item.MaPhieuMuon }}
								</td>
								<td class="text-nowrap">
									{{ item.bookTitle || item.MaSach }}
								</td>
								<td class="text-nowrap">
									{{ formatDate(item.NgayMuon) }}
								</td>
								<td class="text-nowrap">
									{{ formatDate(item.NgayTra) }}
								</td>
								<td class="text-nowrap">
									{{
										item.NgayTraThucTe
											? formatDate(item.NgayTraThucTe)
											: "-"
									}}
								</td>
								<td class="text-end text-nowrap">
									{{
										formatCurrency(calcEstimatedFine(item))
									}}
								</td>
								<td class="text-nowrap">
									<span
										class="badge rounded-pill"
										:class="fineStatusClass(item)"
									>
										{{ fineStatusText(item) }}
									</span>
								</td>
								<td class="text-end text-nowrap">
									<button
										class="btn btn-sm btn-outline-success"
										@click="openPayModal(item)"
										:disabled="
											item.DaThanhToanTienPhat ||
											calcEstimatedFine(item) <= 0 ||
											payingId === item.MaPhieuMuon
										"
									>
										<span
											v-if="payingId === item.MaPhieuMuon"
											>...</span
										>
										<span v-else>Đánh dấu đã thu</span>
									</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<div
				v-if="pagination"
				class="card-footer bg-white border-0 small text-muted d-flex justify-content-between align-items-center flex-wrap gap-2"
			>
				<span>
					Tổng cộng:
					<strong>{{ pagination.total }}</strong> bản ghi
				</span>
				<div class="d-flex align-items-center gap-2">
					<button
						class="btn btn-sm btn-outline-secondary"
						:disabled="currentPage <= 1 || loading"
						@click="goPage(currentPage - 1)"
					>
						<i class="fa-solid fa-chevron-left"></i>
					</button>
					<span>
						Trang {{ pagination.page }} /
						{{ pagination.totalPages }}
					</span>
					<button
						class="btn btn-sm btn-outline-secondary"
						:disabled="
							currentPage >= pagination.totalPages || loading
						"
						@click="goPage(currentPage + 1)"
					>
						<i class="fa-solid fa-chevron-right"></i>
					</button>
				</div>
			</div>
		</div>

		<!-- Modal xác nhận đã thu tiền phạt -->
		<div v-if="showPayModal" class="modal-backdrop-custom">
			<div class="modal-dialog-custom">
				<div class="card border-0 shadow">
					<div
						class="card-header bg-white d-flex justify-content-between align-items-center"
					>
						<h6 class="mb-0 fw-semibold">
							Đánh dấu đã thu tiền phạt
						</h6>
						<button
							class="btn btn-sm btn-outline-secondary"
							@click="closePayModal"
							:disabled="paying"
						>
							<i class="fa-solid fa-xmark"></i>
						</button>
					</div>
					<div class="card-body small" v-if="selectedFine">
						<p class="mb-2">
							Xác nhận đã thu tiền phạt từ độc giả?
						</p>
						<ul class="mb-3">
							<li>
								<strong>Độc giả:</strong>
								{{ selectedFine.readerName }} ({{
									selectedFine.MaDocGia
								}})
							</li>
							<li>
								<strong>Mã mượn:</strong>
								{{ selectedFine.MaPhieuMuon }}
							</li>
							<li>
								<strong>Sách:</strong>
								{{ selectedFine.bookTitle || "" }}
							</li>
							<li>
								<strong>Tiền phạt:</strong>
								{{
									formatCurrency(
										calcEstimatedFine(selectedFine)
									)
								}}
							</li>
						</ul>
						<div class="d-flex justify-content-end gap-2">
							<button
								class="btn btn-outline-secondary btn-sm"
								@click="closePayModal"
								:disabled="paying"
							>
								Hủy
							</button>
							<button
								class="btn btn-success btn-sm"
								@click="confirmPay"
								:disabled="paying"
							>
								<span v-if="paying">Đang lưu...</span>
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
import BorrowService from "@/services/borrow.service";
import { toast } from "vue3-toastify";

export default {
	name: "AdminFines",
	data() {
		return {
			fines: [],
			loading: false,
			paying: false,
			payingId: null,

			searchKeyword: "",
			statusFilter: "unpaid",
			pagination: null,
			currentPage: 1,
			limit: 10,

			stats: {
				totalFine: 0,
				unpaidFine: 0,
				paidFine: 0,
				unpaidCount: 0,
				paidCount: 0,
			},
			lastUpdated: null,

			showPayModal: false,
			selectedFine: null,
		};
	},
	created() {
		this.loadFines();
	},
	methods: {
		calcEstimatedFine(borrow) {
			if (borrow.TienPhat && borrow.TienPhat > 0) {
				return borrow.TienPhat;
			}
			if (
				borrow.TinhTrang === "Quá hạn" ||
				borrow.TinhTrang === "Đang mượn"
			) {
				const ngayTra = new Date(borrow.NgayTra);
				const now = new Date();
				if (now > ngayTra) {
					const diffMs = now - ngayTra;
					const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
					return diffDays * 2000;
				}
			}
			return 0;
		},
		// Hàm format tiền VNĐ
		formatCurrency(value) {
			if (!value || Number.isNaN(Number(value))) return "0 đ";
			return Number(value).toLocaleString("vi-VN") + " đ";
		},
		// Hàm format ngày
		formatDate(date) {
			if (!date) return "-";
			const d = new Date(date);
			if (Number.isNaN(d.getTime())) return "-";
			return d.toLocaleDateString("en-US");
		},
		// Hàm format ngày + giờ
		formatDateTime(date) {
			if (!date) return "-";
			const d = new Date(date);
			if (Number.isNaN(d.getTime())) return "-";
			return d.toLocaleString("en-US", {
				year: "numeric",
				month: "short",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
			});
		},
		// Hàm trả text trạng thái tiền phạt
		fineStatusText(item) {
			const fine = this.calcEstimatedFine(item);
			if (!item || fine <= 0) return "Không phạt";
			return item.DaThanhToanTienPhat ? "Đã thu" : "Chưa thu";
		},
		// Hàm trả class badge trạng thái tiền phạt
		fineStatusClass(item) {
			const fine = this.calcEstimatedFine(item);
			if (!item || fine <= 0) {
				return "bg-secondary-subtle text-secondary";
			}
			return item.DaThanhToanTienPhat
				? "bg-success-subtle text-success"
				: "bg-danger-subtle text-danger";
		},
		// Hàm tính thống kê tiền phạt
		calcStats(allBorrows = []) {
			let total = 0;
			let unpaid = 0;
			let paid = 0;
			let unpaidCount = 0;
			let paidCount = 0;

			// Tính stats từ toàn bộ danh sách
			for (const b of allBorrows) {
				const amount = this.calcEstimatedFine(b);
				if (!amount || amount <= 0) continue;
				total += amount;
				if (b.DaThanhToanTienPhat) {
					paid += amount;
					paidCount++;
				} else {
					unpaid += amount;
					unpaidCount++;
				}
			}

			this.stats.totalFine = total;
			this.stats.unpaidFine = unpaid;
			this.stats.paidFine = paid;
			this.stats.unpaidCount = unpaidCount;
			this.stats.paidCount = paidCount;
		},
		// Hàm tải danh sách tiền phạt
		async loadFines() {
			this.loading = true;
			try {
				const res = await BorrowService.getFinesAdmin();
				let list = res?.data || [];
				if (!Array.isArray(list)) list = [];

				let filtered = list.filter(
					(b) =>
						this.calcEstimatedFine(b) > 0 ||
						b.TinhTrang === "Quá hạn"
				);

				// Lọc theo trạng thái thanh toán
				if (this.statusFilter === "unpaid") {
					filtered = filtered.filter((b) => !b.DaThanhToanTienPhat);
				} else if (this.statusFilter === "paid") {
					filtered = filtered.filter((b) => b.DaThanhToanTienPhat);
				}

				// Lọc theo từ khóa tìm kiếm
				if (this.searchKeyword.trim()) {
					const kw = this.searchKeyword.trim().toLowerCase();
					filtered = filtered.filter((b) => {
						const name = (b.readerName || "").toLowerCase();
						const id = (b.MaDocGia || "").toLowerCase();
						const borrowId = (b.MaPhieuMuon || "").toLowerCase();
						return (
							name.includes(kw) ||
							id.includes(kw) ||
							borrowId.includes(kw)
						);
					});
				}

				this.fines = filtered;
				this.pagination = null;
				this.lastUpdated = new Date();
				this.calcStats(list);
			} catch (error) {
				console.error(error);
				toast.error("Không tải được danh sách tiền phạt.");
				this.fines = [];
				this.pagination = null;
				this.calcStats([]);
			} finally {
				this.loading = false;
			}
		},
		// Hàm đổi trang
		goPage(page) {
			this.currentPage = page;
			this.loadFines();
		},
		// Hàm xử lí khi đổi filter trạng thái
		handleFilterChange() {
			this.currentPage = 1;
			this.loadFines();
		},
		// Hàm mở modal xác nhận đã thu tiền
		openPayModal(item) {
			if (!item || item.DaThanhToanTienPhat) return;
			const fine = this.calcEstimatedFine(item);
			if (fine <= 0) return;
			this.selectedFine = { ...item };
			this.showPayModal = true;
		},
		// Hàm đóng modal xác nhận đã thu tiền
		closePayModal() {
			if (this.paying) return;
			this.showPayModal = false;
			this.selectedFine = null;
		},
		// Hàm gọi API đánh dấu tiền phạt đã thanh toán
		async confirmPay() {
			if (!this.selectedFine) return;
			this.paying = true;
			this.payingId = this.selectedFine.MaPhieuMuon;
			try {
				await BorrowService.markFinePaid(this.selectedFine.MaPhieuMuon);
				toast.success("Đã cập nhật trạng thái tiền phạt.");
				this.showPayModal = false;
				this.selectedFine = null;
				await this.loadFines();
			} catch (error) {
				console.error(error);
				const msg =
					error?.response?.data?.message ||
					"Có lỗi xảy ra khi cập nhật tiền phạt.";
				toast.error(msg);
			} finally {
				this.paying = false;
				this.payingId = null;
			}
		},
	},
};
</script>

<style scoped>
.admin-page {
	background-color: #f5f7fb;
	min-height: 100vh;
}

.admin-fine-table thead th {
	font-size: 0.8rem;
	color: #6b7280;
	border-bottom: 1px solid #e5e7eb;
}
.admin-fine-table tbody td {
	font-size: 0.85rem;
	border-top: 1px solid #f3f4f6;
}

/* modal chung */
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
	max-width: 520px;
	width: 100%;
	padding: 0 12px;
}
</style>
