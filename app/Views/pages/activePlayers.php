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
							<h1 class="h3" id="hunt-name"><?= esc($huntId) ?></h1>
						</div>
						
						<div id="liveAlertPlaceholder"></div>
						
						<ul class="nav nav-tabs">
							<li class="nav-item">
								<button class="nav-link active me-1" id="map-toggle" onclick="openMap()">Map</button>
							</li>
							<li class="nav-item">
								<button class="nav-link link-dark position-relative" id="messages-toggle" onclick="openMessages()" style="background-color:#cf9a5e1f;">
									Hunt Messages
									<span class="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle"
										id="messages-notification" style="display: none;"></span>
								</button>
							</li>
						</ul>
						
						<div class="bg-white px-3 py-2 border-start border-bottom border-end" id="map-container">
							<p id="no-players-message">There are no active players at right now.</p>

							<div class="bg-success" id="map"  style="height: 500px;"></div>                
						</div>
						
						<div class="bg-white px-3 py-2 border-start border-bottom border-end" id="messages-container" style="display: none;">
							<div class="row">

								<div class="col-md-5 col-lg-4 p-0">
									<div class="ps-3 text-start h-100 rounded-start" style="background-color:#5BA6A2">
										<p class="pt-2 mb-2 text-white">Active users</p>
										
										<div class="ms-2 me-5" id="chat-users"></div>
									</div>
								</div>
								
								<div class="col-md-7 col-lg-8 p-0" id="chat-container" style="height: 500px; display: none;">
									<div class="text-start">
										<p class="m-0 py-2 ps-4" id="chat-username" style="background-color: #dfdfdf;"></p>
									</div>
									
									<hr class="m-0">
									<ul class="py-2 ps-3 m-0 bg-white h-100" id="messages-list">                                      
									</ul>
									
									<form id="message-form">
										<div class="d-flex align-items-center justify-content-center py-2" style="background-color: #dfdfdf;">
											<div class="col-8 col-md-8 col-lg-9 me-2">
												<input type="text" class="form-control" id="chat-message-input">
											</div>
											<div class="col-auto">
												<label for="chat-message-submit" class="btn btn-green"><i class="bi bi-send"> Send</i></label>
												<input class="visually-hidden" id="chat-message-submit" type="submit" value="" form="message-form"/>
											</div>										
										</div>
									</form>
								</div>
								
							</div>
						</div>
						
					</main>
				</div>
			</div>
		</div>