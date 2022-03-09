<?php

namespace App\Controllers;

class Home extends BaseController
{
    public function home()
    {
        echo view('templates/homeHeader');
		echo view('pages/home');
		echo view('templates/homeFooter');
    }
	
	public function create(){
		echo view('templates/homeHeader');
		echo view('pages/create');
		echo view('templates/homeFooter');
	}
	
	public function active(){
		echo view('templates/homeHeader');
		echo view('pages/activePlayers');
		echo view('templates/homeFooter');
	}
}
