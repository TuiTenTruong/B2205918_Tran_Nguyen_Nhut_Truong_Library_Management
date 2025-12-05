<template>
	<div class="container-fluid py-3 admin-page">
		<!-- Header -->
		<div
			class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3"
		>
			<div>
				<h4 class="fw-bold mb-1">Quản lí người dùng</h4>
				<p class="text-muted mb-0 small">
					Quản lý tài khoản độc giả và nhân viên
				</p>
			</div>
		</div>

		<!-- Tabs -->
		<ul class="nav nav-pills mb-3">
			<li class="nav-item">
				<button
					class="nav-link"
					:class="{ active: activeTab === 'readers' }"
					@click="activeTab = 'readers'"
				>
					Độc giả
				</button>
			</li>
			<li class="nav-item">
				<button
					class="nav-link"
					:class="{ active: activeTab === 'staff' }"
					@click="activeTab = 'staff'"
				>
					Nhân viên
				</button>
			</li>
		</ul>

		<!-- Readers tab -->
		<div v-if="activeTab === 'readers'">
			<div class="card border-0 shadow-sm mb-3">
				<div
					class="card-header bg-white border-0 d-flex justify-content-between align-items-center flex-wrap gap-2"
				>
					<h6 class="mb-0 fw-semibold">Độc giả</h6>
					<div class="d-flex align-items-center gap-2">
						<div class="input-group input-group-sm">
							<span class="input-group-text">
								<i class="fa-solid fa-magnifying-glass"></i>
							</span>
							<input
								type="text"
								class="form-control"
								placeholder="Tìm theo tên, email hoặc số điện thoại..."
								v-model="readerSearch"
								@keyup.enter="loadReaders"
							/>
						</div>
						<button
							class="btn btn-outline-secondary btn-sm d-flex align-items-center"
							@click="loadReaders"
							:disabled="loadingReaders"
						>
							<i class="fa-solid fa-rotate me-1"></i>
							Làm mới
						</button>
					</div>
				</div>
				<div class="card-body p-0">
					<div
						v-if="loadingReaders"
						class="py-3 text-center text-muted small"
					>
						Đang tải danh sách độc giả...
					</div>
					<div
						v-else-if="readers.length === 0"
						class="py-3 text-center text-muted small"
					>
						Không tìm thấy độc giả nào.
					</div>
					<div v-else class="table-responsive">
						<table
							class="table table-borderless align-middle mb-0 admin-user-table"
						>
							<thead>
								<tr>
									<th>Tên</th>
									<th class="text-nowrap">Email</th>
									<th class="text-nowrap">Số điện thoại</th>
									<th class="text-nowrap">Vai trò</th>
									<th class="text-nowrap">Ngày tham gia</th>
									<th class="text-end text-nowrap">
										Hành động
									</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="u in readers" :key="u.MaDocGia">
									<td>
										<div class="fw-semibold">
											{{ fullReaderName(u) }}
										</div>
										<div class="text-muted small">
											{{ u.MaDocGia }}
										</div>
									</td>
									<td class="text-nowrap">
										{{ u.Email }}
									</td>
									<td class="text-nowrap">
										{{ u.DienThoai || "-" }}
									</td>
									<td class="text-nowrap">Reader</td>
									<td class="text-nowrap">
										{{ formatDate(u.createdAt) }}
									</td>
									<td class="text-end text-nowrap">
										<button
											class="btn btn-sm btn-outline-primary me-1"
											@click="openViewModal('reader', u)"
										>
											<i class="fa-regular fa-eye"></i>
										</button>
										<button
											class="btn btn-sm btn-outline-warning me-1"
											@click="openEditReaderModal(u)"
										>
											<i class="fa-regular fa-pen-to-square"></i>
										</button>
										<button
											class="btn btn-sm btn-outline-danger"
											@click="
												openDeleteModal('reader', u)
											"
											:disabled="
												deleting &&
												deleteTarget?.MaDocGia ===
													u.MaDocGia
											"
										>
											<span
												v-if="
													deleting &&
													deleteTarget?.MaDocGia ===
														u.MaDocGia
												"
												>...</span
											>
											<span v-else>
												<i
													class="fa-regular fa-trash-can"
												></i>
											</span>
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div
					v-if="readerPagination"
					class="card-footer bg-white border-0 small text-muted d-flex justify-content-between align-items-center flex-wrap gap-2"
				>
					<span>
						Tổng:
						<strong>{{ readerPagination.total }}</strong> độc giả
					</span>
					<div class="d-flex align-items-center gap-2">
						<button
							class="btn btn-sm btn-outline-secondary"
							:disabled="currentReaderPage <= 1 || loadingReaders"
							@click="goReaderPage(currentReaderPage - 1)"
						>
							<i class="fa-solid fa-chevron-left"></i>
						</button>
						<span>
							Trang {{ readerPagination.page }} /
							{{ readerPagination.totalPages }}
						</span>
						<button
							class="btn btn-sm btn-outline-secondary"
							:disabled="
								currentReaderPage >=
									readerPagination.totalPages ||
								loadingReaders
							"
							@click="goReaderPage(currentReaderPage + 1)"
						>
							<i class="fa-solid fa-chevron-right"></i>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Staff tab -->
		<div v-else>
			<div class="card border-0 shadow-sm mb-3">
				<div
					class="card-header bg-white border-0 d-flex justify-content-between align-items-center flex-wrap gap-2"
				>
					<h6 class="mb-0 fw-semibold">Nhân viên</h6>
					<div class="d-flex align-items-center gap-2">
						<div class="input-group input-group-sm">
							<span class="input-group-text">
								<i class="fa-solid fa-magnifying-glass"></i>
							</span>
							<input
								type="text"
								class="form-control"
								placeholder="Tìm theo tên, email hoặc số điện thoại..."
								v-model="staffSearch"
								@keyup.enter="loadStaff"
							/>
						</div>
						<button
							class="btn btn-dark btn-sm d-flex align-items-center"
							@click="openStaffFormModal"
						>
							<i class="fa-solid fa-user-plus me-1"></i>
							Add
						</button>
						<button
							class="btn btn-outline-secondary btn-sm d-flex align-items-center"
							@click="loadStaff"
							:disabled="loadingStaff"
						>
							<i class="fa-solid fa-rotate me-1"></i>
							Làm mới
						</button>
					</div>
				</div>
				<div class="card-body p-0">
					<div
						v-if="loadingStaff"
						class="py-3 text-center text-muted small"
					>
						Đang tải danh sách nhân viên...
					</div>
					<div
						v-else-if="staffs.length === 0"
						class="py-3 text-center text-muted small"
					>
						Không tìm thấy nhân viên nào.
					</div>
					<div v-else class="table-responsive">
						<table
							class="table table-borderless align-middle mb-0 admin-user-table"
						>
							<thead>
								<tr>
									<th>Tên</th>
									<th class="text-nowrap">Email</th>
									<th class="text-nowrap">Số điện thoại</th>
									<th class="text-nowrap">Vai trò</th>
									<th class="text-nowrap">Ngày tham gia</th>
									<th class="text-end text-nowrap">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="s in staffs" :key="s.MSNV">
									<td>
										<div class="fw-semibold">
											{{ s.HoTenNV || s.Ten || "-" }}
										</div>
										<div class="text-muted small">
											{{ s.MSNV }}
										</div>
									</td>
									<td class="text-nowrap">
										{{ s.Email }}
									</td>
									<td class="text-nowrap">
										{{ s.SoDienThoai || "-" }}
									</td>
									<td class="text-nowrap">
										{{ "Nhân viên" }}
									</td>
									<td class="text-nowrap">
										{{ formatDate(s.createdAt) }}
									</td>
									<td class="text-end text-nowrap">
										<button
											class="btn btn-sm btn-outline-primary me-1"
											@click="openViewModal('staff', s)"
										>
											<i class="fa-regular fa-eye"></i>
										</button>
										<button
											class="btn btn-sm btn-outline-danger"
											@click="openDeleteModal('staff', s)"
											:disabled="
												deleting &&
												deleteTarget?.MSNV === s.MSNV
											"
										>
											<span
												v-if="
													deleting &&
													deleteTarget?.MSNV ===
														s.MSNV
												"
												>...</span
											>
											<span v-else>
												<i
													class="fa-regular fa-trash-can"
												></i>
											</span>
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div
					v-if="staffPagination"
					class="card-footer bg-white border-0 small text-muted d-flex justify-content-between align-items-center flex-wrap gap-2"
				>
					<span>
						Tổng:
						<strong>{{ staffPagination.total }}</strong> nhân viên
					</span>
					<div class="d-flex align-items-center gap-2">
						<button
							class="btn btn-sm btn-outline-secondary"
							:disabled="currentStaffPage <= 1 || loadingStaff"
							@click="goStaffPage(currentStaffPage - 1)"
						>
							<i class="fa-solid fa-chevron-left"></i>
						</button>
						<span>
							Trang {{ staffPagination.page }} /
							{{ staffPagination.totalPages }}
						</span>
						<button
							class="btn btn-sm btn-outline-secondary"
							:disabled="
								currentStaffPage >=
									staffPagination.totalPages || loadingStaff
							"
							@click="goStaffPage(currentStaffPage + 1)"
						>
							<i class="fa-solid fa-chevron-right"></i>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Modal xem chi tiết -->
		<div v-if="showViewModal" class="modal-backdrop-custom">
			<div class="modal-dialog-custom">
				<div class="card border-0 shadow">
					<div
						class="card-header bg-white d-flex justify-content-between align-items-center"
					>
						<h6 class="mb-0 fw-semibold">
							Chi tiết người dùng
							<span class="badge bg-light text-dark ms-2">
								{{
									viewType === "reader"
										? "Độc giả"
										: "Nhân viên"
								}}
							</span>
						</h6>
						<button
							class="btn btn-sm btn-outline-secondary"
							@click="showViewModal = false"
						>
							<i class="fa-solid fa-xmark"></i>
						</button>
					</div>
					<div class="card-body small">
						<div v-if="viewType === 'reader' && currentUser">
							<p class="mb-1">
								<strong>ID:</strong>
								{{ currentUser.MaDocGia }}
							</p>
							<p class="mb-1">
								<strong>Tên:</strong>
								{{ fullReaderName(currentUser) }}
							</p>
							<p class="mb-1">
								<strong>Email:</strong>
								{{ currentUser.Email }}
							</p>
							<p class="mb-1">
								<strong>Số điện thoại:</strong>
								{{ currentUser.DienThoai || "-" }}
							</p>
							<p class="mb-1">
								<strong>Địa chỉ:</strong>
								{{ currentUser.DiaChi || "-" }}
							</p>
							<p class="mb-0">
								<strong>Ngày tham gia:</strong>
								{{ formatDateTime(currentUser.createdAt) }}
							</p>
						</div>

						<div v-else-if="viewType === 'staff' && currentUser">
							<p class="mb-1">
								<strong>ID:</strong>
								{{ currentUser.MSNV }}
							</p>
							<p class="mb-1">
								<strong>Tên:</strong>
								{{ currentUser.HoTenNV || "-" }}
							</p>
							<p class="mb-1">
								<strong>Email:</strong>
								{{ currentUser.Email }}
							</p>
							<p class="mb-1">
								<strong>Số điện thoại:</strong>
								{{ currentUser.SoDienThoai || "-" }}
							</p>
							<p class="mb-1">
								<strong>Vai trò:</strong>
								{{ currentUser.ChucVu || "Nhân viên" }}
							</p>
							<p class="mb-1">
								<strong>Địa chỉ:</strong>
								{{ currentUser.DiaChi || "-" }}
							</p>
							<p class="mb-0">
								<strong>Ngày tham gia:</strong>
								{{ formatDateTime(currentUser.createdAt) }}
							</p>
						</div>
					</div>
					<div class="card-footer bg-white border-0 text-end">
						<button
							class="btn btn-sm btn-dark"
							@click="showViewModal = false"
						>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Modal xác nhận xoá -->
		<div v-if="showDeleteModal" class="modal-backdrop-custom">
			<div class="modal-dialog-custom">
				<div class="card border-0 shadow">
					<div
						class="card-header bg-white d-flex justify-content-between align-items-center"
					>
						<h6 class="mb-0 fw-semibold">Delete User</h6>
						<button
							class="btn btn-sm btn-outline-secondary"
							@click="closeDeleteModal"
							:disabled="deleting"
						>
							<i class="fa-solid fa-xmark"></i>
						</button>
					</div>
					<div class="card-body small">
						<p class="mb-2">
							Are you sure you want to delete this
							{{ deleteType === "reader" ? "reader" : "staff" }}?
						</p>
						<ul class="mb-3">
							<li v-if="deleteType === 'reader'">
								<strong>ID:</strong>
								{{ deleteTarget?.MaDocGia }}
							</li>
							<li v-if="deleteType === 'staff'">
								<strong>ID:</strong>
								{{ deleteTarget?.MSNV }}
							</li>
							<li>
								<strong>Name:</strong>
								{{ deleteDisplayName }}
							</li>
							<li>
								<strong>Email:</strong>
								{{ deleteTarget?.Email }}
							</li>
						</ul>
						<div class="d-flex justify-content-end gap-2">
							<button
								class="btn btn-outline-secondary btn-sm"
								@click="closeDeleteModal"
								:disabled="deleting"
							>
								Cancel
							</button>
							<button
								class="btn btn-danger btn-sm"
								@click="confirmDelete"
								:disabled="deleting"
							>
								<span v-if="deleting">Deleting...</span>
								<span v-else>Delete</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Modal chỉnh sửa độc giả -->
		<div v-if="showEditReaderModal" class="modal-backdrop-custom">
			<div class="modal-dialog-custom">
				<div class="card border-0 shadow">
					<div
						class="card-header bg-white d-flex justify-content-between align-items-center"
					>
						<h6 class="mb-0 fw-semibold">Chỉnh sửa thông tin độc giả</h6>
						<button
							class="btn btn-sm btn-outline-secondary"
							@click="closeEditReaderModal"
							:disabled="savingReader"
						>
							<i class="fa-solid fa-xmark"></i>
						</button>
					</div>
					<div class="card-body small">
						<form @submit.prevent="submitEditReaderForm">
							<div class="mb-3">
								<label class="form-label small fw-semibold">
									Mã độc giả
								</label>
								<input
									type="text"
									class="form-control"
									:value="readerForm.MaDocGia"
									disabled
								/>
							</div>

							<div class="row g-3 mb-3">
								<div class="col-12 col-md-8">
									<label class="form-label small fw-semibold">
										Họ lót
									</label>
									<input
										type="text"
										class="form-control"
										v-model="readerForm.HoLot"
									/>
								</div>
								<div class="col-12 col-md-4">
									<label class="form-label small fw-semibold">
										Tên
									</label>
									<input
										type="text"
										class="form-control"
										v-model="readerForm.Ten"
									/>
								</div>
							</div>

							<div class="mb-3">
								<label class="form-label small fw-semibold">
									Email
								</label>
								<input
									type="email"
									class="form-control"
									v-model="readerForm.Email"
								/>
							</div>

							<div class="row g-3 mb-3">
								<div class="col-12 col-md-6">
									<label class="form-label small fw-semibold">
										Số điện thoại
									</label>
									<input
										type="text"
										class="form-control"
										v-model="readerForm.DienThoai"
									/>
								</div>
								<div class="col-12 col-md-6">
									<label class="form-label small fw-semibold">
										Giới tính
									</label>
									<select
										class="form-select"
										v-model="readerForm.Phai"
									>
										<option value="Nam">Nam</option>
										<option value="Nữ">Nữ</option>
										<option value="Khác">Khác</option>
									</select>
								</div>
							</div>

							<div class="mb-3">
								<label class="form-label small fw-semibold">
									Ngày sinh
								</label>
								<input
									type="date"
									class="form-control"
									v-model="readerForm.NgaySinh"
								/>
							</div>

							<div class="mb-3">
								<label class="form-label small fw-semibold">
									Địa chỉ
								</label>
								<input
									type="text"
									class="form-control"
									v-model="readerForm.DiaChi"
								/>
							</div>

							<div class="mb-3">
								<label class="form-label small fw-semibold d-flex align-items-center gap-2">
									Ngày cấm mượn sách
									<span class="badge bg-warning text-dark">Admin</span>
								</label>
								<input
									type="datetime-local"
									class="form-control"
									v-model="readerForm.CamMuonDen"
								/>
								<small class="form-text text-muted">
									Để trống để bỏ cấm mượn. Độc giả sẽ không thể mượn sách cho đến ngày này.
								</small>
							</div>

							<div class="mb-3">
								<label class="form-label small fw-semibold">
									Tiền phạt chưa đóng
								</label>
								<div class="input-group">
									<input
										type="number"
										class="form-control"
										v-model.number="readerForm.TienPhatChuaDong"
										min="0"
									/>
									<span class="input-group-text">đ</span>
								</div>
							</div>

							<div class="d-flex justify-content-end gap-2">
								<button
									type="button"
									class="btn btn-outline-secondary btn-sm"
									@click="closeEditReaderModal"
									:disabled="savingReader"
								>
									Huỷ
								</button>
								<button
									type="submit"
									class="btn btn-warning btn-sm"
									:disabled="savingReader"
								>
									<span v-if="savingReader">Đang lưu...</span>
									<span v-else>Cập nhật</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>

		<!-- Modal thêm nhân viên -->
		<div v-if="showStaffFormModal" class="modal-backdrop-custom">
			<div class="modal-dialog-custom">
				<div class="card border-0 shadow">
					<div
						class="card-header bg-white d-flex justify-content-between align-items-center"
					>
						<h6 class="mb-0 fw-semibold">Thêm nhân viên</h6>
						<button
							class="btn btn-sm btn-outline-secondary"
							@click="closeStaffFormModal"
							:disabled="savingStaff"
						>
							<i class="fa-solid fa-xmark"></i>
						</button>
					</div>
					<div class="card-body small">
						<form @submit.prevent="submitStaffForm">
							<div class="mb-3">
								<label class="form-label small fw-semibold">
									Tên đầy đủ *
								</label>
								<input
									type="text"
									class="form-control"
									v-model="staffForm.HoTenNV"
									required
								/>
							</div>

							<div class="mb-3">
								<label class="form-label small fw-semibold">
									Email *
								</label>
								<input
									type="email"
									class="form-control"
									v-model="staffForm.Email"
									required
								/>
							</div>

							<div class="mb-3">
								<label class="form-label small fw-semibold">
									Mật khẩu *
								</label>
								<input
									type="password"
									class="form-control"
									v-model="staffForm.Password"
									minlength="6"
									required
								/>
							</div>

							<div class="row g-3">
								<div class="col-12 col-md-6">
									<label class="form-label small fw-semibold">
										Số điện thoại
									</label>
									<input
										type="text"
										class="form-control"
										v-model="staffForm.SoDienThoai"
									/>
								</div>
							</div>

							<div class="mb-3 mt-3">
								<label class="form-label small fw-semibold">
									Địa chỉ
								</label>
								<input
									type="text"
									class="form-control"
									v-model="staffForm.DiaChi"
								/>
							</div>

							<div class="d-flex justify-content-end gap-2">
								<button
									type="button"
									class="btn btn-outline-secondary btn-sm"
									@click="closeStaffFormModal"
									:disabled="savingStaff"
								>
									Huỷ
								</button>
								<button
									type="submit"
									class="btn btn-dark btn-sm"
									:disabled="savingStaff"
								>
									<span v-if="savingStaff">Đang lưu...</span>
									<span v-else>Thêm nhân viên</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ReaderService from "@/services/reader.service";
import StaffService from "@/services/staff.service";
import { toast } from "vue3-toastify";

export default {
	name: "AdminUsers",
	data() {
		return {
			activeTab: "readers",

			readers: [],
			loadingReaders: false,
			readerSearch: "",
			readerPagination: null,
			currentReaderPage: 1,

			staffs: [],
			loadingStaff: false,
			staffSearch: "",
			staffPagination: null,
			currentStaffPage: 1,

			showViewModal: false,
			viewType: "reader",
			currentUser: null,

			showDeleteModal: false,
			deleteType: "reader",
			deleteTarget: null,
			deleting: false,

			showEditReaderModal: false,
			savingReader: false,
			readerForm: {
				MaDocGia: "",
				HoLot: "",
				Ten: "",
				Email: "",
				DienThoai: "",
				NgaySinh: "",
				Phai: "",
				DiaChi: "",
				CamMuonDen: null,
				TienPhatChuaDong: 0,
			},

			showStaffFormModal: false,
			savingStaff: false,
			staffForm: {
				HoTenNV: "",
				Email: "",
				Password: "",
				SoDienThoai: "",
				DiaChi: "",
				ChucVu: "admin",
			},
		};
	},
	computed: {
		// Hàm hiển thị tên người bị xoá trên modal
		deleteDisplayName() {
			if (!this.deleteTarget) return "";
			if (this.deleteType === "reader") {
				return this.fullReaderName(this.deleteTarget);
			}
			return this.deleteTarget.HoTenNV || "";
		},
	},
	created() {
		this.loadReaders();
		this.loadStaff();
	},
	methods: {
		// Hàm lấy họ tên đầy đủ độc giả
		fullReaderName(reader) {
			const ho = reader.HoLot || "";
			const ten = reader.Ten || "";
			return `${ho} ${ten}`.trim() || "(No name)";
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
		// Hàm tải danh sách độc giả
		async loadReaders() {
			this.loadingReaders = true;
			try {
				const res = await ReaderService.getAllReaders({
					page: this.currentReaderPage,
					limit: 10,
					search: this.readerSearch || "",
				});
				this.readers = res?.data || [];
				this.readerPagination = res?.pagination || null;
			} catch (error) {
				console.error(error);
				toast.error("Không tải được danh sách độc giả.");
			} finally {
				this.loadingReaders = false;
			}
		},
		// Hàm tải danh sách nhân viên
		async loadStaff() {
			this.loadingStaff = true;
			try {
				const res = await StaffService.getAllStaffs({
					page: this.currentStaffPage,
					limit: 10,
					search: this.staffSearch || "",
				});
				this.staffs = res?.data || [];
				this.staffPagination = res?.pagination || null;
			} catch (error) {
				console.error(error);
				toast.error("Không tải được danh sách nhân viên.");
			} finally {
				this.loadingStaff = false;
			}
		},
		// Hàm chuyển trang reader
		goReaderPage(page) {
			this.currentReaderPage = page;
			this.loadReaders();
		},
		// Hàm chuyển trang staff
		goStaffPage(page) {
			this.currentStaffPage = page;
			this.loadStaff();
		},
		// Hàm mở modal xem chi tiết
		openViewModal(type, user) {
			this.viewType = type;
			this.currentUser = { ...user };
			this.showViewModal = true;
		},
		// Hàm mở modal xoá
		openDeleteModal(type, user) {
			this.deleteType = type;
			this.deleteTarget = { ...user };
			this.showDeleteModal = true;
		},
		// Hàm đóng modal xoá
		closeDeleteModal() {
			if (this.deleting) return;
			this.showDeleteModal = false;
			this.deleteTarget = null;
		},
		// Hàm gọi API xoá người dùng
		async confirmDelete() {
			if (!this.deleteTarget) return;
			this.deleting = true;
			try {
				if (this.deleteType === "reader") {
					await ReaderService.deleteReader(
						this.deleteTarget.MaDocGia
					);
					toast.success("Xóa độc giả thành công.");
					await this.loadReaders();
				} else {
					await StaffService.deleteStaff(this.deleteTarget.MSNV);
					toast.success("Xóa nhân viên thành công.");
					await this.loadStaff();
				}
				this.showDeleteModal = false;
				this.deleteTarget = null;
			} catch (error) {
				console.error(error);
				const msg =
					error?.response?.data?.message ||
					"Không thể xóa người dùng.";
				toast.error(msg);
			} finally {
				this.deleting = false;
			}
		},
		// Hàm mở modal thêm nhân viên
		openStaffFormModal() {
			this.staffForm = {
				HoTenNV: "",
				Email: "",
				Password: "",
				SoDienThoai: "",
				DiaChi: "",
				ChucVu: "admin",
			};
			this.showStaffFormModal = true;
		},
		// Hàm đóng modal thêm nhân viên
		closeStaffFormModal() {
			if (this.savingStaff) return;
			this.showStaffFormModal = false;
		},
		// Hàm mở modal chỉnh sửa độc giả
		openEditReaderModal(reader) {
			this.readerForm = {
				MaDocGia: reader.MaDocGia,
				HoLot: reader.HoLot || "",
				Ten: reader.Ten || "",
				Email: reader.Email || "",
				DienThoai: reader.DienThoai || "",
				NgaySinh: reader.NgaySinh ? reader.NgaySinh.split("T")[0] : "",
				Phai: reader.Phai || "Nam",
				DiaChi: reader.DiaChi || "",
				CamMuonDen: reader.CamMuonDen
					? new Date(reader.CamMuonDen).toISOString().slice(0, 16)
					: null,
				TienPhatChuaDong: reader.TienPhatChuaDong || 0,
			};
			this.showEditReaderModal = true;
		},
		// Hàm đóng modal chỉnh sửa độc giả
		closeEditReaderModal() {
			if (this.savingReader) return;
			this.showEditReaderModal = false;
		},
		// Hàm gửi form chỉnh sửa độc giả
		async submitEditReaderForm() {
			this.savingReader = true;
			try {
				const payload = {
					HoLot: this.readerForm.HoLot,
					Ten: this.readerForm.Ten,
					NgaySinh: this.readerForm.NgaySinh,
					Phai: this.readerForm.Phai,
					DiaChi: this.readerForm.DiaChi,
					DienThoai: this.readerForm.DienThoai,
					CamMuonDen: this.readerForm.CamMuonDen
						? new Date(this.readerForm.CamMuonDen).toISOString()
						: null,
					TienPhatChuaDong: this.readerForm.TienPhatChuaDong,
				};
				await ReaderService.updateReaderByAdmin(
					this.readerForm.MaDocGia,
					payload
				);
				toast.success("Cập nhật thông tin độc giả thành công.");
				this.showEditReaderModal = false;
				this.loadReaders();
			} catch (error) {
				console.error(error);
				const msg =
					error?.response?.data?.message ||
					"Không thể cập nhật thông tin độc giả.";
				toast.error(msg);
			} finally {
				this.savingReader = false;
			}
		},
		// Hàm gửi form thêm nhân viên
		async submitStaffForm() {
			this.savingStaff = true;
			try {
				const payload = {
					HoTenNV: this.staffForm.HoTenNV,
					Email: this.staffForm.Email,
					Password: this.staffForm.Password,
					SoDienThoai: this.staffForm.SoDienThoai || null,
					DiaChi: this.staffForm.DiaChi || null,
					ChucVu: "admin",
				};
				await StaffService.createStaffAccount(payload);
				toast.success("Thêm nhân viên thành công.");
				this.showStaffFormModal = false;
				this.loadStaff();
			} catch (error) {
				console.error(error);
				const msg =
					error?.response?.data?.message ||
					"Không thể thêm nhân viên.";
				toast.error(msg);
			} finally {
				this.savingStaff = false;
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

/* table */
.admin-user-table thead th {
	font-size: 0.8rem;
	color: #6b7280;
	border-bottom: 1px solid #e5e7eb;
}
.admin-user-table tbody td {
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
	overflow-y: auto;
	padding: 20px 0;
}
.modal-dialog-custom {
	max-width: 520px;
	width: 100%;
	padding: 0 12px;
	margin: auto;
	max-height: calc(100vh - 40px);
	overflow-y: auto;
}
</style>
