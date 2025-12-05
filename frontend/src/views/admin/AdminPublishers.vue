<template>
	<div class="container-fluid py-3 admin-page">
		<!-- Header -->
		<div
			class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3"
		>
			<div>
				<h4 class="fw-bold mb-1">Quản lý nhà xuất bản</h4>
				<p class="text-muted mb-0 small">
					Xem, thêm và cập nhật nhà xuất bản
				</p>
			</div>
			<div class="d-flex gap-2">
				<div class="input-group input-group-sm me-2">
					<span class="input-group-text">
						<i class="fa-solid fa-magnifying-glass"></i>
					</span>
					<input
						type="text"
						class="form-control"
						placeholder="Tìm theo tên hoặc địa chỉ..."
						v-model="searchKeyword"
					/>
				</div>
				<button
					class="btn btn-dark btn-sm d-flex align-items-center"
					@click="openCreateModal"
				>
					<i class="fa-solid fa-plus me-1"></i>
					Thêm
				</button>
			</div>
		</div>

		<!-- Table -->
		<div class="card border-0 shadow-sm">
			<div
				class="card-header bg-white border-0 d-flex justify-content-between align-items-center"
			>
				<h6 class="mb-0 fw-semibold">Danh sách nhà xuất bản</h6>
				<button
					class="btn btn-outline-secondary btn-sm"
					@click="loadPublishers"
					:disabled="loading"
				>
					<i class="fa-solid fa-rotate me-1"></i>
					Làm mới
				</button>
			</div>
			<div class="card-body p-0">
				<div v-if="loading" class="py-3 text-center text-muted small">
					Đang tải danh sách nhà xuất bản...
				</div>
				<div
					v-else-if="filteredPublishers.length === 0"
					class="py-3 text-center text-muted small"
				>
					Không tìm thấy nhà xuất bản nào.
				</div>
				<div v-else class="table-responsive">
					<table
						class="table table-borderless align-middle mb-0 admin-publisher-table"
					>
						<thead>
							<tr>
								<th>Tên NXB</th>
								<th class="text-nowrap">Địa chỉ</th>
								<th class="text-end text-nowrap">Hành động</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="pub in filteredPublishers"
								:key="pub.MaNXB || pub._id"
							>
								<td>
									<div class="fw-semibold">
										{{ pub.TenNXB }}
									</div>
									<div class="text-muted small">
										{{ pub.MaNXB }}
									</div>
								</td>
								<td class="text-nowrap">
									{{ pub.DiaChi || "-" }}
								</td>
								<td class="text-end text-nowrap">
									<button
										class="btn btn-sm btn-outline-primary"
										@click="openEditModal(pub)"
									>
										<i
											class="fa-regular fa-pen-to-square"
										></i>
									</button>
									<!-- Nếu sau này muốn thêm xóa thì thêm nút ở đây -->
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Modal form thêm/sửa NXB -->
		<div v-if="showFormModal" class="modal-backdrop-custom">
			<div class="modal-dialog-custom">
				<div class="card border-0 shadow">
					<div
						class="card-header bg-white d-flex justify-content-between align-items-center"
					>
						<h6 class="mb-0 fw-semibold">
							{{
								formMode === "create"
									? "Add Publisher"
									: "Edit Publisher"
							}}
						</h6>
						<button
							class="btn btn-sm btn-outline-secondary"
							@click="closeFormModal"
							:disabled="saving"
						>
							<i class="fa-solid fa-xmark"></i>
						</button>
					</div>
					<div class="card-body">
						<form @submit.prevent="submitForm">
							<div class="mb-3">
								<label class="form-label small fw-semibold">
									Tên nhà xuất bản *
								</label>
								<input
									type="text"
									class="form-control"
									v-model="form.TenNXB"
									required
								/>
							</div>

							<div class="mb-3">
								<label class="form-label small fw-semibold">
									Địa chỉ
								</label>
								<input
									type="text"
									class="form-control"
									v-model="form.DiaChi"
								/>
							</div>

							<div class="form-text small mt-2" v-if="form.MaNXB">
								Mã NXB: <strong>{{ form.MaNXB }}</strong>
							</div>

							<div class="d-flex justify-content-end gap-2 mt-3">
								<button
									type="button"
									class="btn btn-outline-secondary btn-sm"
									@click="closeFormModal"
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
									<span v-else>
										{{
											formMode === "create"
												? "Thêm NXB"
												: "Lưu thay đổi"
										}}
									</span>
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
import PublisherService from "@/services/publisher.service";
import adminApi from "@/services/adminApi.service";
import { toast } from "vue3-toastify";

export default {
	name: "AdminPublishers",
	data() {
		return {
			publishers: [],
			loading: false,
			saving: false,

			searchKeyword: "",

			showFormModal: false,
			formMode: "create",
			form: {
				MaNXB: "",
				TenNXB: "",
				DiaChi: "",
			},
		};
	},
	computed: {
		// Hàm lọc danh sách NXB theo ô tìm kiếm
		filteredPublishers() {
			const keyword = this.searchKeyword.trim().toLowerCase();
			if (!keyword) return this.publishers;
			return this.publishers.filter((p) => {
				const name = (p.TenNXB || "").toLowerCase();
				const address = (p.DiaChi || "").toLowerCase();
				const code = (p.MaNXB || "").toLowerCase();
				return (
					name.includes(keyword) ||
					address.includes(keyword) ||
					code.includes(keyword)
				);
			});
		},
	},
	created() {
		this.loadPublishers();
	},
	methods: {
		// Hàm tải danh sách nhà xuất bản
		async loadPublishers() {
			this.loading = true;
			try {
				const res = await PublisherService.getAllPublishers();
				const raw = res?.data || res || [];
				this.publishers = Array.isArray(raw) ? raw : raw.data || [];
			} catch (error) {
				console.error(error);
				toast.error("Không tải được danh sách nhà xuất bản.");
			} finally {
				this.loading = false;
			}
		},
		// Hàm mở modal tạo mới NXB
		openCreateModal() {
			this.formMode = "create";
			this.form = {
				MaNXB: "",
				TenNXB: "",
				DiaChi: "",
			};
			this.showFormModal = true;
		},
		// Hàm mở modal sửa NXB
		openEditModal(pub) {
			this.formMode = "edit";
			this.form = {
				MaNXB: pub.MaNXB,
				TenNXB: pub.TenNXB || "",
				DiaChi: pub.DiaChi || "",
			};
			this.showFormModal = true;
		},
		// Hàm đóng modal form
		closeFormModal() {
			if (this.saving) return;
			this.showFormModal = false;
		},
		// Hàm gửi dữ liệu thêm/sửa NXB
		async submitForm() {
			this.saving = true;
			try {
				const payload = {
					TenNXB: this.form.TenNXB,
					DiaChi: this.form.DiaChi || null,
				};

				let res;
				if (this.formMode === "create") {
					res = await adminApi.post("/publishers", payload);
				} else {
					res = await adminApi.put(
						`/publishers/${this.form.MaNXB}`,
						payload
					);
				}

				const ok = res?.data?.success ?? true;
				if (!ok) {
					toast.error(
						res?.data?.message ||
							(this.formMode === "create"
								? "Thêm nhà xuất bản thất bại."
								: "Cập nhật nhà xuất bản thất bại.")
					);
					return;
				}

				toast.success(
					this.formMode === "create"
						? "Thêm nhà xuất bản thành công."
						: "Cập nhật nhà xuất bản thành công."
				);
				this.showFormModal = false;
				this.loadPublishers();
			} catch (error) {
				console.error(error);
				const msg =
					error?.response?.data?.message ||
					(this.formMode === "create"
						? "Có lỗi xảy ra khi thêm nhà xuất bản."
						: "Có lỗi xảy ra khi cập nhật nhà xuất bản.");
				toast.error(msg);
			} finally {
				this.saving = false;
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
.admin-publisher-table thead th {
	font-size: 0.8rem;
	color: #6b7280;
	border-bottom: 1px solid #e5e7eb;
}
.admin-publisher-table tbody td {
	font-size: 0.85rem;
	border-top: 1px solid #f3f4f6;
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
