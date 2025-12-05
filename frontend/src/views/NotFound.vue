<template>
	<div class="notfound-page">
		<div class="container h-100">
			<div class="row h-100 justify-content-center align-items-center">
				<div class="col-12 col-md-8 col-lg-6">
					<div class="card border-0 shadow-sm p-4 text-center">
						<div class="mb-3">
							<div class="notfound-code">404</div>
							<h5 class="fw-semibold mb-1">
								Không tìm thấy trang
							</h5>
							<p class="text-muted small mb-3">
								Trang bạn đang tìm kiếm không tồn tại hoặc đã
								được di chuyển.
							</p>
						</div>

						<div
							class="d-flex justify-content-center gap-2 flex-wrap"
						>
							<RouterLink
								to="/"
								class="btn btn-dark btn-sm d-flex align-items-center"
							>
								<i class="fa-solid fa-house me-1"></i>
								Về trang chủ
							</RouterLink>

							<RouterLink
								to="/auth"
								class="btn btn-outline-secondary btn-sm d-flex align-items-center"
							>
								<i class="fa-regular fa-user me-1"></i>
								Đến trang đăng nhập
							</RouterLink>
						</div>

						<hr class="my-3" />

						<p class="text-muted small mb-0">
							Nếu bạn cho rằng đây là lỗi, vui lòng kiểm tra lại
							URL hoặc liên hệ với nhân viên thư viện.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "NotFound",
};
</script>

<style scoped>
.notfound-page {
	background-color: #f5f7fb;
	min-height: 100vh;
}

.notfound-code {
	font-size: 3.5rem;
	font-weight: 800;
	color: #111827;
	letter-spacing: 0.1em;
}
</style>
