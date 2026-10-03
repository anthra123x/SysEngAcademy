<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentFeedback extends Model
{
    use HasFactory;

    protected $table = 'student_feedbacks';

    protected $fillable = [
        'student_id',
        'teacher_id',
        'teacher_name',
        'type',
        'title',
        'message',
        'ai_context_summary',
        'xp_impact',
        'is_read',
    ];

    protected $casts = [
        'xp_impact' => 'integer',
        'is_read' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
