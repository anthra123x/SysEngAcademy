<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'slug', 'description', 'category_id', 'instructor_id',
        'thumbnail', 'is_published', 'is_free', 'duration_hours', 'difficulty',
        'learning_path_id', 'learning_path_level_id', 'order',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'is_free' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function learningPath()
    {
        return $this->belongsTo(LearningPath::class);
    }

    public function level()
    {
        return $this->belongsTo(LearningPathLevel::class, 'learning_path_level_id');
    }

    public function modules()
    {
        return $this->hasMany(Module::class)->orderBy('order');
    }

    public function lessons()
    {
        return $this->hasManyThrough(Lesson::class, Module::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }
}
