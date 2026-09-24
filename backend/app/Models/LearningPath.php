<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LearningPath extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'slug', 'description', 'category_id',
        'difficulty', 'thumbnail', 'is_published', 'estimated_hours',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function levels()
    {
        return $this->hasMany(LearningPathLevel::class)->orderBy('order');
    }

    public function courses()
    {
        return $this->hasMany(Course::class)->orderBy('order');
    }
}
