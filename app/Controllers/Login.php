<?php

namespace App\Controllers;

class Login extends BaseController
{
    public function index()
    {
        echo view('templates/entryHeader');
		echo view('pages/login');
		echo view('templates/entryFooter');
    }
}