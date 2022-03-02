	<div class="container pt-5">
        <div class="row d-flex justify-content-center align-items-center">
            <div class="col-12 col-md-8 col-lg-6 col-xl-5">
                <div class="card" style="border-radius: 1rem; background: white;">
                    <div class="card-body px-5 py-2 text-center">
                        <p class="fw-bold fs-4 mb-3 text-uppercase title">Register</p>
                        <p class="mb-3" id="error-message" style="display: none;">Error</p>

                        <form class="text-start" id="register-form">
                            <div class="mb-3 px-3">
                                <input type="text" id="register-username" class="form-control"
                                    placeholder="Username" required>
                            </div>                           

                            <div class="input-group date mb-3 px-3" id="datepicker">
                                <span class="input-group-append">
                                    <span class="input-group-text bg-light d-block">
                                        <i class="bi bi-calendar-event"></i>
                                    </span>
                                </span>

                                <input type="text" class="form-control" id="register-date"
                                    placeholder="Date of Birth" required>
                            </div>

                            <div class="mb-3 px-3">
                                <input type="email" class="form-control" id="register-email"
                                    placeholder="Email address" required> 
                            </div>

                            <div class="mb-2 px-3">
                                <input type="password" class="form-control" id="register-password"
                                    placeholder="Password" required>
                            </div>

                            <div class="mb-2 px-3">
                                <input type="password" class="form-control" id="register-repeat-password"
                                    placeholder="Repeat Password" required>
                            </div>

                            
                            <div class="mt-4 px-3 text-center">
                                <button class="btn btn-green w-100">Register</button>
                            </div>
                            
                        </form>

                        <div>
                            <p class="mt-5 mb-2">Already have an account?
                                <a href="#!" class="text-success">Login</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>