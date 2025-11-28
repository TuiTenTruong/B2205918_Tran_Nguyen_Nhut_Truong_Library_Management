<template>
	<div class="auth-page d-flex align-items-center justify-content-center">
		<div class="card auth-card shadow-lg border-0">
			<div class="row g-0">
				<div class="col-12">
					<div class="auth-card__right p-4 p-lg-5">
						<!-- Tabs -->
						<div class="auth-card__tabs mb-4">
							<button
								type="button"
								class="auth-card__tab-btn"
								:class="{
									'auth-card__tab-btn--active':
										mode === 'login',
								}"
								@click="switchMode('login')"
							>
								Đăng nhập
							</button>
							<button
								type="button"
								class="auth-card__tab-btn"
								:class="{
									'auth-card__tab-btn--active':
										mode === 'register',
								}"
								@click="switchMode('register')"
							>
								Đăng ký
							</button>
						</div>

						<!-- FORM ĐĂNG NHẬP -->
						<form
							v-if="mode === 'login'"
							@submit.prevent="handleLogin"
						>
							<div class="mb-3">
								<label class="form-label small fw-semibold"
									>Email</label
								>
								<input
									v-model.trim="loginForm.Email"
									type="email"
									class="form-control"
									placeholder="you@example.com"
									required
								/>
							</div>

							<div class="mb-3">
								<label class="form-label small fw-semibold"
									>Mật khẩu</label
								>
								<input
									v-model.trim="loginForm.MatKhau"
									type="password"
									class="form-control"
									placeholder="••••••••"
									required
								/>
							</div>

							<div
								class="d-flex justify-content-between align-items-center mb-3"
							>
								<div class="form-check small">
									<input
										class="form-check-input"
										type="checkbox"
										id="rememberMe"
										v-model="rememberMe"
									/>
									<label
										class="form-check-label"
										for="rememberMe"
									>
										Ghi nhớ đăng nhập
									</label>
								</div>
							</div>

							<button
								type="submit"
								class="btn auth-card__submit-btn w-100"
								:disabled="loading"
							>
								<span v-if="!loading">Đăng nhập</span>
								<span v-else>Đang đăng nhập...</span>
							</button>
						</form>

						<!-- FORM ĐĂNG KÝ -->
						<form v-else @submit.prevent="handleRegister">
							<div class="row g-2">
								<div class="col-12 col-md-6">
									<div class="mb-2">
										<label
											class="form-label small fw-semibold"
											>Họ lót</label
										>
										<input
											v-model.trim="registerForm.HoLot"
											type="text"
											class="form-control"
											placeholder="Nguyễn Văn"
											required
										/>
									</div>
								</div>
								<div class="col-12 col-md-6">
									<div class="mb-2">
										<label
											class="form-label small fw-semibold"
											>Tên</label
										>
										<input
											v-model.trim="registerForm.Ten"
											type="text"
											class="form-control"
											placeholder="A"
											required
										/>
									</div>
								</div>
							</div>

							<div class="mb-2">
								<label class="form-label small fw-semibold"
									>Email</label
								>
								<input
									v-model.trim="registerForm.Email"
									type="email"
									class="form-control"
									placeholder="you@example.com"
									required
								/>
							</div>

							<div class="row g-2">
								<div class="col-12 col-md-6">
									<div class="mb-2">
										<label
											class="form-label small fw-semibold"
											>Số điện thoại</label
										>
										<input
											v-model.trim="
												registerForm.DienThoai
											"
											type="tel"
											class="form-control"
											placeholder="09xxxxxxxx"
											required
										/>
									</div>
								</div>
								<div class="col-12 col-md-6">
									<div class="mb-2">
										<label
											class="form-label small fw-semibold"
											>Ngày sinh</label
										>
										<input
											v-model="registerForm.NgaySinh"
											type="date"
											class="form-control"
											required
										/>
									</div>
								</div>
							</div>

							<div class="row g-2">
								<div class="col-12 col-md-6">
									<div class="mb-2">
										<label
											class="form-label small fw-semibold"
											>Giới tính</label
										>
										<select
											v-model="registerForm.Phai"
											class="form-select"
											required
										>
											<option value="Nam">Nam</option>
											<option value="Nữ">Nữ</option>
											<option value="Khác">Khác</option>
										</select>
									</div>
								</div>
								<div class="col-12 col-md-6">
									<div class="mb-2">
										<label
											class="form-label small fw-semibold"
											>Địa chỉ</label
										>
										<input
											v-model.trim="registerForm.DiaChi"
											type="text"
											class="form-control"
											placeholder="Địa chỉ hiện tại"
											required
										/>
									</div>
								</div>
							</div>

							<div class="row g-2">
								<div class="col-12 col-md-6">
									<div class="mb-2">
										<label
											class="form-label small fw-semibold"
											>Mật khẩu</label
										>
										<input
											v-model.trim="registerForm.MatKhau"
											type="password"
											class="form-control"
											placeholder="••••••••"
											required
										/>
									</div>
								</div>
								<div class="col-12 col-md-6">
									<div class="mb-3">
										<label
											class="form-label small fw-semibold"
										>
											Nhập lại mật khẩu
										</label>
										<input
											v-model.trim="
												registerForm.MatKhauConfirm
											"
											type="password"
											class="form-control"
											placeholder="••••••••"
											required
										/>
									</div>
								</div>
							</div>

							<button
								type="submit"
								class="btn auth-card__submit-btn w-100"
								:disabled="loading"
							>
								<span v-if="!loading">Tạo tài khoản</span>
								<span v-else>Đang đăng ký...</span>
							</button>
						</form>

						<!-- Gợi ý chuyển tab -->
						<p class="text-center small text-muted mt-3 mb-0">
							<span v-if="mode === 'login'">
								Chưa có tài khoản?
								<button
									type="button"
									class="btn btn-link p-0 align-baseline small"
									@click="switchMode('register')"
								>
									Đăng ký ngay
								</button>
							</span>
							<span v-else>
								Đã có tài khoản?
								<button
									type="button"
									class="btn btn-link p-0 align-baseline small"
									@click="switchMode('login')"
								>
									Đăng nhập
								</button>
							</span>
						</p>
					</div>
				</div>
				<!-- end right -->
			</div>
		</div>
	</div>
</template>

<script>
import ReaderService from "@/services/reader.service";
import { toast } from "vue3-toastify";
export default {
	name: "AuthPage",
	data() {
		return {
			mode: "login", // 'login' | 'register'
			loading: false,
			errorMessage: "",
			successMessage: "",
			rememberMe: false,
			loginForm: {
				Email: "",
				MatKhau: "",
			},
			registerForm: {
				HoLot: "",
				Ten: "",
				Email: "",
				NgaySinh: "",
				Phai: "Nam",
				DiaChi: "",
				DienThoai: "",
				MatKhau: "",
				MatKhauConfirm: "",
			},
		};
	},
	methods: {
		switchMode(newMode) {
			if (this.loading) return;
			this.mode = newMode;
			this.errorMessage = "";
			this.successMessage = "";
		},

		async handleLogin() {
			this.errorMessage = "";
			this.successMessage = "";
			if (!this.loginForm.Email || !this.loginForm.MatKhau) {
				toast.error("Vui lòng nhập đầy đủ Email và Mật khẩu.");
				return;
			}
			this.loading = true;
			try {
				const res = await ReaderService.login(this.loginForm);
				if (!res.success) {
					toast.error(res.message || "Đăng nhập thất bại.");
					return;
				}

				const user = res.data;
				// Lưu token + info vào localStorage (tuỳ anh muốn lưu chỗ khác)
				if (user && user.Token) {
					localStorage.setItem("readerToken", user.Token);
					localStorage.setItem("readerInfo", JSON.stringify(user));
				}

				toast.success("Đăng nhập thành công!");
				// Điều hướng về trang catalog hoặc trang anh muốn
				setTimeout(() => {
					this.$router.push("/"); // chỉnh lại route nếu cần
				}, 500);
			} catch (error) {
				console.error(error);
				toast.error(
					error?.response?.data?.message || "Đăng nhập thất bại."
				);
			} finally {
				this.loading = false;
			}
		},

		async handleRegister() {
			this.errorMessage = "";
			this.successMessage = "";

			if (
				this.registerForm.MatKhau !== this.registerForm.MatKhauConfirm
			) {
				toast.error("Mật khẩu nhập lại không khớp.");
				return;
			}

			this.loading = true;
			try {
				// Chuẩn bị payload đúng với backend
				const payload = {
					HoLot: this.registerForm.HoLot,
					Ten: this.registerForm.Ten,
					Email: this.registerForm.Email,
					NgaySinh: this.registerForm.NgaySinh,
					Phai: this.registerForm.Phai,
					DiaChi: this.registerForm.DiaChi,
					DienThoai: this.registerForm.DienThoai,
					MatKhau: this.registerForm.MatKhau,
				};

				const res = await ReaderService.register(payload);
				if (!res.success) {
					toast.error(res.message || "Đăng ký thất bại.");
					return;
				}

				toast.success(
					res.message || "Đăng ký thành công. Vui lòng đăng nhập."
				);
				// Sau khi đăng ký, chuyển qua tab login
				this.mode = "login";
				// copy Email sang form login cho tiện
				this.loginForm.Email = this.registerForm.Email;
			} catch (error) {
				console.error(error);
				toast.error(
					error?.response?.data?.message || "Đăng ký thất bại."
				);
			} finally {
				this.loading = false;
			}
		},
	},
};
</script>

<style scoped>
.auth-page {
	min-height: 100vh;
	background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #f1f5f9 100%);
	padding: 1.5rem;
}

.auth-card {
	max-width: 930px;
	width: 100%;
	border-radius: 1.25rem;
	overflow: hidden;
}

.auth-card__left-inner {
	padding: 2.5rem 2.25rem;
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: 100%;
}

.auth-card__title {
	font-size: 1.75rem;
	font-weight: 700;
}

.auth-card__subtitle {
	font-size: 0.9rem;
	opacity: 0.9;
}

.auth-card__bullet-list {
	list-style: none;
	padding-left: 0;
	margin: 0;
	font-size: 0.875rem;
}
.auth-card__bullet-list li {
	position: relative;
	padding-left: 1.4rem;
	margin-bottom: 0.4rem;
}
.auth-card__bullet-list li::before {
	content: "•";
	position: absolute;
	left: 0;
	top: -1px;
	font-size: 1.1rem;
}

.auth-card__tabs {
	display: inline-flex;
	padding: 0.25rem;
	border-radius: 999px;
	background-color: #f1f5f9;
}

.auth-card__tab-btn {
	border: none;
	background: transparent;
	padding: 0.35rem 0.9rem;
	font-size: 0.85rem;
	font-weight: 600;
	border-radius: 999px;
	color: #64748b;
	cursor: pointer;
	transition: all 0.18s ease;
}
.auth-card__tab-btn--active {
	background-color: #0f172a;
	color: #ffffff;
	box-shadow: 0 0.25rem 0.75rem rgba(15, 23, 42, 0.3);
}

.auth-card__submit-btn {
	background: #0f172a;
	color: #ffffff;
	border-radius: 999px;
	font-weight: 600;
	font-size: 0.9rem;
	padding: 0.55rem 1rem;
	border: none;
	box-shadow: 0 0.5rem 1.25rem rgba(15, 23, 42, 0.25);
}
.auth-card__submit-btn:hover:enabled {
	transform: translateY(-1px);
	box-shadow: 0 0.75rem 1.5rem rgba(15, 23, 42, 0.28);
}
.auth-card__submit-btn:disabled {
	opacity: 0.7;
	cursor: not-allowed;
}

@media (max-width: 991.98px) {
	.auth-page {
		padding: 1rem;
	}
	.auth-card {
		max-width: 540px;
	}
}
</style>
