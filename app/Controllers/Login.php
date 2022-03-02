<?php

namespace App\Controllers;

class Login extends BaseController
{
    public function index()
    {
        echo view('templates/entryHeader');
		echo view('templates/entryFooter');
    }
}