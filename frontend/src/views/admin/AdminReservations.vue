<template>
	<div class="container-fluid py-3 admin-page">
		<!-- Header -->
		<div
			class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3"
		>
			<div>
				<h4 class="fw-bold mb-1">Quản lí đặt trước sách</h4>
				<p class="text-muted mb-0 small">
					Quản lí các đặt trước sách của độc giả trong thư viện.
				</p>
			</div>
			<div class="d-flex gap-2 flex-wrap">
				<button
					class="btn btn-outline-warning btn-sm d-flex align-items-center"
					@click="processExpired"
					:disabled="processingExpired"
				>
					<i class="fa-solid fa-clock-rotate-left me-1"></i>
					<span v-if="processingExpired">Đang xử lý...</span>
					<span v-else>Xử lý hết hạn</span>
				</button>
				<button
					class="btn btn-outline-secondary btn-sm d-flex align-items-center"
					@click="loadReservations"
					:disabled="loading"
				>
					<i class="fa-solid fa-rotate me-1"></i>
					Làm mới
				</button>
			</div>
		</div>

		<!-- Stats -->
		<div class="row g-3 mb-3">
			<div class="col-6 col-md-4 col-xl-2">
				<div class="card border-0 shadow-sm h-100">
					<div class="card-body py-2 px-3 d-flex align-items-center">
						<span class="stat-icon stat-icon--waiting me-2">
							<i class="fa-solid fa-clock"></i>
						</span>
						<div>
							<div class="small text-muted">Đang chờ</div>
							<div class="fw-bold">{{ stats.dangCho }}</div>
						</div>
					</div>
				</div>
			</div>

			<div class="col-6 col-md-4 col-xl-2">
				<div class="card border-0 shadow-sm h-100">
					<div class="card-body py-2 px-3 d-flex align-items-center">
						<span class="stat-icon stat-icon--ready me-2">
							<i class="fa-solid fa-check-circle"></i>
						</span>
						<div>
							<div class="small text-muted">Sẵn sàng</div>
							<div class="fw-bold">{{ stats.sanSang }}</div>
						</div>
					</div>
				</div>
			</div>

			<div class="col-6 col-md-4 col-xl-2">
				<div class="card border-0 shadow-sm h-100">
					<div class="card-body py-2 px-3 d-flex align-items-center">
						<span class="stat-icon stat-icon--borrowed me-2">
							<i class="fa-solid fa-book"></i>
						</span>
						<div>
							<div class="small text-muted">Đã mượn</div>
							<div class="fw-bold">{{ stats.daMuon }}</div>
						</div>
					</div>
				</div>
			</div>

			<div class="col-6 col-md-4 col-xl-2">
				<div class="card border-0 shadow-sm h-100">
					<div class="card-body py-2 px-3 d-flex align-items-center">
						<span class="stat-icon stat-icon--returned me-2">
							<i class="fa-solid fa-book-open"></i>
						</span>
						<div>
							<div class="small text-muted">Đã trả</div>
							<div class="fw-bold">{{ stats.daTra }}</div>
						</div>
					</div>
				</div>
			</div>

			<div class="col-6 col-md-4 col-xl-2">
				<div class="card border-0 shadow-sm h-100">
					<div class="card-body py-2 px-3 d-flex align-items-center">
						<span class="stat-icon stat-icon--expired me-2">
							<i class="fa-solid fa-times-circle"></i>
						</span>
						<div>
							<div class="small text-muted">Hết hạn</div>
							<div class="fw-bold">{{ stats.hetHan }}</div>
						</div>
					</div>
				</div>
			</div>

			<div class="col-6 col-md-4 col-xl-2">
				<div class="card border-0 shadow-sm h-100">
					<div class="card-body py-2 px-3 d-flex align-items-center">
						<span class="stat-icon stat-icon--cancelled me-2">
							<i class="fa-solid fa-ban"></i>
						</span>
						<div>
							<div class="small text-muted">Đã hủy</div>
							<div class="fw-bold">{{ stats.daHuy }}</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Total nổi bật hơn một chút -->
			<div class="col-12 col-md-6 col-xl-4">
				<div class="card border-0 shadow-sm h-100">
					<div
						class="card-body py-2 px-3 d-flex justify-content-between align-items-center"
					>
						<div>
							<div class="small text-muted">
								Tổng số đặt trước
							</div>
							<div class="fs-5 fw-bold">
								{{ stats.total }}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Filter -->
		<div class="card border-0 shadow-sm mb-3">
			<div
				class="card-body py-2 d-flex justify-content-between align-items-center flex-wrap gap-2"
			>
				<div class="d-flex align-items-center gap-2">
					<i class="fa-solid fa-filter text-muted small"></i>
					<span class="small fw-semibold">Lọc theo trạng thái</span>
				</div>
				<div class="d-flex align-items-center gap-2">
					<select
						class="form-select form-select-sm w-auto"
						v-model="filterStatus"
						@change="loadReservations"
					>
						<option value="">Tất cả</option>
						<option value="Đang chờ">Đang chờ</option>
						<option value="Sẵn sàng">Sẵn sàng</option>
						<option value="Đã mượn">Đã mượn</option>
						<option value="Đã trả">Đã trả</option>
						<option value="Hết hạn">Hết hạn</option>
						<option value="Đã hủy">Đã hủy</option>
					</select>
				</div>
			</div>
		</div>

		<!-- Reservation table -->
		<div class="card border-0 shadow-sm">
			<div
				class="card-header bg-white border-0 d-flex justify-content-between align-items-center"
			>
				<div class="d-flex align-items-center gap-2">
					<h6 class="mb-0 fw-semibold">Danh sách đặt trước</h6>
					<span
						class="badge bg-secondary-subtle text-secondary small"
					>
						{{ reservations.length }} bản ghi
					</span>
				</div>
			</div>

			<div class="card-body p-0">
				<div v-if="loading" class="py-3 text-center text-muted small">
					<div class="spinner-border spinner-border-sm me-2"></div>
					Đang tải danh sách đặt trước...
				</div>

				<div
					v-else-if="reservations.length === 0"
					class="py-4 text-center text-muted small"
				>
					<i class="fa-solid fa-inbox fa-2x mb-2 d-block"></i>
					Không có bản ghi đặt trước nào.
				</div>

				<div v-else class="table-responsive">
					<table
						class="table table-borderless table-hover align-middle mb-0 admin-table"
					>
						<thead>
							<tr>
								<th class="text-nowrap">Mã ĐT</th>
								<th class="text-nowrap">Độc giả</th>
								<th>Sách</th>
								<th class="text-nowrap">Ngày đặt</th>
								<th class="text-nowrap text-center">
									STT hàng đợi
								</th>
								<th class="text-nowrap">Trạng thái</th>
								<th class="text-nowrap">Hạn lấy sách</th>
								<th class="text-end text-nowrap">Thao tác</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="r in reservations"
								:key="r.MaDatTruoc"
								:class="rowClass(r)"
							>
								<td class="text-nowrap small text-muted">
									{{ r.MaDatTruoc }}
								</td>

								<td class="text-nowrap">
									<div class="fw-semibold small">
										{{ r.readerName || r.MaDocGia }}
									</div>
									<div class="text-muted smaller">
										{{ r.MaDocGia }}
									</div>
								</td>

								<td class="admin-table__book">
									{{ r.bookTitle || r.MaSach }}
								</td>

								<td class="text-nowrap small">
									{{ formatDate(r.NgayDat) }}
								</td>

								<td class="text-center">
									<span
										v-if="r.TrangThai === 'Đang chờ'"
										class="badge rounded-pill bg-secondary-subtle text-secondary small"
									>
										#{{ r.ThuTuHangDoi }}
									</span>
									<span v-else class="text-muted small"
										>-</span
									>
								</td>

								<td>
									<span
										class="status-chip"
										:class="statusClass(r.TrangThai)"
									>
										{{ statusText(r.TrangThai) }}
									</span>
								</td>

								<td class="text-nowrap">
									<span
										v-if="r.HanLaySach"
										:class="{
											'text-danger fw-semibold':
												isExpiringSoon(r.HanLaySach),
											'text-muted small': !isExpiringSoon(
												r.HanLaySach
											),
										}"
									>
										{{ formatDateTime(r.HanLaySach) }}
									</span>
									<span v-else class="text-muted small"
										>-</span
									>
								</td>

								<td class="text-end text-nowrap">
									<!-- Process pickup -->
									<button
										v-if="r.TrangThai === 'Sẵn sàng'"
										class="btn btn-sm btn-success me-1 d-inline-flex align-items-center"
										@click="openPickupModal(r)"
										:disabled="
											processingId === r.MaDatTruoc
										"
									>
										<i
											class="fa-solid fa-hand-holding me-1"
										></i>
										<span
											v-if="processingId === r.MaDatTruoc"
										>
											...
										</span>
										<span v-else>Lấy sách</span>
									</button>

									<!-- Cancel -->
									<button
										v-if="
											r.TrangThai === 'Đang chờ' ||
											r.TrangThai === 'Sẵn sàng'
										"
										class="btn btn-sm btn-outline-danger d-inline-flex align-items-center"
										@click="cancelReservation(r)"
										:disabled="cancelingId === r.MaDatTruoc"
									>
										<span
											v-if="cancelingId === r.MaDatTruoc"
										>
											...
										</span>
										<span v-else>Hủy</span>
									</button>

									<span
										v-if="
											r.TrangThai !== 'Đang chờ' &&
											r.TrangThai !== 'Sẵn sàng'
										"
										class="text-muted small"
									>
										–
									</span>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Pickup modal -->
		<div v-if="showPickupModal" class="modal-backdrop-custom">
			<div class="modal-dialog-custom">
				<div class="card border-0 shadow">
					<div
						class="card-header bg-white d-flex justify-content-between align-items-center"
					>
						<h6 class="mb-0 fw-semibold">
							<i class="fa-solid fa-hand-holding me-2"></i>
							Xử lý lấy sách
						</h6>
						<button
							class="btn btn-sm btn-outline-secondary"
							@click="closePickupModal"
							:disabled="processing"
						>
							<i class="fa-solid fa-xmark"></i>
						</button>
					</div>

					<div class="card-body small">
						<div class="alert alert-info small mb-3">
							<i class="fa-solid fa-info-circle me-2"></i>
							Thao tác này sẽ tạo phiếu mượn cho sách đã đặt
							trước.
						</div>

						<div class="mb-3">
							<div class="text-muted mb-1">Độc giả</div>
							<div class="fw-semibold">
								{{ currentReservation?.readerName }}
								<span class="text-muted">
									({{ currentReservation?.MaDocGia }})
								</span>
							</div>
						</div>

						<div class="mb-3">
							<div class="text-muted mb-1">Sách</div>
							<div class="fw-semibold">
								{{ currentReservation?.bookTitle }}
								<span class="text-muted">
									({{ currentReservation?.MaSach }})
								</span>
							</div>
						</div>

						<div class="mb-3">
							<div class="text-muted mb-1">Hạn lấy sách</div>
							<div
								class="fw-semibold"
								:class="{
									'text-danger': isExpiringSoon(
										currentReservation?.HanLaySach
									),
								}"
							>
								{{
									formatDateTime(
										currentReservation?.HanLaySach
									)
								}}
							</div>
						</div>

						<div class="row">
							<div class="col-6 mb-3">
								<label class="form-label text-muted mb-1">
									Ngày mượn
								</label>
								<input
									type="date"
									class="form-control form-control-sm bg-light"
									:value="todayDate"
									readonly
								/>
								<div class="form-text smaller">
									Ngày mượn là hôm nay.
								</div>
							</div>
							<div class="col-6 mb-3">
								<label class="form-label text-muted mb-1">
									Ngày trả
								</label>
								<input
									type="date"
									class="form-control form-control-sm"
									v-model="pickupDueDate"
									:min="todayDate"
									:max="maxPickupDueDate"
									required
								/>
								<div class="form-text smaller">
									Tối đa 14 ngày từ hôm nay.
								</div>
							</div>
						</div>
					</div>

					<div
						class="card-footer bg-white border-0 d-flex justify-content-end gap-2"
					>
						<button
							type="button"
							class="btn btn-outline-secondary btn-sm"
							@click="closePickupModal"
							:disabled="processing"
						>
							Hủy
						</button>
						<button
							type="button"
							class="btn btn-success btn-sm"
							@click="submitPickup"
							:disabled="processing"
						>
							<span v-if="processing">Đang xử lý...</span>
							<span v-else>
								<i class="fa-solid fa-check me-1"></i>
								Xác nhận & Tạo phiếu mượn
							</span>
						</button>
					</div>
				</div>
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
							Bạn có chắc muốn hủy đặt trước của
							<strong>"{{ reservationToCancel.readerName || reservationToCancel.MaDocGia }}"</strong>
							cho sách
							<strong>"{{ reservationToCancel.bookTitle || reservationToCancel.MaSach }}"</strong>?
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
								<span v-if="cancelingId">Đang xử lý...</span>
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
	name: "AdminReservations",
	data() {
		return {
			reservations: [],
			loading: false,
			filterStatus: "",

			stats: {
				dangCho: 0,
				sanSang: 0,
				daMuon: 0,
				daTra: 0,
				hetHan: 0,
				daHuy: 0,
				total: 0,
			},

			processingExpired: false,
			processingId: null,
			cancelingId: null,

			// Modal pickup
			showPickupModal: false,
			currentReservation: null,
			processing: false,
			pickupDueDate: "",

			// Modal cancel
			showCancelModal: false,
			reservationToCancel: null,
		};
	},
	computed: {
		todayDate() {
			return new Date().toISOString().slice(0, 10);
		},
		maxPickupDueDate() {
			const today = new Date();
			const max = new Date(today);
			max.setDate(today.getDate() + 14);
			return max.toISOString().slice(0, 10);
		},
	},
	created() {
		this.loadReservations();
		this.loadStats();
	},
	methods: {
		async loadReservations() {
			this.loading = true;
			try {
				const filters = {};
				if (this.filterStatus) {
					filters.TrangThai = this.filterStatus;
				}
				const res = await ReservationService.getAllReservationsAdmin(
					filters
				);
				if (res.success) {
					this.reservations = res.data || [];
				} else {
					toast.error(
						res.message || "Không tải được danh sách đặt trước."
					);
				}
			} catch (error) {
				console.error(error);
				toast.error("Có lỗi xảy ra khi tải danh sách đặt trước.");
			} finally {
				this.loading = false;
			}
		},

		async loadStats() {
			try {
				const res = await ReservationService.getReservationStatistics();
				if (res.success && res.data) {
					this.stats = res.data;
				}
			} catch (error) {
				console.error(error);
			}
		},

		formatDate(date) {
			if (!date) return "-";
			const d = new Date(date);
			if (Number.isNaN(d.getTime())) return "-";
			return d.toLocaleDateString("en-US");
		},

		formatDateTime(date) {
			if (!date) return "-";
			const d = new Date(date);
			if (Number.isNaN(d.getTime())) return "-";
			return d.toLocaleString("en-US", {
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		},

		statusClass(status) {
			switch (status) {
				case "Đang chờ":
					return "status-chip--waiting";
				case "Sẵn sàng":
					return "status-chip--ready";
				case "Đã mượn":
					return "status-chip--borrowed";
				case "Đã trả":
					return "status-chip--returned";
				case "Hết hạn":
					return "status-chip--expired";
				case "Đã hủy":
					return "status-chip--cancelled";
				default:
					return "status-chip--default";
			}
		},

		statusText(status) {
			switch (status) {
				case "Đang chờ":
					return "Đang chờ";
				case "Sẵn sàng":
					return "Sẵn sàng";
				case "Đã mượn":
					return "Đã mượn";
				case "Đã trả":
					return "Đã trả";
				case "Hết hạn":
					return "Hết hạn";
				case "Đã hủy":
					return "Đã hủy";
				default:
					return status || "Không xác định";
			}
		},

		isExpiringSoon(hanLaySach) {
			if (!hanLaySach) return false;
			const deadline = new Date(hanLaySach);
			const now = new Date();
			const hoursLeft = (deadline - now) / (1000 * 60 * 60);
			return hoursLeft <= 12 && hoursLeft > 0;
		},

		// class cho từng hàng trong bảng (để highlight nhẹ)
		rowClass(r) {
			return {
				"row-ready": r.TrangThai === "Sẵn sàng",
				"row-expired": r.TrangThai === "Hết hạn",
			};
		},

		// Mở modal xử lý lấy sách
		openPickupModal(reservation) {
			this.currentReservation = reservation;
			// Set default due date = 14 days from today
			const today = new Date();
			const dueDate = new Date(today);
			dueDate.setDate(today.getDate() + 14);
			this.pickupDueDate = dueDate.toISOString().slice(0, 10);
			this.showPickupModal = true;
		},

		closePickupModal() {
			if (this.processing) return;
			this.showPickupModal = false;
			this.currentReservation = null;
		},

		// Xử lý lấy sách
		async submitPickup() {
			if (!this.currentReservation) return;

			if (!this.pickupDueDate) {
				toast.error("Vui lòng chọn ngày trả.");
				return;
			}

			this.processing = true;
			this.processingId = this.currentReservation.MaDatTruoc;

			try {
				const res = await ReservationService.completeReservation(
					this.currentReservation.MaDatTruoc,
					this.pickupDueDate
				);

				if (!res.success) {
					toast.error(res.message || "Không thể xử lý lấy sách.");
					return;
				}

				const borrowInfo = res.data?.borrow;
				if (borrowInfo) {
					toast.success(
						`Xử lý lấy sách thành công! Phiếu mượn: ${borrowInfo.MaPhieuMuon}`
					);
				} else {
					toast.success(
						"Xử lý lấy sách thành công! Đã tạo phiếu mượn."
					);
				}

				this.showPickupModal = false;
				this.currentReservation = null;
				this.loadReservations();
				this.loadStats();
			} catch (error) {
				console.error("Error in submitPickup:", error);
				const msg =
					error?.response?.data?.message ||
					error?.message ||
					"Có lỗi xảy ra khi xử lý lấy sách.";
				toast.error(msg);
			} finally {
				this.processing = false;
				this.processingId = null;
			}
		},

		// Hủy đặt trước
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
				const res = await ReservationService.adminCancelReservation(
					this.reservationToCancel.MaDatTruoc
				);
				if (res.success) {
					toast.success("Hủy đặt trước thành công.");
					this.cancelingId = null;
					this.showCancelModal = false;
					this.reservationToCancel = null;
					this.loadReservations();
					this.loadStats();
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

		// Xử lý đơn hết hạn
		async processExpired() {
			this.processingExpired = true;
			try {
				const res =
					await ReservationService.processExpiredReservations();
				if (res.success) {
					toast.success(res.message || "Đã xử lý các đơn hết hạn.");
					this.loadReservations();
					this.loadStats();
				} else {
					toast.error(res.message || "Không thể xử lý đơn hết hạn.");
				}
			} catch (error) {
				console.error(error);
				toast.error("Có lỗi xảy ra khi xử lý đơn hết hạn.");
			} finally {
				this.processingExpired = false;
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

/* bảng */
.admin-table thead th {
	font-size: 0.8rem;
	color: #6b7280;
	border-bottom: 1px solid #e5e7eb;
}
.admin-table tbody td {
	font-size: 0.85rem;
	border-top: 1px solid #f3f4f6;
}
.admin-table__book {
	max-width: 220px;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}
.smaller {
	font-size: 0.75rem;
}

/* highlight hàng */
.row-ready {
	background-color: #fff7ed; /* orange-50 */
}
.row-expired {
	background-color: #fef2f2; /* red-50 */
}

/* icon nhỏ trên card thống kê */
.stat-icon {
	width: 28px;
	height: 28px;
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
.stat-icon--returned {
	background-color: #d1fae5;
	color: #047857;
}
.stat-icon--expired {
	background-color: #fee2e2;
	color: #b91c1c;
}
.stat-icon--cancelled {
	background-color: #e5e7eb;
	color: #4b5563;
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

.status-chip--waiting {
	background-color: #fef3c7;
	color: #92400e;
}
.status-chip--ready {
	background-color: #dcfce7;
	color: #15803d;
}
.status-chip--borrowed {
	background-color: #dbeafe;
	color: #1d4ed8;
}
.status-chip--returned {
	background-color: #d1fae5;
	color: #047857;
}
.status-chip--expired {
	background-color: #fee2e2;
	color: #b91c1c;
}
.status-chip--cancelled {
	background-color: #f3f4f6;
	color: #4b5563;
}
.status-chip--default {
	background-color: #e5e7eb;
	color: #374151;
}

/* modal */
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
