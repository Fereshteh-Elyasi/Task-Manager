<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Label;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Support\ApiId;
use Illuminate\Http\Request;

class LabelController extends Controller
{
    private function canAccess(Request $request, int $projectId): bool
    {
        $user = $request->user();
        if ($user->role === 'admin') {
            return true;
        }

        return ProjectMember::where('project_id', $projectId)
            ->where('user_id', $user->id)
            ->exists();
    }

    public function index(Request $request, string $id)
    {
        $projectId = ApiId::parse($id);
        Project::findOrFail($projectId);

        return response()->json(
            Label::where('project_id', $projectId)->get()->map(fn ($l) => [
                'id' => ApiId::format('l', $l->id),
                'name' => $l->name,
                'color' => $l->color,
            ])->values()
        );
    }

    public function store(Request $request, string $id)
    {
        if ($request->user()->role === 'guest') {
            return response()->json(['error' => 'مجاز نیست.'], 403);
        }

        $projectId = ApiId::parse($id);
        Project::findOrFail($projectId);

        if (!$this->canAccess($request, $projectId)) {
            return response()->json(['error' => 'دسترسی ندارید.'], 403);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        $label = Label::create([
            'project_id' => $projectId,
            'name' => trim($data['name']),
            'color' => $data['color'] ?? '#6C4CF1',
        ]);

        return response()->json([
            'id' => ApiId::format('l', $label->id),
            'name' => $label->name,
            'color' => $label->color,
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        if ($request->user()->role === 'guest') {
            return response()->json(['error' => 'مجاز نیست.'], 403);
        }

        $label = Label::findOrFail(ApiId::parse($id));

        if (!$this->canAccess($request, $label->project_id)) {
            return response()->json(['error' => 'دسترسی ندارید.'], 403);
        }

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'color' => ['sometimes', 'nullable', 'string', 'max:20'],
        ]);

        if (array_key_exists('name', $data)) {
            $label->name = trim($data['name']);
        }
        if (array_key_exists('color', $data) && $data['color']) {
            $label->color = $data['color'];
        }
        $label->save();

        return response()->json([
            'id' => ApiId::format('l', $label->id),
            'name' => $label->name,
            'color' => $label->color,
        ]);
    }

    public function destroy(Request $request, string $id)
    {
        if ($request->user()->role === 'guest') {
            return response()->json(['error' => 'مجاز نیست.'], 403);
        }

        $label = Label::findOrFail(ApiId::parse($id));

        if (!$this->canAccess($request, $label->project_id)) {
            return response()->json(['error' => 'دسترسی ندارید.'], 403);
        }

        $label->delete();

        return response()->json(['ok' => true]);
    }
}
