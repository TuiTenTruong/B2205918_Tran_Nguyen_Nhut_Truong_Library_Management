<template>
	<div
		class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light"
	>
		<div
			class="card shadow-sm border-0"
			style="max-width: 420px; width: 100%"
		>
			<div class="card-body p-4">
				<h5 class="fw-bold mb-1 text-center">Đăng nhập quản trị</h5>
				<p class="text-muted small mb-4 text-center">
					Hệ thống quản lý thư viện
				</p>

				<form @submit.prevent="handleSubmit">
					<div class="mb-3">
						<label class="form-label small fw-semibold"
							>Email</label
						>
						<input
							v-model="email"
							type="email"
							class="form-control"
							required
						/>
					</div>

					<div class="mb-3">
						<label class="form-label small fw-semibold"
							>Mật khẩu</label
						>
						<input
							v-model="password"
							type="password"
							class="form-control"
							required
						/>
					</div>

					<button
						class="btn btn-dark w-100"
						type="submit"
						:disabled="loading"
					>
						<span v-if="loading">Đang đăng nhập...</span>
						<span v-else>Đăng nhập</span>
					</button>
				</form>
			</div>
		</div>
	</div>
</template>

<script>
import StaffService from "@/services/staff.service"; // anh tự tạo nếu chưa có
import { toast } from "vue3-toastify";
export default {
	name: "AdminLogin",
	data() {
		return {
			email: "",
			password: "",
			loading: false,
		};
	},
	methods: {
		async handleSubmit() {
			this.loading = true;
			try {
				const res = await StaffService.login({
					Email: this.email,
					Password: this.password,
				});
				if (!res.success || !res.data) {
					toast.error(res.message || "Đăng nhập thất bại.");
					return;
				}

				localStorage.setItem("staffToken", res.data.Token);
				localStorage.setItem(
					"staffInfo",
					JSON.stringify(res.data.Staff)
				);

				toast.success("Đăng nhập admin thành công.");

				this.$router.push({ name: "admin-dashboard" });
			} catch (error) {
				console.error(error);
				const msg =
					error?.response?.data?.message ||
					"Lỗi khi đăng nhập admin.";
				toast.error(msg);
			} finally {
				this.loading = false;
			}
		},
	},
};
</script>
