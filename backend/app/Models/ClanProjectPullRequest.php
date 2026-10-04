<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClanProjectPullRequest extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'project_id',
        'clan_id',
        'number',
        'title',
        'description',
        'source_branch',
        'target_branch',
        'status',
        'ci_status',
        'author',
        'author_role',
        'preview_url',
        'build_duration',
        'code_diff',
        'reviews',
        'xp_reward',
        'linked_issue_id',
        'merged_at',
        'merged_by',
    ];

    protected $casts = [
        'number'    => 'integer',
        'xp_reward' => 'integer',
        'code_diff' => 'array',
        'reviews'   => 'array',
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
