<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserDailyActivity extends Model
{
    use HasFactory;

    protected $table = 'user_daily_activities';

    protected $fillable = [
        'user_id',
        'activity_date',
        'study_seconds',
        'lessons_completed',
        'quizzes_completed',
        'challenges_completed',
    ];

    protected $casts = [
        'activity_date' => 'date',
        'study_seconds' => 'integer',
        'lessons_completed' => 'integer',
        'quizzes_completed' => 'integer',
        'challenges_completed' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
