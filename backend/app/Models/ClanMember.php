<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClanMember extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'clan_id',
        'user_id',
        'role',
        'joined_at',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
    ];

    public function clan()
    {
        return $this->belongsTo(Clan::class, 'clan_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
