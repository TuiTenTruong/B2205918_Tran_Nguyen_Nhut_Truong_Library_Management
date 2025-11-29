<template>
	<div class="container-fluid py-3 history-page">
		<!-- Tiêu đề -->
		<div class="row mb-3">
			<div class="col-12">
				<h4 class="fw-bold mb-1">Borrowing History</h4>
				<p class="text-muted mb-0">
					Track all your borrowed books and their status
				</p>
			</div>
		</div>

		<!-- Thống kê -->
		<div class="row g-3 mb-3">
			<div class="history-summary col-12 col-md-4">
				<div
					class="history-summary__card card border-0 shadow-sm h-100"
				>
					<div
						class="card-body d-flex flex-column justify-content-between"
					>
						<div class="d-flex align-items-center mb-2">
							<i class="fa-solid fa-book me-2 text-info"></i>
							<span class="fw-semiboldsmall">Total Borrowed</span>
						</div>
						<div class="text-muted small">
							{{ totalBorrowed }} books
						</div>
					</div>
				</div>
			</div>

			<div class="col-12 col-md-4">
				<div
					class="history-summary__card card border-0 shadow-sm h-100"
				>
					<div
						class="card-body d-flex flex-column justify-content-between"
					>
						<div class="d-flex align-items-center mb-2">
							<i class="fa-solid fa-clock me-2 text-warning"></i>
							<span class="fw-semiboldsmall"
								>Currently Borrowed</span
							>
						</div>
						<div class="text-muted small">
							{{ currentBorrowed }} books
						</div>
					</div>
				</div>
			</div>

			<div class="col-12 col-md-4">
				<div
					class="history-summary__card card border-0 shadow-sm h-100"
				>
					<div
						class="card-body d-flex flex-column justify-content-between"
					>
						<div class="d-flex align-items-center mb-2">
							<i
								class="fa-solid fa-circle-xmark me-2 text-danger"
							></i>
							<span class="fw-semiboldsmall">Overdue</span>
						</div>
						<div class="text-muted small">
							{{ overdueCount }} books
						</div>
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
						<h6 class="mb-0 fw-semibold">Borrowing Records</h6>
					</div>

					<div class="card-body p-0">
						<div
							v-if="loading"
							class="py-4 text-center text-muted small"
						>
							Đang tải lịch sử mượn...
						</div>

						<div
							v-else-if="records.length === 0"
							class="py-4 text-center text-muted small"
						>
							Bạn chưa có phiếu mượn nào.
						</div>

						<div v-else class="table-responsive">
							<table class="history-table w-100">
								<thead>
									<tr>
										<th class="text-nowrap">
											Accession No.
										</th>
										<th>Book Title</th>
										<th class="text-nowrap">Borrow Date</th>
										<th class="text-nowrap">Due Date</th>
										<th class="text-nowrap">Return Date</th>
										<th class="text-nowrap">Status</th>
										<th class="text-end text-nowrap">
											Fine
										</th>
									</tr>
								</thead>
								<tbody>
									<tr
										v-for="borrow in records"
										:key="borrow.MaPhieuMuon"
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
										<td class="text-nowrap">
											{{ formatDate(borrow.NgayMuon) }}
										</td>
										<td class="text-nowrap">
											{{ formatDate(borrow.NgayTra) }}
										</td>
										<td class="text-nowrap">
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
										<td class="text-end text-nowrap">
											{{ borrow.Fine || "-" }}
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
						console.log(bookMap);
					} catch (e) {
						console.error("Lỗi lấy thông tin sách:", e);
					}
				}

				this.records = borrows.map((b) => ({
					...b,
					bookTitle: bookMap[b.MaSach]?.TenSach || "",
				}));
				console.log(this.records);
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
			return d.toLocaleDateString("en-US");
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
			if (status === "Đang mượn") return "Borrowed";
			if (status === "Đã trả") return "Returned";
			if (status === "Quá hạn") return "Overdue";
			return status || "Unknown";
		},
	},
};
</script>

<style scoped>
.history-page {
	background-color: #f5f7fb;
	min-height: 100vh;
}
.history-summary__card .card-body {
	height: 130px;
	border-radius: 0.5rem;
	font-size: 20px;
	padding: 18px 24px;
}
.history-table {
	border-collapse: collapse;
	width: 100%;
	font-size: 0.9rem;
	background-color: #fff;
}

.history-table thead th {
	padding: 0.75rem 1.25rem;
	font-weight: 600;
	color: #374151;
	border-bottom: 1px solid #e5e7eb;
}

.history-table tbody td {
	padding: 0.7rem 1.25rem;
	border-top: 1px solid #f3f4f6;
	vertical-align: middle;
}

.history-table tbody tr:last-child td {
	border-bottom: 1px solid #f3f4f6;
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

/* nếu statusClass trả về class riêng thì giữ;
   nếu đang trả bg-primary-subtle/... của BS5 thì có thể thêm: */
.status-chip.bg-primary-subtle {
	background-color: #e0e7ff !important;
	color: #111827 !important;
}
.status-chip.bg-success-subtle {
	background-color: #dcfce7 !important;
	color: #15803d !important;
}
.status-chip.bg-danger-subtle {
	background-color: #fee2e2 !important;
	color: #b91c1c !important;
}
</style>
