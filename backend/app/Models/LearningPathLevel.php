<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LearningPathLevel extends Model
{
    use HasFactory;

    protected $fillable = ['learning_path_id', 'title', 'order', 'description'];

    public function learningPath()
    {
        return $this->belongsTo(LearningPath::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class)->orderBy('order');
    }
}
