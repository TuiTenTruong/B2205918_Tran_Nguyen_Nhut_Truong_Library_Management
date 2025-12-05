<template>
	<div class="container-fluid py-3 history-page">
		<!-- Tiêu đề -->
		<div class="row mb-3">
			<div class="col-12">
				<h4 class="fw-bold mb-1">Lịch sử mượn sách</h4>
				<p class="text-muted mb-0">
					Theo dõi tất cả sách bạn đã mượn và trạng thái của chúng
				</p>
			</div>
		</div>

		<!-- Thống kê -->
		<div class="row g-3 mb-3">
			<div class="col-6 col-lg-3">
				<div class="card border-0 shadow-sm h-100 summary-card">
					<div
						class="card-body d-flex align-items-center justify-content-between"
					>
						<div class="d-flex align-items-center">
							<span class="stat-icon stat-icon--total me-2">
								<i class="fa-solid fa-book"></i>
							</span>
							<div>
								<div class="small text-muted">
									Tổng số đã mượn
								</div>
								<div class="fw-bold">
									{{ totalBorrowed }} cuốn
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="col-6 col-lg-3">
				<div class="card border-0 shadow-sm h-100 summary-card">
					<div
						class="card-body d-flex align-items-center justify-content-between"
					>
						<div class="d-flex align-items-center">
							<span class="stat-icon stat-icon--current me-2">
								<i class="fa-solid fa-clock"></i>
							</span>
							<div>
								<div class="small text-muted">Đang mượn</div>
								<div class="fw-bold">
									{{ currentBorrowed }} cuốn
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="col-6 col-lg-3">
				<div class="card border-0 shadow-sm h-100 summary-card">
					<div
						class="card-body d-flex align-items-center justify-content-between"
					>
						<div class="d-flex align-items-center">
							<span class="stat-icon stat-icon--overdue me-2">
								<i class="fa-solid fa-circle-xmark"></i>
							</span>
							<div>
								<div class="small text-muted">Quá hạn</div>
								<div class="fw-bold">
									{{ overdueCount }} cuốn
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="col-6 col-lg-3">
				<div class="card border-0 shadow-sm h-100 summary-card">
					<div
						class="card-body d-flex align-items-center justify-content-between"
					>
						<div class="d-flex align-items-center">
							<span class="stat-icon stat-icon--fine me-2">
								<i class="fa-solid fa-money-bill-wave"></i>
							</span>
							<div>
								<div class="small text-muted">
									Tổng tiền phạt
								</div>
								<div class="fw-bold">
									{{ formatCurrency(totalFines) }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Renewals -->
			<div class="col-12 col-lg-4">
				<div class="card border-0 shadow-sm h-100 summary-card">
					<div
						class="card-body d-flex align-items-center justify-content-between"
					>
						<div class="d-flex align-items-center">
							<span class="stat-icon stat-icon--renewal me-2">
								<i class="fa-solid fa-rotate-right"></i>
							</span>
							<div>
								<div class="small text-muted">
									Gia hạn tháng này
								</div>
								<div class="fw-bold">
									{{ renewalsThisMonth }} /
									{{ maxRenewalsPerMonth }}
								</div>
							</div>
						</div>
						<span
							class="badge bg-light text-muted small"
							v-if="maxRenewalsPerMonth - renewalsThisMonth > 0"
						>
							Còn
							{{ maxRenewalsPerMonth - renewalsThisMonth }} lần
						</span>
						<span
							class="badge bg-danger-subtle text-danger small"
							v-else
						>
							Đã đạt giới hạn
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Bảng lịch sử -->
		<div class="row">
			<div class="col-12">
				<div class="card border-0 shadow-sm">
					<div
						class="card-header bg-white border-0 d-flex justify-content-between align-items-center"
					>
						<h6 class="mb-0 fw-semibold">Danh sách phiếu mượn</h6>
						<span class="badge bg-light text-muted small">
							{{ records.length }} phiếu
						</span>
					</div>

					<div class="card-body p-0">
						<div
							v-if="loading"
							class="py-4 text-center text-muted small"
						>
							<div
								class="spinner-border spinner-border-sm me-2"
							></div>
							Đang tải lịch sử mượn...
						</div>

						<div
							v-else-if="records.length === 0"
							class="py-4 text-center text-muted small d-flex flex-column align-items-center justify-content-center"
						>
							<i class="fa-solid fa-inbox fa-2x mb-2"></i>
							Bạn chưa có phiếu mượn nào.
						</div>

						<div v-else class="table-responsive">
							<table
								class="table table-borderless table-hover align-middle mb-0 history-table"
							>
								<thead>
									<tr>
										<th class="text-nowrap">Mã sách</th>
										<th>Tên sách</th>
										<th class="text-nowrap">Ngày mượn</th>
										<th class="text-nowrap">
											Ngày hết hạn
										</th>
										<th class="text-nowrap">Ngày trả</th>
										<th class="text-nowrap">Trạng thái</th>
										<th class="text-nowrap text-center">
											Đã gia hạn
										</th>
										<th class="text-end text-nowrap">
											Tiền phạt
										</th>
										<th class="text-center text-nowrap">
											Thao tác
										</th>
									</tr>
								</thead>
								<tbody>
									<tr
										v-for="borrow in records"
										:key="borrow.MaPhieuMuon"
										:class="rowClass(borrow)"
									>
										<td
											class="history-table__code text-nowrap"
										>
											{{ borrow.MaSach }}
										</td>
										<td class="history-table__title">
											{{
												borrow.bookTitle ||
												"Đang tải..."
											}}
										</td>
										<td class="text-nowrap small">
											{{ formatDate(borrow.NgayMuon) }}
										</td>
										<td class="text-nowrap small">
											{{ formatDate(borrow.NgayTra) }}
										</td>
										<td class="text-nowrap small">
											{{
												borrow.NgayTraThucTe
													? formatDate(
															borrow.NgayTraThucTe
													  )
													: "-"
											}}
										</td>
										<td>
											<span
												class="status-chip"
												:class="
													statusClass(
														borrow.TinhTrang
													)
												"
											>
												{{
													statusText(borrow.TinhTrang)
												}}
											</span>
										</td>
										<td class="text-center text-nowrap">
											{{ borrow.SoLanGiaHan || 0 }}
										</td>
										<td class="text-end text-nowrap">
											{{
												borrow.TienPhat != null
													? formatCurrency(
															borrow.TienPhat
													  )
													: "-"
											}}
										</td>
										<td class="text-center">
											<button
												v-if="canRenew(borrow)"
												class="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
												@click="renewBorrow(borrow)"
												:disabled="
													renewingId ===
													borrow.MaPhieuMuon
												"
											>
												<i
													class="fa-solid fa-rotate-right me-1"
												></i>
												<span
													v-if="
														renewingId ===
														borrow.MaPhieuMuon
													"
												>
													Đang xử lý...
												</span>
												<span v-else>Gia hạn</span>
											</button>
											<span
												v-else-if="
													borrow.TinhTrang ===
														'Đang mượn' &&
													renewalsThisMonth >=
														maxRenewalsPerMonth
												"
												class="text-muted small"
											>
												Hết lượt tháng này
											</span>
											<span v-else class="text-muted"
												>–</span
											>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
					<!-- card-body -->
				</div>
			</div>
		</div>

		<!-- Modal xác nhận gia hạn -->
		<div
			v-if="showRenewModal && borrowToRenew"
			class="modal-backdrop-custom"
		>
			<div class="modal-dialog-custom">
				<div class="card border-0 shadow">
					<div
						class="card-header bg-white d-flex justify-content-between align-items-center"
					>
						<h6 class="mb-0 fw-semibold">Xác nhận gia hạn</h6>
						<button
							class="btn btn-sm btn-outline-secondary"
							@click="closeRenewModal"
							:disabled="renewingId"
						>
							<i class="fa-solid fa-xmark"></i>
						</button>
					</div>
					<div class="card-body small">
						<p class="mb-2">
							Bạn có muốn gia hạn sách
							<strong
								>"{{
									borrowToRenew.bookTitle ||
									borrowToRenew.MaSach
								}}"</strong
							>
							thêm <strong>7 ngày</strong>?
						</p>
						<p class="text-muted small mb-3">
							Số lần gia hạn còn lại trong tháng sau khi gia hạn:
							<strong>{{ remainingRenewals }} lần</strong>
						</p>

						<div class="d-flex justify-content-end gap-2">
							<button
								class="btn btn-outline-secondary btn-sm"
								@click="closeRenewModal"
								:disabled="renewingId"
							>
								Hủy
							</button>
							<button
								class="btn btn-primary btn-sm"
								@click="confirmRenew"
								:disabled="renewingId"
							>
								<span v-if="renewingId">Đang xử lý...</span>
								<span v-else>Xác nhận gia hạn</span>
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
import BookService from "@/services/book.service";
import { toast } from "vue3-toastify";

export default {
	name: "BorrowHistory",
	data() {
		return {
			records: [],
			loading: false,
			renewingId: null,
			renewalsThisMonth: 0,
			maxRenewalsPerMonth: 3,

			// Modal gia hạn
			showRenewModal: false,
			borrowToRenew: null,
		};
	},
	computed: {
		// Hàm tính tổng số phiếu mượn
		totalBorrowed() {
			return this.records.length;
		},
		// Hàm tính số phiếu đang mượn
		currentBorrowed() {
			return this.records.filter((r) => r.TinhTrang === "Đang mượn")
				.length;
		},
		// Hàm tính số phiếu quá hạn
		overdueCount() {
			return this.records.filter((r) => r.TinhTrang === "Quá hạn").length;
		},
		// Hàm tính tổng tiền phạt
		totalFines() {
			return this.records.reduce((sum, r) => {
				const fine = Number(r.TienPhat) || 0;
				return sum + fine;
			}, 0);
		},
		// Số lần gia hạn còn lại sau khi gia hạn
		remainingRenewals() {
			return Math.max(
				this.maxRenewalsPerMonth - this.renewalsThisMonth - 1,
				0
			);
		},
	},
	created() {
		this.loadHistory();
	},
	methods: {
		// Hàm kiểm tra đăng nhập và lấy thông tin độc giả hiện tại
		requireLogin() {
			const token = localStorage.getItem("readerToken");
			const info = localStorage.getItem("readerInfo");
			if (!token || !info) {
				toast.info("Vui lòng đăng nhập để xem lịch sử mượn.");
				this.$router.push({ path: "/auth", query: { mode: "login" } });
				return null;
			}
			try {
				return JSON.parse(info);
			} catch {
				return null;
			}
		},
		// Hàm tải lịch sử mượn của độc giả hiện tại
		async loadHistory() {
			const reader = this.requireLogin();
			if (!reader || !reader.MaDocGia) return;

			this.loading = true;
			try {
				const res = await BorrowService.getBorrowsByReader(
					reader.MaDocGia
				);

				if (!res.success) {
					toast.error(
						res.message || "Không tải được lịch sử mượn sách."
					);
					this.records = [];
					return;
				}

				const borrows = res.data || [];

				const distinctBookIds = [
					...new Set(borrows.map((b) => b.MaSach)),
				];

				const bookMap = {};
				for (const id of distinctBookIds) {
					try {
						const bookRes = await BookService.getBookById(id);
						if (bookRes.success && bookRes.data) {
							bookMap[id] = bookRes.data;
						}
					} catch (e) {
						console.error("Lỗi lấy thông tin sách:", e);
					}
				}

				this.records = borrows.map((b) => ({
					...b,
					bookTitle: bookMap[b.MaSach]?.TenSach || "",
				}));

				// Tính số lần gia hạn trong tháng hiện tại
				const now = new Date();
				const currentMonth = now.getMonth();
				const currentYear = now.getFullYear();

				this.renewalsThisMonth = borrows.reduce((total, b) => {
					const updatedAt = new Date(b.updatedAt);
					if (
						updatedAt.getMonth() === currentMonth &&
						updatedAt.getFullYear() === currentYear &&
						b.SoLanGiaHan > 0
					) {
						return total + (b.SoLanGiaHan || 0);
					}
					return total;
				}, 0);
			} catch (error) {
				console.error(error);
				toast.error("Có lỗi xảy ra khi tải lịch sử mượn sách.");
				this.records = [];
			} finally {
				this.loading = false;
			}
		},
		// Hàm format ngày hiển thị
		formatDate(date) {
			if (!date) return "";
			const d = new Date(date);
			if (Number.isNaN(d.getTime())) return "";
			return d.toLocaleDateString("vi-VN");
		},
		// Hàm định dạng tiền
		formatCurrency(value) {
			const num = Number(value) || 0;
			return num.toLocaleString("vi-VN") + " đ";
		},
		// Hàm trả về class bootstrap cho trạng thái
		statusClass(status) {
			if (status === "Đang mượn") return "bg-primary-subtle text-primary";
			if (status === "Đã trả") return "bg-success-subtle text-success";
			if (status === "Quá hạn") return "bg-danger-subtle text-danger";
			return "bg-secondary-subtle text-secondary";
		},
		// Hàm trả về text hiển thị cho trạng thái
		statusText(status) {
			if (status === "Đang mượn") return "Đang mượn";
			if (status === "Đã trả") return "Đã trả";
			if (status === "Quá hạn") return "Quá hạn";
			return status || "Không rõ";
		},
		// class cho từng dòng (để highlight nhẹ)
		rowClass(borrow) {
			return {
				"row-current": borrow.TinhTrang === "Đang mượn",
				"row-overdue": borrow.TinhTrang === "Quá hạn",
			};
		},
		// Kiểm tra xem có thể gia hạn không
		canRenew(borrow) {
			// Chỉ được gia hạn khi đang mượn và chưa đạt giới hạn 3 lần/tháng
			if (borrow.TinhTrang !== "Đang mượn") return false;
			return this.renewalsThisMonth < this.maxRenewalsPerMonth;
		},
		// Gia hạn sách
		async renewBorrow(borrow) {
			if (this.renewingId) return;
			this.borrowToRenew = borrow;
			this.showRenewModal = true;
		},

		closeRenewModal() {
			if (this.renewingId) return;
			this.showRenewModal = false;
			this.borrowToRenew = null;
		},

		async confirmRenew() {
			if (!this.borrowToRenew) return;
			this.renewingId = this.borrowToRenew.MaPhieuMuon;
			try {
				const res = await BorrowService.renewBorrow(
					this.borrowToRenew.MaPhieuMuon
				);
				if (res.success) {
					toast.success(
						`Gia hạn thành công! Ngày trả mới: ${this.formatDate(
							res.data.ngayTraMoi
						)}`
					);
					// Cập nhật số lần gia hạn trong tháng
					this.renewalsThisMonth =
						res.data.soLanGiaHanTrongThang ||
						this.renewalsThisMonth + 1;
					this.renewingId = null;
					this.showRenewModal = false;
					this.borrowToRenew = null;
					// Reload lại danh sách
					await this.loadHistory();
				} else {
					toast.error(res.message || "Không thể gia hạn sách.");
				}
			} catch (error) {
				console.error("Lỗi gia hạn:", error);
				const message =
					error.response?.data?.message ||
					"Có lỗi xảy ra khi gia hạn sách.";
				toast.error(message);
			} finally {
				this.renewingId = null;
			}
		},
	},
};
</script>

<style scoped>
.history-page {
	background-color: #f5f7fb;
	min-height: 100vh;
}

/* summary cards */
.summary-card .card-body {
	padding: 0.9rem 1.1rem;
	font-size: 0.9rem;
}
.stat-icon {
	width: 30px;
	height: 30px;
	border-radius: 999px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: 0.85rem;
}
.stat-icon--total {
	background-color: #dbeafe;
	color: #1d4ed8;
}
.stat-icon--current {
	background-color: #fef3c7;
	color: #92400e;
}
.stat-icon--overdue {
	background-color: #fee2e2;
	color: #b91c1c;
}
.stat-icon--fine {
	background-color: #dcfce7;
	color: #15803d;
}
.stat-icon--renewal {
	background-color: #e5e7eb;
	color: #374151;
}

/* table */
.history-table thead th {
	font-size: 0.8rem;
	color: #6b7280;
	border-bottom: 1px solid #e5e7eb;
}
.history-table tbody td {
	font-size: 0.85rem;
	border-top: 1px solid #f3f4f6;
}

.history-table__code {
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
		"Liberation Mono", "Courier New", monospace;
	font-size: 0.82rem;
	color: #6b7280;
}
.history-table__title {
	font-weight: 500;
	color: #111827;
}

/* highlight hàng */
.row-current {
	background-color: #eff6ff; /* blue-50 */
}
.row-overdue {
	background-color: #fef2f2; /* red-50 */
}

/* chip trạng thái */
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

/* tinh chỉnh màu chip với BS subtle */
.status-chip.bg-primary-subtle {
	background-color: #e0e7ff !important;
	color: #1d4ed8 !important;
}
.status-chip.bg-success-subtle {
	background-color: #dcfce7 !important;
	color: #15803d !important;
}
.status-chip.bg-danger-subtle {
	background-color: #fee2e2 !important;
	color: #b91c1c !important;
}
.status-chip.bg-secondary-subtle {
	background-color: #e5e7eb !important;
	color: #4b5563 !important;
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
