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
}
