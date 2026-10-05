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
        'status',
        'is_resolved',
        'resolved_at',
        'is_dismissed',
        'dismissed_at',
        'remediation_action',
    ];

    protected $casts = [
        'xp_impact' => 'integer',
        'is_read' => 'boolean',
        'is_resolved' => 'boolean',
        'is_dismissed' => 'boolean',
        'resolved_at' => 'datetime',
        'dismissed_at' => 'datetime',
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
