	<div class="container pt-5">
        <div class="row d-flex justify-content-center align-items-center">
            <div class="col-12 col-md-8 col-lg-6 col-xl-5">
                <div class="card" style="border-radius: 1rem; background: white;">
                    <div class="card-body px-5 py-2 text-center">
                        <p class="fw-bold fs-4 mb-3 text-uppercase title">Register</p>
                        <p class="mb-3 text-danger" id="error-message" ></p>

                        <form class="text-start" id="register-form">
                            <div class="mb-3 px-3">
                                <input type="text" id="register-username" class="form-control"
                                    placeholder="Username" required>
                            </div>                           

                            <div class="mb-3 px-3">
                                <span class="text-small">Date of Birth</span>
                                <div class="input-group">
                                    <input type="number" class="form-control" id="dateDay" placeholder="Day">                                  
                                    <input type="number" class="form-control" id="dateMonth" placeholder="Month">                                    
                                    <input type="number" class="form-control" id="dateYear" placeholder="Year">
                                </div>
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
                                <input type="password" class="form-control" id="register-repeat"
                                    placeholder="Repeat Password" required>
                            </div>

                            
                            <div class="mt-4 px-3 text-center">
                                <button class="btn btn-green w-100" onclick="signup()">Register</button>
                            </div>
                            
                        </form>

                        <div>
                            <p class="mt-5 mb-2">Already have an account?
                                <a href="<?php echo base_url(); ?>/login" class="text-success">Login</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>