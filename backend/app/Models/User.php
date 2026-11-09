<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'avatar', 'role', 'email_verified_at',
        'last_activity_date', 'today_study_seconds', 'total_study_seconds', 'xp', 'specialization',
        'diagnostic_result',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_activity_date' => 'date',
            'today_study_seconds' => 'integer',
            'total_study_seconds' => 'integer',
            'xp' => 'integer',
            'diagnostic_result' => 'array',
        ];
    }

    public function courses()
    {
        return $this->hasMany(Course::class, 'instructor_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function lessonProgress()
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function aiConversations()
    {
        return $this->hasMany(AiConversation::class);
    }

    public function dailyActivities()
    {
        return $this->hasMany(UserDailyActivity::class);
    }

    public function courseReviews()
    {
        return $this->hasMany(CourseReview::class);
    }

    public function studentFeedbacks()
    {
        return $this->hasMany(StudentFeedback::class, 'student_id');
    }

    public function appNotifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function codelabSubmissions()
    {
        return $this->hasMany(CodelabSubmission::class);
    }

    public function codelabChallenges()
    {
        return $this->hasMany(CodelabChallenge::class);
    }

    public function socialAccounts()
    {
        return $this->hasMany(SocialAccount::class);
    }

    public function getGithubAccount()
    {
        return $this->socialAccounts()->where('provider', 'github')->first();
    }
}
