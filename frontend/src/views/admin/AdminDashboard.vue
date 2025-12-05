<template>
	<div class="container-fluid py-3 admin-page">
		<!-- Header -->
		<div class="row mb-3">
			<div
				class="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2"
			>
				<div>
					<h4 class="fw-bold mb-1">Quản trị viên</h4>
					<p class="text-muted mb-0 small">
						Tổng quan hoạt động thư viện
					</p>
				</div>
				<div class="text-muted small">
					Cập nhật lần cuối: {{ formatDateTime(lastUpdated) }}
				</div>
			</div>
		</div>

		<!-- Summary cards -->
		<div class="row g-3 mb-3">
			<div
				class="col-6 col-md-3"
				v-for="card in summaryCards"
				:key="card.label"
			>
				<div
					class="card border-0 shadow-sm h-100 summary-card"
					:class="card.colorClass"
				>
					<div class="card-body">
						<div
							class="d-flex justify-content-between align-items-center mb-2"
						>
							<span class="text-muted small">{{
								card.label
							}}</span>
							<div class="icon-wrapper" :class="card.iconBg">
								<i :class="card.icon"></i>
							</div>
						</div>
						<div class="fs-4 fw-bold">{{ card.value }}</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Charts Row 1 -->
		<div class="row g-3 mb-3">
			<!-- Borrowing Status Doughnut Chart -->
			<div class="col-12 col-lg-4">
				<div class="card border-0 shadow-sm h-100">
					<div class="card-header bg-white border-0">
						<h6 class="mb-0 fw-semibold">
							<i
								class="fa-solid fa-chart-pie me-2 text-primary"
							></i>
							Trạng thái mượn
						</h6>
					</div>
					<div class="card-body">
						<div
							v-if="loading"
							class="py-3 text-center text-muted small"
						>
							Đang tải...
						</div>
						<div v-else class="chart-container-sm">
							<canvas ref="borrowStatusChart"></canvas>
						</div>
						<div class="mt-3">
							<div
								class="d-flex flex-wrap gap-2 justify-content-center"
							>
								<span
									class="badge-legend"
									style="--color: #3b82f6"
								>
									Đang mượn: {{ stats.borrow.dangMuon }}
								</span>
								<span
									class="badge-legend"
									style="--color: #10b981"
								>
									Đã trả: {{ stats.borrow.daTra }}
								</span>
								<span
									class="badge-legend"
									style="--color: #ef4444"
								>
									Quá hạn: {{ stats.borrow.quaHan }}
								</span>
								<span
									class="badge-legend"
									style="--color: #6b7280"
								>
									Mất sách: {{ stats.borrow.matSach }}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Reservation Status Bar Chart -->
			<div class="col-12 col-lg-4">
				<div class="card border-0 shadow-sm h-100">
					<div class="card-header bg-white border-0">
						<h6 class="mb-0 fw-semibold">
							<i
								class="fa-solid fa-chart-bar me-2 text-success"
							></i>
							Trạng thái đặt trước
						</h6>
					</div>
					<div class="card-body">
						<div
							v-if="loadingReservation"
							class="py-3 text-center text-muted small"
						>
							Đang tải...
						</div>
						<div v-else class="chart-container-sm">
							<canvas ref="reservationChart"></canvas>
						</div>
					</div>
				</div>
			</div>

			<!-- Overdue table -->
			<div class="col-12 col-lg-4">
				<div class="card border-0 shadow-sm h-100">
					<div class="card-header bg-white border-0">
						<h6 class="mb-0 fw-semibold">
							<i
								class="fa-solid fa-exclamation-triangle me-2 text-warning"
							></i>
							Hết hạn mượn
						</h6>
					</div>
					<div class="card-body p-0">
						<div
							v-if="loadingOverdue"
							class="py-3 text-center text-muted small"
						>
							Đang tải danh sách quá hạn...
						</div>
						<div
							v-else-if="overdueBorrows.length === 0"
							class="py-4 text-center text-muted"
						>
							<i
								class="fa-solid fa-check-circle fa-2x mb-2 text-success"
							></i>
							<p class="small mb-0">Không có sách quá hạn 🎉</p>
						</div>
						<div
							v-else
							class="table-responsive"
							style="max-height: 280px; overflow-y: auto"
						>
							<table
								class="table table-borderless align-middle mb-0 admin-overdue-table"
							>
								<thead class="sticky-top bg-white">
									<tr>
										<th class="text-nowrap">Độc giả</th>
										<th>Sách</th>
										<th class="text-end text-nowrap">
											Số ngày
										</th>
									</tr>
								</thead>
								<tbody>
									<tr
										v-for="b in overdueBorrows.slice(0, 5)"
										:key="b.MaPhieuMuon"
									>
										<td class="text-nowrap small">
											{{ b.readerName || b.MaDocGia }}
										</td>
										<td
											class="admin-overdue-table__book small"
										>
											{{ b.bookTitle || b.MaSach }}
										</td>
										<td class="text-end">
											<span class="badge bg-danger"
												>{{ calcDaysOverdue(b) }}d</span
											>
										</td>
									</tr>
								</tbody>
							</table>
							<div
								v-if="overdueBorrows.length > 5"
								class="text-center py-2 border-top"
							>
								<router-link
									to="/admin/borrows"
									class="small text-primary"
								>
									Xem tất cả {{ overdueBorrows.length }} quá
									hạn →
								</router-link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Charts Row 2 -->
		<div class="row g-3 mb-3">
			<!-- Monthly Borrow Line Chart -->
			<div class="col-12 col-lg-8">
				<div class="card border-0 shadow-sm">
					<div
						class="card-header bg-white border-0 d-flex justify-content-between align-items-center"
					>
						<h6 class="mb-0 fw-semibold">
							<i
								class="fa-solid fa-chart-line me-2 text-info"
							></i>
							Mượn sách theo tháng
						</h6>
						<button
							class="btn btn-sm btn-outline-secondary"
							@click="loadMonthlyBorrowChart"
							:disabled="loadingMonthly"
						>
							<i class="fa-solid fa-rotate me-1"></i>
							Làm mới
						</button>
					</div>
					<div class="card-body">
						<div
							v-if="loadingMonthly"
							class="text-center text-muted small py-3"
						>
							Đang tải biểu đồ...
						</div>
						<div v-else class="chart-container">
							<canvas ref="borrowChart"></canvas>
						</div>
					</div>
				</div>
			</div>

			<!-- Quick Stats -->
			<div class="col-12 col-lg-4">
				<div class="card border-0 shadow-sm h-100">
					<div class="card-header bg-white border-0">
						<h6 class="mb-0 fw-semibold">
							<i class="fa-solid fa-bolt me-2 text-warning"></i>
							Thống kê nhanh
						</h6>
					</div>
					<div class="card-body">
						<div class="quick-stat-item">
							<div
								class="d-flex justify-content-between align-items-center mb-2"
							>
								<span class="text-muted small"
									>Tổng số mượn</span
								>
								<span class="fw-bold">{{
									stats.borrow.total
								}}</span>
							</div>
							<div class="progress" style="height: 6px">
								<div
									class="progress-bar bg-primary"
									:style="{ width: '100%' }"
								></div>
							</div>
						</div>
						<div class="quick-stat-item mt-3">
							<div
								class="d-flex justify-content-between align-items-center mb-2"
							>
								<span class="text-muted small">Đang mượn</span>
								<span class="fw-bold text-primary"
									>{{ activeRate }}%</span
								>
							</div>
							<div class="progress" style="height: 6px">
								<div
									class="progress-bar bg-primary"
									:style="{ width: activeRate + '%' }"
								></div>
							</div>
						</div>
						<div class="quick-stat-item mt-3">
							<div
								class="d-flex justify-content-between align-items-center mb-2"
							>
								<span class="text-muted small">Đã trả</span>
								<span class="fw-bold text-success"
									>{{ returnRate }}%</span
								>
							</div>
							<div class="progress" style="height: 6px">
								<div
									class="progress-bar bg-success"
									:style="{ width: returnRate + '%' }"
								></div>
							</div>
						</div>
						<div class="quick-stat-item mt-3">
							<div
								class="d-flex justify-content-between align-items-center mb-2"
							>
								<span class="text-muted small">Quá hạn</span>
								<span class="fw-bold text-danger"
									>{{ overdueRate }}%</span
								>
							</div>
							<div class="progress" style="height: 6px">
								<div
									class="progress-bar bg-danger"
									:style="{ width: overdueRate + '%' }"
								></div>
							</div>
						</div>
						<div class="quick-stat-item mt-3">
							<div
								class="d-flex justify-content-between align-items-center mb-2"
							>
								<span class="text-muted small"
									>Tiền phạt chưa thu</span
								>
								<span class="fw-bold text-warning">{{
									formatCurrency(
										stats.borrow.tongTienPhatChuaThu
									)
								}}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import BookService from "@/services/book.service";
import BorrowService from "@/services/borrow.service";
import ReaderService from "@/services/reader.service";
import ReservationService from "@/services/reservation.service";
import {
	Chart,
	LineController,
	LineElement,
	PointElement,
	CategoryScale,
	LinearScale,
	Tooltip,
	Legend,
	Title,
	Filler,
	DoughnutController,
	ArcElement,
	BarController,
	BarElement,
} from "chart.js";
import { toast } from "vue3-toastify";

Chart.register(
	LineController,
	LineElement,
	PointElement,
	CategoryScale,
	LinearScale,
	Tooltip,
	Legend,
	Title,
	Filler,
	DoughnutController,
	ArcElement,
	BarController,
	BarElement
);

export default {
	name: "AdminDashboard",
	data() {
		return {
			stats: {
				books: 0,
				readers: 0,
				borrow: {
					total: 0,
					dangMuon: 0,
					daTra: 0,
					quaHan: 0,
					matSach: 0,
					tongTienPhatChuaThu: 0,
				},
				reservation: {
					dangCho: 0,
					sanSang: 0,
					daMuon: 0,
					daTra: 0,
					hetHan: 0,
					daHuy: 0,
					total: 0,
				},
			},
			overdueBorrows: [],
			loading: false,
			loadingOverdue: false,
			loadingReservation: false,
			lastUpdated: null,
			loadingMonthly: false,
			monthlyLabels: [],
			monthlyCounts: [],
			borrowChartInstance: null,
			borrowStatusChartInstance: null,
			reservationChartInstance: null,
		};
	},
	computed: {
		summaryCards() {
			return [
				{
					label: "Tổng sách",
					value: this.stats.books,
					icon: "fa-solid fa-book",
					iconBg: "bg-primary-light",
					colorClass: "",
				},
				{
					label: "Độc giả",
					value: this.stats.readers,
					icon: "fa-solid fa-users",
					iconBg: "bg-success-light",
					colorClass: "",
				},
				{
					label: "Đang mượn",
					value: this.stats.borrow.dangMuon,
					icon: "fa-solid fa-hand-holding",
					iconBg: "bg-info-light",
					colorClass: "",
				},
				{
					label: "Quá hạn",
					value: this.stats.borrow.quaHan,
					icon: "fa-solid fa-exclamation-circle",
					iconBg: "bg-danger-light",
					colorClass:
						this.stats.borrow.quaHan > 0 ? "border-danger" : "",
				},
			];
		},
		activeRate() {
			if (this.stats.borrow.total === 0) return 0;
			return Math.round(
				(this.stats.borrow.dangMuon / this.stats.borrow.total) * 100
			);
		},
		returnRate() {
			if (this.stats.borrow.total === 0) return 0;
			return Math.round(
				(this.stats.borrow.daTra / this.stats.borrow.total) * 100
			);
		},
		overdueRate() {
			if (this.stats.borrow.total === 0) return 0;
			return Math.round(
				(this.stats.borrow.quaHan / this.stats.borrow.total) * 100
			);
		},
	},
	created() {
		this.loadDashboardData();
		this.loadOverdueBorrows();
		this.loadReservationStats();
	},
	mounted() {
		this.loadMonthlyBorrowChart();
	},
	beforeUnmount() {
		if (this.borrowChartInstance) {
			this.borrowChartInstance.destroy();
			this.borrowChartInstance = null;
		}
		if (this.borrowStatusChartInstance) {
			this.borrowStatusChartInstance.destroy();
			this.borrowStatusChartInstance = null;
		}
		if (this.reservationChartInstance) {
			this.reservationChartInstance.destroy();
			this.reservationChartInstance = null;
		}
	},
	methods: {
		async loadDashboardData() {
			this.loading = true;
			try {
				// Books
				const books = await BookService.getAllBooks();
				this.stats.books = Array.isArray(books)
					? books.length
					: books?.data?.length || 0;

				// Readers
				try {
					if (ReaderService.getAllReaders) {
						const readersRes = await ReaderService.getAllReaders();
						if (Array.isArray(readersRes)) {
							this.stats.readers = readersRes.length;
						} else if (Array.isArray(readersRes.data)) {
							this.stats.readers =
								readersRes.pagination?.total ??
								readersRes.data.length;
						}
					}
				} catch (e) {
					console.error("Error loading readers:", e);
				}

				// Borrow statistics
				const borrowStatsRes = await BorrowService.getStatistics();
				const s = borrowStatsRes?.data || borrowStatsRes;
				this.stats.borrow.total = s?.total ?? 0;
				this.stats.borrow.dangMuon = s?.dangMuon ?? 0;
				this.stats.borrow.daTra = s?.daTra ?? 0;
				this.stats.borrow.quaHan = s?.quaHan ?? 0;
				this.stats.borrow.matSach = s?.matSach ?? 0;
				this.stats.borrow.tongTienPhatChuaThu =
					s?.tongTienPhatChuaThu ?? 0;

				this.lastUpdated = new Date();

				// Render borrow status chart after data loaded
				this.$nextTick(() => {
					setTimeout(() => {
						this.renderBorrowStatusChart();
					}, 100);
				});
			} catch (error) {
				console.error(error);
				toast.error("Không tải được thống kê dashboard.");
			} finally {
				this.loading = false;
			}
		},

		async loadReservationStats() {
			this.loadingReservation = true;
			try {
				const res = await ReservationService.getReservationStatistics();
				if (res.success && res.data) {
					this.stats.reservation = res.data;
				}
				this.$nextTick(() => {
					setTimeout(() => {
						this.renderReservationChart();
					}, 100);
				});
			} catch (error) {
				console.error("Error loading reservation stats:", error);
			} finally {
				this.loadingReservation = false;
			}
		},

		async loadOverdueBorrows() {
			this.loadingOverdue = true;
			try {
				const res = await BorrowService.getOverdueBorrows();
				const list = res?.data || res || [];
				this.overdueBorrows = Array.isArray(list)
					? list
					: list.data || [];
			} catch (error) {
				console.error(error);
				this.overdueBorrows = [];
			} finally {
				this.loadingOverdue = false;
			}
		},

		formatDate(date) {
			if (!date) return "";
			const d = new Date(date);
			if (Number.isNaN(d.getTime())) return "";
			return d.toLocaleDateString("en-US");
		},

		formatDateTime(date) {
			if (!date) return "—";
			const d = new Date(date);
			if (Number.isNaN(d.getTime())) return "—";
			return d.toLocaleString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
				year: "numeric",
				month: "short",
				day: "2-digit",
			});
		},

		formatCurrency(amount) {
			if (!amount) return "0 ₫";
			return new Intl.NumberFormat("vi-VN", {
				style: "currency",
				currency: "VND",
			}).format(amount);
		},

		calcDaysOverdue(borrow) {
			if (!borrow.NgayTra) return "-";
			const due = new Date(borrow.NgayTra);
			const today = new Date();
			if (Number.isNaN(due.getTime())) return "-";
			const diffMs = today - due;
			if (diffMs <= 0) return "0";
			const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
			return days.toString();
		},

		// Biểu đồ tròn - Trạng thái mượn sách
		renderBorrowStatusChart() {
			const canvas = this.$refs.borrowStatusChart;
			if (!canvas) return;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			if (this.borrowStatusChartInstance) {
				this.borrowStatusChartInstance.destroy();
			}

			this.borrowStatusChartInstance = new Chart(ctx, {
				type: "doughnut",
				data: {
					labels: ["Active", "Returned", "Overdue", "Lost"],
					datasets: [
						{
							data: [
								this.stats.borrow.dangMuon,
								this.stats.borrow.daTra,
								this.stats.borrow.quaHan,
								this.stats.borrow.matSach,
							],
							backgroundColor: [
								"#3b82f6",
								"#10b981",
								"#ef4444",
								"#6b7280",
							],
							borderWidth: 0,
							hoverOffset: 4,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					cutout: "65%",
					plugins: {
						legend: {
							display: false,
						},
						tooltip: {
							backgroundColor: "rgba(17, 24, 39, 0.9)",
							padding: 12,
							cornerRadius: 8,
						},
					},
				},
			});
		},

		// Biểu đồ cột - Trạng thái đặt trước
		renderReservationChart() {
			const canvas = this.$refs.reservationChart;
			if (!canvas) return;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			if (this.reservationChartInstance) {
				this.reservationChartInstance.destroy();
			}

			this.reservationChartInstance = new Chart(ctx, {
				type: "bar",
				data: {
					labels: [
						"Waiting",
						"Ready",
						"Borrowed",
						"Returned",
						"Expired",
						"Cancelled",
					],
					datasets: [
						{
							label: "Reservations",
							data: [
								this.stats.reservation.dangCho,
								this.stats.reservation.sanSang,
								this.stats.reservation.daMuon,
								this.stats.reservation.daTra,
								this.stats.reservation.hetHan,
								this.stats.reservation.daHuy,
							],
							backgroundColor: [
								"#f59e0b",
								"#10b981",
								"#3b82f6",
								"#06b6d4",
								"#ef4444",
								"#6b7280",
							],
							borderRadius: 6,
							borderSkipped: false,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							display: false,
						},
						tooltip: {
							backgroundColor: "rgba(17, 24, 39, 0.9)",
							padding: 12,
							cornerRadius: 8,
						},
					},
					scales: {
						y: {
							beginAtZero: true,
							ticks: {
								stepSize: 1,
								color: "#6b7280",
								font: { size: 10 },
							},
							grid: {
								color: "rgba(229, 231, 235, 0.5)",
							},
						},
						x: {
							ticks: {
								color: "#6b7280",
								font: { size: 9 },
							},
							grid: {
								display: false,
							},
						},
					},
				},
			});
		},

		async loadMonthlyBorrowChart() {
			this.loadingMonthly = true;
			try {
				const res = await BorrowService.getAllBorrowsAdmin();
				let borrows = [];
				if (Array.isArray(res)) {
					borrows = res;
				} else if (Array.isArray(res?.data)) {
					borrows = res.data;
				} else if (Array.isArray(res?.data?.data)) {
					borrows = res.data.data;
				}

				const countsByMonth = {};
				for (const b of borrows) {
					if (!b.NgayMuon) continue;
					const d = new Date(b.NgayMuon);
					if (Number.isNaN(d.getTime())) continue;
					const key = `${d.getFullYear()}-${String(
						d.getMonth() + 1
					).padStart(2, "0")}`;
					countsByMonth[key] = (countsByMonth[key] || 0) + 1;
				}

				const last6Keys = [];
				const now = new Date();
				for (let i = 5; i >= 0; i--) {
					const d = new Date(
						now.getFullYear(),
						now.getMonth() - i,
						1
					);
					const key = `${d.getFullYear()}-${String(
						d.getMonth() + 1
					).padStart(2, "0")}`;
					last6Keys.push(key);
				}

				this.monthlyLabels = last6Keys.map((k) => {
					const [year, month] = k.split("-");
					const date = new Date(Number(year), Number(month) - 1, 1);
					return date.toLocaleString("en-US", {
						month: "short",
						year: "numeric",
					});
				});

				this.monthlyCounts = last6Keys.map(
					(k) => countsByMonth[k] || 0
				);
			} catch (error) {
				console.error("Error loading monthly chart:", error);
				const last6Keys = [];
				const now = new Date();
				for (let i = 5; i >= 0; i--) {
					const d = new Date(
						now.getFullYear(),
						now.getMonth() - i,
						1
					);
					last6Keys.push(d);
				}
				this.monthlyLabels = last6Keys.map((d) =>
					d.toLocaleString("en-US", {
						month: "short",
						year: "numeric",
					})
				);
				this.monthlyCounts = [0, 0, 0, 0, 0, 0];
			} finally {
				this.loadingMonthly = false;
				this.$nextTick(() => {
					setTimeout(() => {
						this.renderBorrowChart();
					}, 100);
				});
			}
		},

		renderBorrowChart() {
			const canvas = this.$refs.borrowChart;
			if (!canvas) return;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			if (this.borrowChartInstance) {
				this.borrowChartInstance.destroy();
				this.borrowChartInstance = null;
			}

			const gradient = ctx.createLinearGradient(0, 0, 0, 250);
			gradient.addColorStop(0, "rgba(59, 130, 246, 0.3)");
			gradient.addColorStop(1, "rgba(59, 130, 246, 0.02)");

			this.borrowChartInstance = new Chart(ctx, {
				type: "line",
				data: {
					labels: this.monthlyLabels,
					datasets: [
						{
							label: "Borrowed books",
							data: this.monthlyCounts,
							borderColor: "#3b82f6",
							backgroundColor: gradient,
							borderWidth: 3,
							fill: true,
							tension: 0.4,
							pointBackgroundColor: "#ffffff",
							pointBorderColor: "#3b82f6",
							pointBorderWidth: 3,
							pointRadius: 6,
							pointHoverRadius: 9,
							pointHoverBackgroundColor: "#3b82f6",
							pointHoverBorderColor: "#ffffff",
							pointHoverBorderWidth: 3,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							display: true,
							position: "top",
							labels: {
								font: { size: 12, weight: "bold" },
								color: "#374151",
								usePointStyle: true,
								pointStyle: "circle",
							},
						},
						tooltip: {
							backgroundColor: "rgba(17, 24, 39, 0.9)",
							titleColor: "#fff",
							bodyColor: "#fff",
							padding: 12,
							cornerRadius: 8,
							displayColors: true,
							intersect: false,
							mode: "index",
						},
					},
					scales: {
						y: {
							beginAtZero: true,
							ticks: {
								stepSize: 1,
								color: "#6b7280",
								font: { size: 11 },
							},
							grid: {
								color: "rgba(229, 231, 235, 0.5)",
							},
						},
						x: {
							ticks: {
								color: "#6b7280",
								font: { size: 11 },
							},
							grid: {
								display: false,
							},
						},
					},
					animation: {
						duration: 1000,
						easing: "easeOutQuart",
					},
					interaction: {
						intersect: false,
						mode: "index",
					},
				},
			});
		},
	},
};
</script>

<style scoped>
.admin-page {
	background-color: #f5f7fb;
	min-height: calc(100vh - 52px);
}

/* Summary Cards */
.summary-card {
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.summary-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.icon-wrapper {
	width: 40px;
	height: 40px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1rem;
}

.bg-primary-light {
	background-color: rgba(59, 130, 246, 0.1);
	color: #3b82f6;
}

.bg-success-light {
	background-color: rgba(16, 185, 129, 0.1);
	color: #10b981;
}

.bg-info-light {
	background-color: rgba(6, 182, 212, 0.1);
	color: #06b6d4;
}

.bg-danger-light {
	background-color: rgba(239, 68, 68, 0.1);
	color: #ef4444;
}

.border-danger {
	border-left: 4px solid #ef4444 !important;
}

/* Chart containers */
.chart-container {
	position: relative;
	height: 300px;
	width: 100%;
}

.chart-container-sm {
	position: relative;
	height: 200px;
	width: 100%;
}

.chart-container canvas,
.chart-container-sm canvas {
	width: 100% !important;
	height: 100% !important;
}

/* Badge legends for doughnut chart */
.badge-legend {
	display: inline-flex;
	align-items: center;
	font-size: 0.75rem;
	padding: 0.25rem 0.5rem;
	background-color: #f3f4f6;
	border-radius: 4px;
	color: #374151;
}

.badge-legend::before {
	content: "";
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background-color: var(--color);
	margin-right: 6px;
}

/* Quick stats */
.quick-stat-item {
	padding: 0.5rem 0;
}

.progress {
	border-radius: 10px;
	background-color: #e5e7eb;
}

.progress-bar {
	border-radius: 10px;
}

/* Overdue table */
.admin-overdue-table thead th {
	font-size: 0.75rem;
	color: #6b7280;
	border-bottom: 1px solid #e5e7eb;
	padding: 0.5rem;
}

.admin-overdue-table tbody td {
	font-size: 0.8rem;
	border-top: 1px solid #f3f4f6;
	padding: 0.5rem;
}

.admin-overdue-table__book {
	max-width: 120px;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}

/* Responsive */
@media (max-width: 768px) {
	.chart-container {
		height: 250px;
	}

	.chart-container-sm {
		height: 180px;
	}
}
</style>
