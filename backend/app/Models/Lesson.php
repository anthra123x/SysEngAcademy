<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id', 'title', 'slug', 'order', 'content',
        'type', 'video_url', 'duration_minutes', 'is_preview',
        'language', 'starter_code', 'solution', 'test_cases', 'hint',
    ];

    protected $casts = [
        'content' => 'array',
        'is_preview' => 'boolean',
        'test_cases' => 'array',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function quiz()
    {
        return $this->hasOne(Quiz::class);
    }

    public function progress()
    {
        return $this->hasMany(LessonProgress::class);
    }
}
