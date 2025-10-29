<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class BuildAssets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    /**
     * Execute the console command.
     */
    protected $signature = 'assets:build';
    protected $description = 'Build frontend assets';

    public function handle()
    {
        $this->info(shell_exec('npm run build'));
    }
}
