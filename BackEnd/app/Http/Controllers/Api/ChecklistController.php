<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChecklistItem;
use App\Models\Task;
use App\Support\ApiId;
use App\Support\ProjectAccess;
use Illuminate\Http\Request;

class ChecklistController extends Controller
{
    public function store(Request $request, string $id)
    {
        if ($request->user()->role === 'guest') {
            return response()->json(['error' => 'مجاز نیست.'], 403);
        }

        $task = Task::findOrFail(ApiId::parse($id));

        if (!ProjectAccess::canAccessProject($request->user(), ProjectAccess::projectIdForTask($task))) {
            return response()->json(['error' => 'دسترسی ندارید.'], 403);
        }

        $data = $request->validate(['text' => ['required', 'string', 'max:500']]);
        $position = (int) ChecklistItem::where('task_id', $task->id)->max('position') + 1;

        $item = ChecklistItem::create([
            'task_id' => $task->id,
            'text' => trim($data['text']),
            'done' => false,
            'position' => $position,
        ]);

        return response()->json([
            'id' => ApiId::format('c', $item->id),
            'text' => $item->text,
            'done' => false,
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        if ($request->user()->role === 'guest') {
            return response()->json(['error' => 'مجاز نیست.'], 403);
        }

        $item = ChecklistItem::findOrFail(ApiId::parse($id));

        if (!ProjectAccess::canAccessProject($request->user(), ProjectAccess::projectIdForChecklistItem($item))) {
            return response()->json(['error' => 'دسترسی ندارید.'], 403);
        }

        $data = $request->validate([
            'text' => ['sometimes', 'string', 'max:500'],
            'done' => ['sometimes', 'boolean'],
        ]);

        if (array_key_exists('text', $data)) {
            $item->text = trim($data['text']);
        }
        if (array_key_exists('done', $data)) {
            $item->done = $data['done'];
        }
        $item->save();

        return response()->json([
            'id' => ApiId::format('c', $item->id),
            'text' => $item->text,
            'done' => (bool) $item->done,
        ]);
    }

    public function destroy(Request $request, string $id)
    {
        if ($request->user()->role === 'guest') {
            return response()->json(['error' => 'مجاز نیست.'], 403);
        }

        $item = ChecklistItem::findOrFail(ApiId::parse($id));

        if (!ProjectAccess::canAccessProject($request->user(), ProjectAccess::projectIdForChecklistItem($item))) {
            return response()->json(['error' => 'دسترسی ندارید.'], 403);
        }

        $item->delete();

        return response()->json(['ok' => true]);
    }
}
