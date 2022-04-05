								<li class="nav-item">
									<a class="nav-link link-dark" href="<?php echo base_url(); ?>/home">
										<i class="fs-4 me-2 bi-speedometer2"></i> <span>Dashboard</span>
									</a>
								</li>
								<li class="nav-item">
									<a class="nav-link link-dark" href="<?php echo base_url(); ?>/create">
										<i class="fs-4 me-2 bi-pin-map"></i> <span>Create hunt</span>
									</a>
								</li>
							</ul>
							<hr>
							<a class="nav-link link-danger" href="#" onclick="logoutUser()">
								<i class="fs-4 bi-box-arrow-right"></i> <span>Logout</span>
							</a>
						</div>
					</nav>

					<main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
						<div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
							<h1 class="h2" id="hunt-name"><?= esc($huntId) ?></h1>
						</div>
					  
						<div class="card">
							<div class="card-body text-center">
								<div id="liveAlertPlaceholder"></div>

								<p id="no-players-message">There are no active players at right now.</p>

								<div class="bg-success" id="map"  style="height: 500px;"></div>
							</div>							
						</div>
						
						<div class="mt-3 mb-4">
							<div class="row">

								<div class="col-md-5 col-lg-4 pe-0">
									<div class="ps-3 text-start h-100 rounded-start" style="background-color:#5BA6A2">
										<p class="pt-2 mb-2 text-white">Active users (5)</p>
										
										<div class="ms-2 me-5" id="chat-users">
											<button type="button" class="btn btn-green mb-1 py-1 text-start w-100">User</button>
											<button type="button" class="btn btn-green mb-1 py-1 text-start w-100">User</button>
											<button type="button" class="btn btn-green mb-1 py-1 text-start w-100">User</button>
										</div>
									</div>									
								</div>
								
								<div class="col-md-7 col-lg-8 ps-0" style="height: 500px;">
									<div class="text-start">
										<p class="m-0 py-2 ps-4" style="background-color: #dfdfdf;">User</p>
									</div>
									<hr class="m-0">
									<ul class="py-2 ps-3 m-0 bg-white h-100" id="messages-list">
										<li class="mb-2 text-start">
											<p class="message d-inline-block rounded p-2 m-0">An item</p>
										</li>
										<li class="mb-2 text-start">
											<p class="message d-inline-block rounded p-2 m-0">An item</p>
										</li>																
									</ul>
									
									<div class="d-flex align-items-center justify-content-center py-2" style="background-color: #dfdfdf;">
										<div class="col-8 col-md-8 col-lg-9 me-2">
											<input type="text" class="form-control" >
										</div>
										<div class="col-auto">
											<button type="submit" class="btn btn-green">Send</button>
										</div>
									</div>
								</div>
								
							</div>
						</div>
						
					</main>
				</div>
			</div>
		</div>