<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\BoardColumn;
use App\Models\Project;
use App\Support\ApiId;
use App\Support\ProjectAccess;
use Illuminate\Http\Request;

class ColumnController extends Controller
{
    public function store(Request $request, string $id)
    {
        $projectId = ApiId::parse($id);
        $project = Project::findOrFail($projectId);

        if (!ProjectAccess::canAccessProject($request->user(), $project->id)) {
            return response()->json(['error' => 'دسترسی ندارید.'], 403);
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:150'],
        ]);

        $board = Board::where('project_id', $project->id)->firstOrFail();
        $position = (int) BoardColumn::where('board_id', $board->id)->max('position') + 1;

        $col = BoardColumn::create([
            'board_id' => $board->id,
            'title' => trim($data['title']),
            'position' => $position,
        ]);

        return response()->json([
            'id' => ApiId::format('col', $col->id),
            'title' => $col->title,
            'taskIds' => [],
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        if ($request->user()->role === 'guest') {
            return response()->json(['error' => 'مجاز نیست.'], 403);
        }

        $col = BoardColumn::findOrFail(ApiId::parse($id));

        if (!ProjectAccess::canAccessProject($request->user(), ProjectAccess::projectIdForColumn($col))) {
            return response()->json(['error' => 'دسترسی ندارید.'], 403);
        }

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:150'],
            'position' => ['sometimes', 'integer', 'min:0'],
        ]);

        if (array_key_exists('title', $data)) {
            $col->title = trim($data['title']);
        }
        if (array_key_exists('position', $data)) {
            $col->position = $data['position'];
        }
        $col->save();

        return response()->json([
            'id' => ApiId::format('col', $col->id),
            'title' => $col->title,
            'taskIds' => $col->tasks()->orderBy('position')->pluck('id')
                ->map(fn ($tid) => ApiId::format('t', $tid))->values(),
        ]);
    }

    public function destroy(Request $request, string $id)
    {
        if ($request->user()->role === 'guest') {
            return response()->json(['error' => 'مجاز نیست.'], 403);
        }

        $col = BoardColumn::findOrFail(ApiId::parse($id));

        if (!ProjectAccess::canAccessProject($request->user(), ProjectAccess::projectIdForColumn($col))) {
            return response()->json(['error' => 'دسترسی ندارید.'], 403);
        }

        $col->delete();

        return response()->json(['ok' => true]);
    }
}
