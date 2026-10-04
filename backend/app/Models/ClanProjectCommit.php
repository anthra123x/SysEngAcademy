<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClanProjectCommit extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'project_id',
        'clan_id',
        'hash',
        'message',
        'author',
        'branch',
        'time_ago',
    ];

    public function project()
    {
        return $this->belongsTo(ClanProject::class, 'project_id');
    }

    public function clan()
    {
        return $this->belongsTo(Clan::class, 'clan_id');
    }
}
