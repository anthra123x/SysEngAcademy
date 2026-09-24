<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description', 'icon', 'color'];

    public function learningPaths()
    {
        return $this->hasMany(LearningPath::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}
