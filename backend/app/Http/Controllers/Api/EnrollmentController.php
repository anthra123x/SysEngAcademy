<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Course;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function index(Request $request)
    {
        $enrollments = $request->user()
            ->enrollments()
            ->with(['course.category', 'course.instructor'])
            ->latest()
            ->get();

        return response()->json($enrollments);
    }

    public function store(Request $request)
    {
        $request->validate(['course_id' => 'required|exists:courses,id']);

        $course = Course::findOrFail($request->course_id);

        $enrollment = Enrollment::firstOrCreate(
            ['user_id' => $request->user()->id, 'course_id' => $course->id],
            ['enrolled_at' => now(), 'progress_percent' => 0]
        );

        return response()->json($enrollment, 201);
    }
}
