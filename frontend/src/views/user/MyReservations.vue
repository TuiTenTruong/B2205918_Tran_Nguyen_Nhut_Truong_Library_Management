<template>
	<div class="container-fluid py-3 reservations-page">
		<!-- Tiêu đề -->
		<div class="row mb-3">
			<div class="col-12">
				<h4 class="fw-bold mb-1">Sách đã đặt trước</h4>
				<p class="text-muted mb-0">
					Theo dõi các sách đã đặt trước và vị trí trong hàng đợi
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
							<span class="stat-icon stat-icon--waiting me-2">
								<i class="fa-solid fa-clock"></i>
							</span>
							<div>
								<div class="small text-muted">Đang chờ</div>
								<div class="fw-bold">
									{{ waitingCount }} phiếu
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
							<span class="stat-icon stat-icon--ready me-2">
								<i class="fa-solid fa-check-circle"></i>
							</span>
							<div>
								<div class="small text-muted">Sẵn sàng</div>
								<div class="fw-bold">{{ readyCount }} sách</div>
							</div>
						</div>
						<span
							v-if="readyCount > 0"
							class="badge bg-success-subtle text-success small"
						>
							Đừng bỏ lỡ!
						</span>
					</div>
				</div>
			</div>

			<div class="col-6 col-lg-3">
				<div class="card border-0 shadow-sm h-100 summary-card">
					<div
						class="card-body d-flex align-items-center justify-content-between"
					>
						<div class="d-flex align-items-center">
							<span class="stat-icon stat-icon--borrowed me-2">
								<i class="fa-solid fa-book"></i>
							</span>
							<div>
								<div class="small text-muted">Đã mượn</div>
								<div class="fw-bold">
									{{ borrowedCount }} phiếu
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
							<span class="stat-icon stat-icon--total me-2">
								<i class="fa-solid fa-list"></i>
							</span>
							<div>
								<div class="small text-muted">Tổng số</div>
								<div class="fw-bold">
									{{ reservations.length }} phiếu
								</div>
							</div>
						</div>
						<span
							v-if="reservations.length > 0"
							class="badge bg-light text-muted small"
						>
							Đã lưu lịch sử
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Danh sách đặt trước -->
		<div class="row">
			<div class="col-12">
				<div class="card border-0 shadow-sm">
					<div
						class="card-header bg-white border-0 d-flex justify-content-between align-items-center"
					>
						<div class="d-flex align-items-center gap-2">
							<h6 class="mb-0 fw-semibold">
								Danh sách đặt trước
							</h6>
							<span
								class="badge bg-light text-muted small"
								v-if="reservations.length > 0"
							>
								{{ reservations.length }} phiếu
							</span>
						</div>
						<button
							class="btn btn-sm btn-outline-secondary d-flex align-items-center"
							@click="loadReservations"
							:disabled="loading"
						>
							<i class="fa-solid fa-rotate me-1"></i>
							Làm mới
						</button>
					</div>

					<div class="card-body p-0">
						<div
							v-if="loading"
							class="py-4 text-center text-muted small"
						>
							<div
								class="spinner-border spinner-border-sm me-2"
							></div>
							Đang tải danh sách đặt trước...
						</div>

						<div
							v-else-if="reservations.length === 0"
							class="py-4 text-center text-muted small"
						>
							<div
								class="d-flex flex-column align-items-center justify-content-center"
							>
								<i
									class="fa-solid fa-inbox fa-2x mb-2 mx-auto"
								></i>
							</div>
							Bạn chưa có phiếu đặt trước nào.
						</div>

						<div v-else class="table-responsive">
							<table
								class="table table-borderless table-hover align-middle mb-0 reservations-table"
							>
								<thead>
									<tr>
										<th class="text-nowrap">Sách</th>
										<th class="text-nowrap">Ngày đặt</th>
										<th class="text-center text-nowrap">
											Vị trí hàng đợi
										</th>
										<th class="text-nowrap">Trạng thái</th>
										<th class="text-nowrap">
											Hạn lấy sách
										</th>
										<th class="text-center text-nowrap">
											Thao tác
										</th>
									</tr>
								</thead>
								<tbody>
									<tr
										v-for="reservation in reservations"
										:key="reservation.MaDatTruoc"
										:class="rowClass(reservation)"
									>
										<td>
											<div
												class="d-flex align-items-center"
											>
												<img
													:src="
														getBookCover(
															reservation.book
														)
													"
													class="book-thumb me-2"
													@error="onImgError"
												/>
												<div>
													<div class="fw-semibold">
														{{
															reservation.book
																?.TenSach ||
															"Không rõ"
														}}
													</div>
													<small class="text-muted">
														{{ reservation.MaSach }}
													</small>
												</div>
											</div>
										</td>
										<td class="text-nowrap small">
											{{
												formatDate(reservation.NgayDat)
											}}
										</td>
										<td class="text-center">
											<span
												v-if="
													reservation.TrangThai ===
													'Đang chờ'
												"
												class="badge bg-secondary"
											>
												#{{ reservation.ThuTuHangDoi }}
											</span>
											<span v-else>-</span>
										</td>
										<td>
											<span
												class="status-chip"
												:class="
													getStatusClass(
														reservation.TrangThai
													)
												"
											>
												{{
													getStatusText(
														reservation.TrangThai
													)
												}}
											</span>
										</td>
										<td class="text-nowrap small">
											<span
												v-if="reservation.HanLaySach"
												:class="{
													'text-danger fw-semibold':
														isExpiringSoon(
															reservation.HanLaySach
														),
												}"
											>
												{{
													formatDateTime(
														reservation.HanLaySach
													)
												}}
											</span>
											<span v-else class="text-muted"
												>–</span
											>
										</td>
										<td class="text-center">
											<button
												v-if="
													canCancel(
														reservation.TrangThai
													)
												"
												class="btn btn-sm btn-outline-danger d-inline-flex align-items-center"
												@click="
													cancelReservation(
														reservation
													)
												"
												:disabled="
													cancelingId ===
													reservation.MaDatTruoc
												"
											>
												<i
													class="fa-solid fa-times me-1"
												></i>
												<span
													v-if="
														cancelingId ===
														reservation.MaDatTruoc
													"
												>
													Đang hủy...
												</span>
												<span v-else>Hủy</span>
											</button>
											<span
												v-else
												class="text-muted small"
												>–</span
											>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Thông báo khi có sách sẵn sàng -->
		<div
			v-if="readyReservations.length > 0"
			class="alert alert-success mt-3 d-flex align-items-center"
		>
			<i class="fa-solid fa-bell me-2"></i>
			<div class="small">
				<strong>Chú ý!</strong> Bạn có
				<strong>{{ readyReservations.length }}</strong> cuốn sách sẵn
				sàng để lấy. Vui lòng đến thư viện trước hạn.
			</div>
		</div>

		<!-- Modal xác nhận hủy -->
		<div v-if="showCancelModal && reservationToCancel" class="modal-backdrop-custom">
			<div class="modal-dialog-custom">
				<div class="card border-0 shadow">
					<div
						class="card-header bg-white d-flex justify-content-between align-items-center"
					>
						<h6 class="mb-0 fw-semibold">Xác nhận hủy đặt trước</h6>
						<button
							class="btn btn-sm btn-outline-secondary"
							@click="closeCancelModal"
							:disabled="cancelingId"
						>
							<i class="fa-solid fa-xmark"></i>
						</button>
					</div>
					<div class="card-body small">
						<p class="mb-2">
							Bạn có chắc muốn hủy đặt trước sách
							<strong>"{{ reservationToCancel.book?.TenSach || reservationToCancel.MaSach }}"</strong>?
						</p>
						<p class="text-muted small mb-3">
							Hành động này không thể hoàn tác.
						</p>

						<div class="d-flex justify-content-end gap-2">
							<button
								class="btn btn-outline-secondary btn-sm"
								@click="closeCancelModal"
								:disabled="cancelingId"
							>
								Hủy bỏ
							</button>
							<button
								class="btn btn-danger btn-sm"
								@click="confirmCancel"
								:disabled="cancelingId"
							>
								<span v-if="cancelingId">Đang hủy...</span>
								<span v-else>Xác nhận hủy</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ReservationService from "@/services/reservation.service";
import { toast } from "vue3-toastify";

export default {
	name: "MyReservations",
	data() {
		return {
			reservations: [],
			loading: false,
			cancelingId: null,

			// Modal hủy
			showCancelModal: false,
			reservationToCancel: null,
		};
	},
	computed: {
		waitingCount() {
			return this.reservations.filter((r) => r.TrangThai === "Đang chờ")
				.length;
		},
		readyCount() {
			return this.reservations.filter((r) => r.TrangThai === "Sẵn sàng")
				.length;
		},
		borrowedCount() {
			return this.reservations.filter((r) => r.TrangThai === "Đã mượn")
				.length;
		},
		readyReservations() {
			return this.reservations.filter((r) => r.TrangThai === "Sẵn sàng");
		},
	},
	created() {
		this.checkLogin();
		this.loadReservations();
	},
	methods: {
		checkLogin() {
			const token = localStorage.getItem("readerToken");
			if (!token) {
				toast.info("Vui lòng đăng nhập để xem danh sách đặt trước.");
				this.$router.push({ path: "/auth", query: { mode: "login" } });
			}
		},
		async loadReservations() {
			this.loading = true;
			try {
				const res = await ReservationService.getMyReservations();
				if (res.success) {
					this.reservations = res.data || [];
				} else {
					toast.error(
						res.message || "Không thể tải danh sách đặt trước."
					);
				}
			} catch (error) {
				console.error(error);
				toast.error("Có lỗi xảy ra khi tải danh sách đặt trước.");
			} finally {
				this.loading = false;
			}
		},
		getBookCover(book) {
			if (!book || !book.AnhBia) {
				return "/placeholder-book.png";
			}
			return `/uploads/books/${book.AnhBia}`;
		},
		onImgError(e) {
			e.target.src = "/placeholder-book.png";
		},
		formatDate(date) {
			if (!date) return "-";
			const d = new Date(date);
			if (Number.isNaN(d.getTime())) return "-";
			return d.toLocaleDateString("vi-VN");
		},
		formatDateTime(date) {
			if (!date) return "-";
			const d = new Date(date);
			if (Number.isNaN(d.getTime())) return "-";
			return d.toLocaleString("vi-VN", {
				day: "2-digit",
				month: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
			});
		},
		getStatusClass(status) {
			switch (status) {
				case "Đang chờ":
					return "bg-warning-subtle text-warning";
				case "Sẵn sàng":
					return "bg-success-subtle text-success";
				case "Đã mượn":
					return "bg-primary-subtle text-primary";
				case "Hết hạn":
					return "bg-danger-subtle text-danger";
				case "Đã hủy":
					return "bg-secondary-subtle text-secondary";
				default:
					return "bg-secondary-subtle text-secondary";
			}
		},
		getStatusText(status) {
			switch (status) {
				case "Đang chờ":
					return "Đang chờ";
				case "Sẵn sàng":
					return "Sẵn sàng";
				case "Đã mượn":
					return "Đã mượn";
				case "Hết hạn":
					return "Hết hạn";
				case "Đã hủy":
					return "Đã hủy";
				default:
					return status || "Không rõ";
			}
		},
		// highlight row
		rowClass(r) {
			return {
				"row-waiting": r.TrangThai === "Đang chờ",
				"row-ready": r.TrangThai === "Sẵn sàng",
			};
		},
		canCancel(status) {
			return ["Đang chờ", "Sẵn sàng"].includes(status);
		},
		isExpiringSoon(hanLaySach) {
			if (!hanLaySach) return false;
			const deadline = new Date(hanLaySach);
			const now = new Date();
			const hoursLeft = (deadline - now) / (1000 * 60 * 60);
			return hoursLeft <= 12 && hoursLeft > 0;
		},
		async cancelReservation(reservation) {
			this.reservationToCancel = reservation;
			this.showCancelModal = true;
		},

		closeCancelModal() {
			if (this.cancelingId) return;
			this.showCancelModal = false;
			this.reservationToCancel = null;
		},

		async confirmCancel() {
			if (!this.reservationToCancel) return;
			this.cancelingId = this.reservationToCancel.MaDatTruoc;
			try {
				const res = await ReservationService.cancelReservation(
					this.reservationToCancel.MaDatTruoc
				);
				if (res.success) {
					toast.success("Hủy đặt trước thành công.");
					this.cancelingId = null;
					this.showCancelModal = false;
					this.reservationToCancel = null;
					await this.loadReservations();
				} else {
					toast.error(res.message || "Không thể hủy đặt trước.");
				}
			} catch (error) {
				console.error(error);
				const msg =
					error?.response?.data?.message ||
					"Có lỗi xảy ra khi hủy đặt trước.";
				toast.error(msg);
			} finally {
				this.cancelingId = null;
			}
		},
	},
};
</script>

<style scoped>
.reservations-page {
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
.stat-icon--waiting {
	background-color: #fef3c7;
	color: #92400e;
}
.stat-icon--ready {
	background-color: #dcfce7;
	color: #15803d;
}
.stat-icon--borrowed {
	background-color: #dbeafe;
	color: #1d4ed8;
}
.stat-icon--total {
	background-color: #e5e7eb;
	color: #374151;
}

/* table */
.reservations-table thead th {
	font-size: 0.8rem;
	color: #6b7280;
	border-bottom: 1px solid #e5e7eb;
}
.reservations-table tbody td {
	font-size: 0.85rem;
	border-top: 1px solid #f3f4f6;
}

/* row highlight */
.row-waiting {
	background-color: #fffbeb; /* yellow-50 */
}
.row-ready {
	background-color: #ecfdf5; /* green-50 */
}

/* book thumb */
.book-thumb {
	width: 40px;
	height: 55px;
	object-fit: cover;
	border-radius: 4px;
	background-color: #e5e7eb;
}

/* status chip */
.status-chip {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 80px;
	padding: 0.2rem 0.7rem;
	border-radius: 999px;
	font-size: 0.75rem;
	font-weight: 600;
}

/* subtle bg colors */
.bg-warning-subtle {
	background-color: #fef3c7 !important;
	color: #92400e !important;
}

.bg-success-subtle {
	background-color: #dcfce7 !important;
	color: #15803d !important;
}

.bg-primary-subtle {
	background-color: #dbeafe !important;
	color: #1d4ed8 !important;
}

.bg-danger-subtle {
	background-color: #fee2e2 !important;
	color: #b91c1c !important;
}

.bg-secondary-subtle {
	background-color: #f3f4f6 !important;
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
