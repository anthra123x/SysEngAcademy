<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClanProjectTask extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'project_id',
        'clan_id',
        'title',
        'description',
        'status',
        'type',
        'assigned_to',
        'xp_reward',
        'completed',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'xp_reward' => 'integer',
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
