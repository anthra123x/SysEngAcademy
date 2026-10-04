<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClanProject extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'clan_id',
        'title',
        'description',
        'lead_researcher',
        'status',
        'tech_stack',
        'members_joined',
        'active_branch',
        'production_deployment',
    ];

    protected $casts = [
        'tech_stack'            => 'array',
        'members_joined'        => 'array',
        'production_deployment' => 'array',
    ];

    public function clan()
    {
        return $this->belongsTo(Clan::class, 'clan_id');
    }

    public function tasks()
    {
        return $this->hasMany(ClanProjectTask::class, 'project_id');
    }

    public function pullRequests()
    {
        return $this->hasMany(ClanProjectPullRequest::class, 'project_id')->orderBy('number', 'desc');
    }

    public function commits()
    {
        return $this->hasMany(ClanProjectCommit::class, 'project_id')->latest();
    }
}
