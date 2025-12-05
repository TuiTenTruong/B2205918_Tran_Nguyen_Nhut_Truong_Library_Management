<template>
	<div class="container-fluid py-3 admin-page">
		<!-- Header -->
		<div
			class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3"
		>
			<div>
				<h4 class="fw-bold mb-1">Quản lí sách</h4>
				<p class="text-muted mb-0 small">
					Xem, thêm và cập nhật sách trong thư viện
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
						placeholder="Tìm theo tên hoặc tác giả..."
						v-model="searchKeyword"
						@keyup.enter="loadBooks"
					/>
					<button
						class="btn btn-outline-secondary"
						type="button"
						@click="loadBooks"
					>
						Tìm
					</button>
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
				<h6 class="mb-0 fw-semibold">Danh sách sách</h6>
				<button
					class="btn btn-outline-secondary btn-sm"
					@click="loadBooks"
					:disabled="loading"
				>
					<i class="fa-solid fa-rotate me-1"></i>
					Làm mới
				</button>
			</div>
			<div class="card-body p-0">
				<div v-if="loading" class="py-3 text-center text-muted small">
					Đang tải sách...
				</div>
				<div
					v-else-if="books.length === 0"
					class="py-3 text-center text-muted small"
				>
					Không tìm thấy sách nào.
				</div>
				<div v-else class="table-responsive">
					<table
						class="table table-borderless align-middle mb-0 admin-book-table"
					>
						<thead>
							<tr>
								<th>Sách</th>
								<th class="text-nowrap">Tác giả</th>
								<th class="text-nowrap">Nhà xuất bản</th>
								<th class="text-nowrap">Năm</th>
								<th class="text-nowrap">Số lượng</th>
								<th class="text-nowrap">Giá</th>
								<th class="text-end text-nowrap">Thao tác</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="bk in books" :key="bk.MaSach">
								<td>
									<div class="d-flex align-items-center">
										<div class="book-cover-thumb me-3">
											<img
												:src="getCoverUrl(bk.AnhBia)"
												alt="cover"
												class="img-fluid rounded"
												onerror="this.src='/placeholder-book.png'"
											/>
										</div>
										<div>
											<div class="fw-semibold">
												{{ bk.TenSach }}
											</div>
											<div class="text-muted small">
												ID: {{ bk.MaSach }}
											</div>
										</div>
									</div>
								</td>
								<td class="text-nowrap">
									{{ bk.NguonGoc_TacGia }}
								</td>
								<td class="text-nowrap">
									{{ getPublisherName(bk.MaNXB) }}
								</td>
								<td class="text-nowrap">
									{{ bk.NamXuatBan }}
								</td>
								<td class="text-nowrap">
									{{ bk.SoQuyen }}
								</td>
								<td class="text-nowrap">
									{{ formatPrice(bk.DonGia) }}
								</td>
								<td class="text-end text-nowrap">
									<button
										class="btn btn-sm btn-outline-primary me-1"
										@click="openEditModal(bk)"
									>
										<i
											class="fa-regular fa-pen-to-square"
										></i>
									</button>
									<button
										class="btn btn-sm btn-outline-danger"
										@click="openDeleteModal(bk)"
										:disabled="deletingId === bk.MaSach"
									>
										<span v-if="deletingId === bk.MaSach">
											...
										</span>
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
		</div>

		<!-- Modal form thêm/sửa sách -->
		<div v-if="showFormModal" class="modal-backdrop-custom">
			<div class="modal-dialog-custom modal-dialog-lg">
				<div class="card border-0 shadow">
					<div
						class="card-header bg-white d-flex justify-content-between align-items-center"
					>
						<h6 class="mb-0 fw-semibold">
							{{
								formMode === "create"
									? "Thêm sách mới"
									: "Chỉnh sửa sách"
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
						<div class="row g-3">
							<!-- Form -->
							<div class="col-12 col-lg-8">
								<form @submit.prevent="submitForm">
									<div class="row g-3">
										<div class="col-12">
											<label
												class="form-label small fw-semibold"
											>
												Tên sách *
											</label>
											<input
												type="text"
												class="form-control"
												v-model="form.TenSach"
												required
											/>
										</div>

										<div class="col-12 col-md-6">
											<label
												class="form-label small fw-semibold"
											>
												Tác giả *
											</label>
											<input
												type="text"
												class="form-control"
												v-model="form.NguonGoc_TacGia"
												required
											/>
										</div>
										<div class="col-12 col-md-6">
											<label
												class="form-label small fw-semibold"
											>
												Năm xuất bản *
											</label>
											<input
												type="number"
												class="form-control"
												v-model.number="form.NamXuatBan"
												min="1900"
												:max="maxYear"
												required
											/>
										</div>

										<div class="col-12 col-md-6">
											<label
												class="form-label small fw-semibold"
											>
												Nhà xuất bản *
											</label>
											<div
												class="input-group input-group-sm mb-2"
											>
												<input
													v-model="publisherSearch"
													type="text"
													class="form-control"
													placeholder="Tìm nhà xuất bản..."
													@keyup.enter.prevent="
														searchPublishers
													"
												/>
												<button
													class="btn btn-outline-secondary"
													type="button"
													@click="searchPublishers"
													:disabled="
														publisherSearching
													"
												>
													<span
														v-if="
															publisherSearching
														"
														>...</span
													>
													<span v-else>Tìm</span>
												</button>
											</div>

											<div
												v-if="selectedPublisher"
												class="small mb-2"
											>
												<strong>Đã chọn:</strong>
												{{ selectedPublisher.MaNXB }} -
												{{ selectedPublisher.TenNXB }}
											</div>

											<div
												v-if="publisherResults.length"
												class="border rounded small"
												style="
													max-height: 150px;
													overflow: auto;
												"
											>
												<table
													class="table table-sm mb-0"
												>
													<tbody>
														<tr
															v-for="p in publisherResults"
															:key="p.MaNXB"
															@click="
																choosePublisher(
																	p
																)
															"
															class="table-hover-row"
															style="
																cursor: pointer;
															"
														>
															<td
																class="text-nowrap"
															>
																{{ p.MaNXB }}
															</td>
															<td>
																{{ p.TenNXB
																}}<br />
																<span
																	class="text-muted"
																>
																	{{
																		p.DiaChi
																	}}
																</span>
															</td>
														</tr>
													</tbody>
												</table>
											</div>
											<div class="form-text small">
												* Tìm theo tên hoặc địa chỉ NXB.
											</div>
										</div>

										<div class="col-6 col-md-3">
											<label
												class="form-label small fw-semibold"
											>
												Số lượng *
											</label>
											<input
												type="number"
												class="form-control"
												min="0"
												v-model.number="form.SoQuyen"
												required
											/>
										</div>
										<div class="col-6 col-md-3">
											<label
												class="form-label small fw-semibold"
											>
												Giá *
											</label>
											<input
												type="number"
												class="form-control"
												min="0"
												step="1000"
												v-model.number="form.DonGia"
												required
											/>
										</div>
										<div class="col-12">
											<label
												class="form-label small fw-semibold"
											>
												Mô tả *
											</label>
											<textarea
												class="form-control"
												v-model="form.MoTa"
												required
											></textarea>
										</div>
										<div class="col-12">
											<label
												class="form-label small fw-semibold"
											>
												Hình bìa sách
											</label>
											<div
												class="upload-area border border-dashed rounded-3 p-3 text-center"
												@click="triggerFileSelect"
												@dragover.prevent
												@drop.prevent="handleDrop"
											>
												<input
													type="file"
													class="d-none"
													ref="fileInput"
													accept="image/*"
													@change="handleFileChange"
												/>
												<div class="upload-area-inner">
													<div
														class="upload-icon mb-2"
													>
														<i
															class="fa-solid fa-cloud-arrow-up"
														></i>
													</div>
													<div class="small">
														Click để tải lên hoặc
														kéo và thả
													</div>
													<div
														class="text-muted small"
													>
														PNG, JPG lên đến 5MB
													</div>
												</div>
											</div>
										</div>
									</div>

									<div
										class="d-flex justify-content-end gap-2 mt-3"
									>
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
											<span v-if="saving">Saving...</span>
											<span v-else>
												{{
													formMode === "create"
														? "Gửi"
														: "Lưu thay đổi"
												}}
											</span>
										</button>
									</div>
								</form>
							</div>

							<!-- Preview -->
							<div class="col-12 col-lg-4">
								<div
									class="preview-card border rounded-3 p-3 h-100"
								>
									<h6 class="fw-semibold mb-3">Xem trước</h6>
									<div class="preview-cover mb-3">
										<div
											class="preview-cover-inner rounded-3"
										>
											<img
												v-if="coverPreviewUrl"
												:src="coverPreviewUrl"
												alt="cover"
												class="preview-img"
											/>
											<div
												v-else
												class="text-muted text-center"
											>
												<div class="text-center">
													<i
														class="fa-regular fa-image fs-2"
													></i>
												</div>
												<span class="small">
													Chưa chọn hình ảnh
												</span>
											</div>
										</div>
									</div>
									<div class="small">
										<div class="fw-semibold mb-1">
											{{ form.TenSach || "Book Title" }}
										</div>
										<div class="text-muted mb-1">
											{{
												form.NguonGoc_TacGia || "Author"
											}}
										</div>
										<div class="text-muted">
											{{
												form.NamXuatBan
													? `Xuất bản ${form.NamXuatBan}`
													: "Năm xuất bản"
											}}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Modal xóa sách -->
		<div v-if="showDeleteModal" class="modal-backdrop-custom">
			<div class="modal-dialog-custom">
				<div class="card border-0 shadow">
					<div
						class="card-header bg-white d-flex justify-content-between align-items-center"
					>
						<h6 class="mb-0 fw-semibold">Xóa sách</h6>
						<button
							class="btn btn-sm btn-outline-secondary"
							@click="closeDeleteModal"
							:disabled="deleting"
						>
							<i class="fa-solid fa-xmark"></i>
						</button>
					</div>
					<div class="card-body">
						<p class="small mb-3">
							Bạn có chắc chắn muốn xóa cuốn sách này không?
						</p>
						<ul class="small mb-3">
							<li>
								<strong>ID:</strong>
								{{ bookToDelete?.MaSach }}
							</li>
							<li>
								<strong>Title:</strong>
								{{ bookToDelete?.TenSach }}
							</li>
							<li>
								<strong>Author:</strong>
								{{ bookToDelete?.NguonGoc_TacGia }}
							</li>
						</ul>
						<div class="d-flex justify-content-end gap-2">
							<button
								class="btn btn-outline-secondary btn-sm"
								@click="closeDeleteModal"
								:disabled="deleting"
							>
								Hủy
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
	</div>
</template>

<script>
import BookService from "@/services/book.service";
import adminApi from "@/services/adminApi.service";
import PublisherService from "@/services/publisher.service";
import { toast } from "vue3-toastify";

export default {
	name: "AdminBooks",
	data() {
		return {
			books: [],
			publishers: [],
			loading: false,
			saving: false,
			deleting: false,
			deletingId: null,

			searchKeyword: "",

			// phần tìm kiếm nhà xuất bản
			publisherSearch: "",
			publisherResults: [],
			publisherSearching: false,
			selectedPublisher: null,

			showFormModal: false,
			formMode: "create",
			form: {
				MaSach: "",
				TenSach: "",
				MoTa: "",
				NguonGoc_TacGia: "",
				MaNXB: "",
				NamXuatBan: "",
				SoQuyen: 1,
				DonGia: 0,
			},
			coverFile: null,
			coverPreviewUrl: "",

			showDeleteModal: false,
			bookToDelete: null,

			maxYear: new Date().getFullYear() + 1,
		};
	},
	created() {
		this.loadPublishers();
		this.loadBooks();
	},
	methods: {
		// Hàm tải danh sách sách
		async loadBooks() {
			this.loading = true;
			try {
				let res;
				if (this.searchKeyword.trim()) {
					res = await BookService.searchBooks(this.searchKeyword);
				} else {
					res = await BookService.getAllBooks();
				}
				const raw = res?.data || res || [];
				this.books = Array.isArray(raw) ? raw : raw.data || [];
			} catch (error) {
				console.error(error);
				toast.error("Không tải được danh sách sách.");
			} finally {
				this.loading = false;
			}
		},
		// Hàm tải danh sách nhà xuất bản
		async loadPublishers() {
			try {
				const res = await PublisherService.getAllPublishers();
				const raw = res?.data || res || [];
				this.publishers = Array.isArray(raw) ? raw : raw.data || [];
			} catch (error) {
				console.error(error);
			}
		},
		// Hàm lấy tên nhà xuất bản theo mã
		getPublisherName(maNXB) {
			const found = this.publishers.find((p) => p.MaNXB === maNXB);
			return found ? found.TenNXB : maNXB;
		},
		// Hàm định dạng giá tiền
		formatPrice(value) {
			if (value == null) return "-";
			return value.toLocaleString("vi-VN") + " đ";
		},
		// Hàm sinh url ảnh bìa
		getCoverUrl(filename) {
			if (!filename) return "/placeholder-book.png";
			return `/uploads/books/${filename}`;
		},
		// Hàm mở modal thêm sách
		openCreateModal() {
			this.formMode = "create";
			this.form = {
				MaSach: "",
				TenSach: "",
				MoTa: "",
				NguonGoc_TacGia: "",
				MaNXB: "",
				NamXuatBan: new Date().getFullYear(),
				SoQuyen: 1,
				DonGia: 0,
			};
			this.coverFile = null;
			this.coverPreviewUrl = "";

			// Reset publisher search
			this.publisherSearch = "";
			this.publisherResults = [];
			this.selectedPublisher = null;

			this.showFormModal = true;
		},
		// Hàm mở modal sửa sách
		openEditModal(book) {
			this.formMode = "edit";
			this.form = {
				MaSach: book.MaSach,
				TenSach: book.TenSach,
				MoTa: book.MoTa || "",
				NguonGoc_TacGia: book.NguonGoc_TacGia,
				MaNXB: book.MaNXB,
				NamXuatBan: book.NamXuatBan,
				SoQuyen: book.SoQuyen,
				DonGia: book.DonGia,
			};
			this.coverFile = null;
			this.coverPreviewUrl = book.AnhBia
				? this.getCoverUrl(book.AnhBia)
				: "";

			// Set publisher đã chọn
			this.publisherSearch = "";
			this.publisherResults = [];
			const foundPublisher = this.publishers.find(
				(p) => p.MaNXB === book.MaNXB
			);
			this.selectedPublisher = foundPublisher || null;

			this.showFormModal = true;
		},
		// Hàm đóng modal form
		closeFormModal() {
			if (this.saving) return;
			this.showFormModal = false;
		},
		// Hàm mở hộp chọn file
		triggerFileSelect() {
			this.$refs.fileInput?.click();
		},
		// Hàm tìm kiếm nhà xuất bản
		searchPublishers() {
			if (!this.publisherSearch.trim()) {
				this.publisherResults = [];
				this.selectedPublisher = null;
				this.form.MaNXB = "";
				return;
			}
			this.publisherSearching = true;
			try {
				const keyword = this.publisherSearch.toLowerCase();
				this.publisherResults = this.publishers.filter((p) => {
					const tenNXB = (p.TenNXB || "").toLowerCase();
					const diaChi = (p.DiaChi || "").toLowerCase();
					const maNXB = (p.MaNXB || "").toLowerCase();
					return (
						tenNXB.includes(keyword) ||
						diaChi.includes(keyword) ||
						maNXB.includes(keyword)
					);
				});

				if (this.publisherResults.length === 0) {
					toast.info("Không tìm thấy nhà xuất bản phù hợp.");
				}
			} catch (error) {
				console.error(error);
				toast.error("Lỗi khi tìm kiếm nhà xuất bản.");
			} finally {
				this.publisherSearching = false;
			}
		},
		// Hàm chọn nhà xuất bản
		choosePublisher(publisher) {
			this.selectedPublisher = publisher;
			this.form.MaNXB = publisher.MaNXB;
		},
		// Hàm xử lí drop file
		handleDrop(e) {
			const file = e.dataTransfer?.files?.[0];
			if (file) this.setCoverFile(file);
		},
		// Hàm xử lí change file
		handleFileChange(e) {
			const file = e.target.files?.[0];
			if (file) this.setCoverFile(file);
		},
		// Hàm gán file ảnh bìa và tạo preview
		setCoverFile(file) {
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Ảnh bìa tối đa 5MB.");
				return;
			}
			this.coverFile = file;
			if (this.coverPreviewUrl) {
				URL.revokeObjectURL(this.coverPreviewUrl);
			}
			this.coverPreviewUrl = URL.createObjectURL(file);
		},
		// Hàm gửi dữ liệu thêm/sửa sách
		async submitForm() {
			// Validate nhà xuất bản
			if (!this.form.MaNXB) {
				toast.error("Vui lòng chọn nhà xuất bản.");
				return;
			}

			this.saving = true;
			try {
				const fd = new FormData();
				fd.append("TenSach", this.form.TenSach);
				fd.append("MoTa", this.form.MoTa);
				fd.append("NguonGoc_TacGia", this.form.NguonGoc_TacGia);
				fd.append("MaNXB", this.form.MaNXB);
				fd.append("NamXuatBan", this.form.NamXuatBan);
				fd.append("SoQuyen", this.form.SoQuyen);
				fd.append("DonGia", this.form.DonGia);
				if (this.coverFile) {
					fd.append("AnhBia", this.coverFile);
				}

				let res;
				if (this.formMode === "create") {
					res = await adminApi.post("/books", fd);
				} else {
					res = await adminApi.put(`/books/${this.form.MaSach}`, fd);
				}
				const ok = res?.data?.success ?? true;
				if (!ok) {
					toast.error(
						res?.data?.message ||
							(this.formMode === "create"
								? "Thêm sách thất bại."
								: "Cập nhật sách thất bại.")
					);
					return;
				}
				toast.success(
					this.formMode === "create"
						? "Thêm sách thành công."
						: "Cập nhật sách thành công."
				);
				this.showFormModal = false;
				this.loadBooks();
			} catch (error) {
				console.error(error);
				const msg =
					error?.response?.data?.message ||
					(this.formMode === "create"
						? "Có lỗi xảy ra khi thêm sách."
						: "Có lỗi xảy ra khi cập nhật sách.");
				toast.error(msg);
			} finally {
				this.saving = false;
			}
		},
		// Hàm mở modal xóa sách
		openDeleteModal(book) {
			this.bookToDelete = book;
			this.showDeleteModal = true;
		},
		// Hàm đóng modal xóa sách
		closeDeleteModal() {
			if (this.deleting) return;
			this.showDeleteModal = false;
			this.bookToDelete = null;
		},
		// Hàm xác nhận xóa sách
		async confirmDelete() {
			if (!this.bookToDelete) return;
			this.deleting = true;
			this.deletingId = this.bookToDelete.MaSach;
			try {
				const res = await adminApi.delete(
					`/books/${this.bookToDelete.MaSach}`
				);
				const ok = res?.data?.success ?? true;
				if (!ok) {
					toast.error(res?.data?.message || "Xóa sách thất bại.");
					return;
				}
				toast.success("Xóa sách thành công.");
				this.showDeleteModal = false;
				this.bookToDelete = null;
				this.loadBooks();
			} catch (error) {
				console.error(error);
				const msg =
					error?.response?.data?.message ||
					"Có lỗi xảy ra khi xóa sách.";
				toast.error(msg);
			} finally {
				this.deleting = false;
				this.deletingId = null;
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
.admin-book-table thead th {
	font-size: 0.8rem;
	color: #6b7280;
	border-bottom: 1px solid #e5e7eb;
}
.admin-book-table tbody td {
	font-size: 0.85rem;
	border-top: 1px solid #f3f4f6;
}
.book-cover-thumb {
	width: 48px;
	height: 64px;
	background-color: #e5e7eb;
	border-radius: 0.5rem;
	overflow: hidden;
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
	overflow-y: auto;
	padding: 20px 0;
}
.modal-dialog-custom {
	max-width: 520px;
	width: 100%;
	padding: 0 12px;
	margin: auto;
}
.modal-dialog-lg {
	max-width: 1050px; /* rộng hơn một chút cho giống mockup */
	width: 100%;
	padding: 0 12px;
	margin: auto;
	max-height: calc(100vh - 40px);
	overflow-y: auto;
}

/* upload area */
.upload-area {
	background-color: #f9fafb;
	border-style: dashed !important;
	cursor: pointer;
}
.upload-area-inner {
	pointer-events: none;
}
.upload-icon {
	font-size: 1.5rem;
	color: #9ca3af;
}

/* preview */
.preview-card {
	background-color: #f9fafb;
	display: flex;
	flex-direction: column;
	height: 100%;
}

.preview-cover {
	flex: 1;
	margin-bottom: 0.75rem;
}

.preview-cover-inner {
	background-color: #f3f4f6;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	min-height: 260px;
	border-radius: 0.75rem;
	overflow: hidden;
}

.preview-img {
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
}

/* text dưới preview */
.preview-card .small {
	font-size: 0.85rem;
}

/* table hover row cho search results */
.table-hover-row:hover {
	background-color: #f3f4f6;
}
</style>
