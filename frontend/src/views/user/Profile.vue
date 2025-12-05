<template>
	<div class="container-fluid py-3 profile-page">
		<div class="row mb-3">
			<div class="col-12">
				<h4 class="fw-bold mb-1">Hồ sơ của tôi</h4>
				<p class="text-muted mb-0">
					Xem và quản lý thông tin tài khoản của bạn
				</p>
			</div>
		</div>

		<div class="row g-3 mb-3">
			<div class="col-12 col-lg-4">
				<div class="card border-0 shadow-sm h-100">
					<div class="card-body text-center">
						<div class="mb-3">
							<div
								class="rounded-circle bg-light d-inline-flex align-items-center justify-content-center"
								style="width: 80px; height: 80px"
							>
								<span class="fs-2">😥</span>
							</div>
						</div>
						<h6 class="fw-semibold mb-1">
							{{ fullName || "Thành viên" }}
						</h6>
						<span
							class="badge rounded-pill bg-dark text-white mb-1"
						>
							Thành viên
						</span>
						<div class="text-muted small mb-3">
							{{ form.Email }}
						</div>

						<hr />

						<div class="text-start small">
							<div class="d-flex mb-2">
								<div class="me-2">
									<i class="fa-regular fa-calendar"></i>
								</div>
								<div>
									<div class="text-muted">Thành viên từ</div>
									<div class="fw-semibold">
										{{ memberSinceText }}
									</div>
								</div>
							</div>

							<div class="d-flex mb-2">
								<div class="me-2">
									<i class="fa-solid fa-phone"></i>
								</div>
								<div>
									<div class="text-muted">Số điện thoại</div>
									<div class="fw-semibold">
										{{ form.DienThoai || "Chưa cập nhật" }}
									</div>
								</div>
							</div>

							<div class="d-flex">
								<div class="me-2">
									<i class="fa-solid fa-location-dot"></i>
								</div>
								<div>
									<div class="text-muted">Địa chỉ</div>
									<div class="fw-semibold">
										{{ form.DiaChi || "Chưa cập nhật" }}
									</div>
								</div>
							</div>

							<div class="d-flex mt-2" v-if="isBanned">
								<div class="me-2">
									<i class="fa-solid fa-ban text-danger"></i>
								</div>
								<div>
									<div class="text-danger">
										Trạng thái cấm mượn
									</div>
									<div class="fw-semibold text-danger">
										Đến {{ banDateText }}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="col-12 col-lg-8">
				<div class="card border-0 shadow-sm h-100">
					<div class="card-body">
						<h6 class="fw-semibold mb-3">Chỉnh sửa thông tin</h6>

						<form @submit.prevent="saveChanges">
							<div class="row g-3">
								<div class="col-12 col-md-6">
									<label class="form-label small fw-semibold">
										Họ lót
									</label>
									<input
										v-model="form.HoLot"
										type="text"
										class="form-control"
									/>
								</div>
								<div class="col-12 col-md-6">
									<label class="form-label small fw-semibold">
										Tên
									</label>
									<input
										v-model="form.Ten"
										type="text"
										class="form-control"
									/>
								</div>

								<div class="col-12">
									<label class="form-label small fw-semibold">
										Email
									</label>
									<input
										v-model="form.Email"
										type="email"
										class="form-control"
										disabled
									/>
									<div class="form-text small">
										Email không thể thay đổi
									</div>
								</div>

								<div class="col-12 col-md-6">
									<label class="form-label small fw-semibold">
										Số điện thoại
									</label>
									<input
										v-model="form.DienThoai"
										type="text"
										class="form-control"
										disabled
									/>
								</div>

								<div class="col-12 col-md-6">
									<label class="form-label small fw-semibold">
										Ngày sinh
									</label>
									<input
										v-model="form.NgaySinh"
										type="date"
										class="form-control"
									/>
								</div>

								<div class="col-12 col-md-6">
									<label class="form-label small fw-semibold">
										Giới tính
									</label>
									<select
										v-model="form.Phai"
										class="form-select"
									>
										<option value="">Chọn giới tính</option>
										<option value="Nam">Nam</option>
										<option value="Nữ">Nữ</option>
										<option value="Khác">Khác</option>
									</select>
								</div>

								<div class="col-12">
									<label class="form-label small fw-semibold">
										Địa chỉ
									</label>
									<input
										v-model="form.DiaChi"
										type="text"
										class="form-control"
									/>
								</div>
							</div>

							<div
								class="d-flex gap-2 mt-3 justify-content-end flex-wrap"
							>
								<button
									type="button"
									class="btn btn-outline-secondary btn-sm"
									@click="resetForm"
									:disabled="saving"
								>
									Hủy
								</button>
								<button
									type="submit"
									class="btn btn-dark btn-sm"
									:disabled="saving"
								>
									<span v-if="saving">Đang lưu...</span>
									<span v-else>Lưu thay đổi</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>

		<!-- Thống kê -->
		<div class="row g-3">
			<div class="col-12 col-md-4">
				<div class="card border-0 shadow-sm h-100">
					<div
						class="card-body d-flex flex-column justify-content-between"
					>
						<div class="d-flex align-items-center mb-2">
							<i class="fa-solid fa-book me-2"></i>
							<span class="text-muted small">Sách đã mượn</span>
						</div>
						<div class="fw-semibold">
							{{ stats.totalBorrowed }} cuốn
						</div>
					</div>
				</div>
			</div>

			<div class="col-12 col-md-4">
				<div class="card border-0 shadow-sm h-100">
					<div
						class="card-body d-flex flex-column justify-content-between"
					>
						<div class="d-flex align-items-center mb-2">
							<i class="fa-regular fa-heart me-2"></i>
							<span class="text-muted small">Yêu thích</span>
						</div>
						<div class="fw-semibold">
							{{ stats.favorites }} cuốn
						</div>
					</div>
				</div>
			</div>

			<div class="col-12 col-md-4">
				<div class="card border-0 shadow-sm h-100">
					<div
						class="card-body d-flex flex-column justify-content-between"
					>
						<div class="d-flex align-items-center mb-2">
							<i class="fa-solid fa-clock-rotate-left me-2"></i>
							<span class="text-muted small">Đang mượn</span>
						</div>
						<div class="fw-semibold">
							{{ stats.activeLoans }} cuốn
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ReaderService from "@/services/reader.service";
import BorrowService from "@/services/borrow.service";
import { toast } from "vue3-toastify";

export default {
	name: "Profile",
	data() {
		return {
			profile: null,
			form: {
				HoLot: "",
				Ten: "",
				Email: "",
				DienThoai: "",
				DiaChi: "",
				NgaySinh: "",
				Phai: "",
			},
			stats: {
				totalBorrowed: 0,
				favorites: 0,
				activeLoans: 0,
			},
			loading: false,
			saving: false,
		};
	},
	computed: {
		fullName() {
			if (!this.form.HoLot && !this.form.Ten) return "";
			return `${this.form.HoLot || ""} ${this.form.Ten || ""}`.trim();
		},
		memberSinceText() {
			if (!this.profile || !this.profile.createdAt) return "N/A";
			const d = new Date(this.profile.createdAt);
			if (Number.isNaN(d.getTime())) return "N/A";
			return d.toLocaleString("vi-VN", {
				month: "long",
				year: "numeric",
			});
		},
		isBanned() {
			if (!this.profile || !this.profile.CamMuonDen) return false;
			const banDate = new Date(this.profile.CamMuonDen);
			const now = new Date();
			return banDate > now;
		},
		banDateText() {
			if (!this.profile || !this.profile.CamMuonDen) return "";
			const d = new Date(this.profile.CamMuonDen);
			if (Number.isNaN(d.getTime())) return "";
			return d.toLocaleString("vi-VN", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		},
	},
	created() {
		this.loadProfile();
	},
	methods: {
		// Hàm kiểm tra người dùng đã đăng nhập
		requireLogin() {
			const token = localStorage.getItem("readerToken");
			if (!token) {
				toast.info("Vui lòng đăng nhập để xem trang hồ sơ.");
				this.$router.push({ path: "/auth", query: { mode: "login" } });
				return false;
			}
			return true;
		},
		// Hàm nạp thông tin hồ sơ và thống kê
		async loadProfile() {
			if (!this.requireLogin()) return;
			this.loading = true;
			try {
				const res = await ReaderService.getMyProfile();
				if (!res.success || !res.data) {
					toast.error(
						res.message || "Không lấy được thông tin hồ sơ."
					);
					return;
				}
				this.profile = res.data;
				this.fillFormFromProfile();

				const readerInfo = localStorage.getItem("readerInfo");
				let maDocGia = this.profile.MaDocGia;
				if (readerInfo) {
					try {
						const parsed = JSON.parse(readerInfo);
						if (parsed.MaDocGia) maDocGia = parsed.MaDocGia;
					} catch (e) {}
				}
				if (maDocGia) {
					await this.loadStats(maDocGia);
				} else {
					await this.loadStats(null);
				}
			} catch (error) {
				console.error(error);
				toast.error("Có lỗi xảy ra khi tải hồ sơ.");
			} finally {
				this.loading = false;
			}
		},
		// Hàm đổ dữ liệu profile vào form
		fillFormFromProfile() {
			if (!this.profile) return;
			this.form.HoLot = this.profile.HoLot || "";
			this.form.Ten = this.profile.Ten || "";
			this.form.Email = this.profile.Email || "";
			this.form.DienThoai = this.profile.DienThoai || "";
			this.form.DiaChi = this.profile.DiaChi || "";
			this.form.Phai = this.profile.Phai || "";
			if (this.profile.NgaySinh) {
				const d = new Date(this.profile.NgaySinh);
				if (!Number.isNaN(d.getTime())) {
					const y = d.getFullYear();
					const m = String(d.getMonth() + 1).padStart(2, "0");
					const day = String(d.getDate()).padStart(2, "0");
					this.form.NgaySinh = `${y}-${m}-${day}`;
				}
			} else {
				this.form.NgaySinh = "";
			}
		},
		// Hàm cập nhật form về trạng thái ban đầu
		resetForm() {
			this.fillFormFromProfile();
		},
		// Hàm lấy thống kê mượn sách và yêu thích
		async loadStats(maDocGia) {
			try {
				let borrows = [];
				if (maDocGia) {
					const res = await BorrowService.getBorrowsByReader(
						maDocGia
					);
					if (res.success && Array.isArray(res.data)) {
						borrows = res.data;
					}
				}
				const totalBorrowed = borrows.length;
				const activeLoans = borrows.filter((b) =>
					["Đang mượn", "Quá hạn"].includes(b.TinhTrang)
				).length;

				let favorites = 0;
				try {
					const rawFav = localStorage.getItem("favoriteBooks");
					if (rawFav) {
						const list = JSON.parse(rawFav);
						if (Array.isArray(list)) favorites = list.length;
					}
				} catch (e) {}

				this.stats.totalBorrowed = totalBorrowed;
				this.stats.activeLoans = activeLoans;
				this.stats.favorites = favorites;
			} catch (error) {
				console.error(error);
			}
		},
		// Hàm lưu thay đổi hồ sơ
		async saveChanges() {
			if (!this.requireLogin()) return;
			this.saving = true;
			try {
				const payload = {
					HoLot: this.form.HoLot,
					Ten: this.form.Ten,
					DiaChi: this.form.DiaChi,
					DienThoai: this.form.DienThoai,
					Phai: this.form.Phai,
					NgaySinh: this.form.NgaySinh || null,
				};
				const res = await ReaderService.updateProfile(payload);
				if (!res.success || !res.data) {
					toast.error(
						res.message || "Cập nhật hồ sơ không thành công."
					);
					return;
				}
				this.profile = res.data;
				this.fillFormFromProfile();

				const info = {
					MaDocGia: this.profile.MaDocGia,
					HoLot: this.profile.HoLot,
					Ten: this.profile.Ten,
					Email: this.profile.Email,
				};
				localStorage.setItem("readerInfo", JSON.stringify(info));

				toast.success("Cập nhật hồ sơ thành công.");
			} catch (error) {
				console.error(error);
				const message =
					error?.response?.data?.message ||
					"Có lỗi xảy ra khi cập nhật hồ sơ.";
				toast.error(message);
			} finally {
				this.saving = false;
			}
		},
	},
};
</script>

<style scoped>
.profile-page {
	background-color: #f5f7fb;
	min-height: 100vh;
}
</style>
