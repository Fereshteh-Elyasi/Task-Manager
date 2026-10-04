<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BoardColumn;
use App\Models\Task;
use App\Support\ApiId;
use App\Support\ProjectAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    private function taskPayload(Task $task): array
    {
        $task->loadMissing(['labels', 'checklistItems', 'comments', 'attachments']);

        return [
            'id' => ApiId::format('t', $task->id),
            'title' => $task->title,
            'description' => $task->description ?? '',
            'priority' => $task->priority,
            'assigneeId' => $task->assignee_id ? ApiId::format('u', $task->assignee_id) : '',
            'dueDate' => $task->due_date ?? '',
            'labelIds' => $task->labels->map(fn ($l) => ApiId::format('l', $l->id))->values()->all(),
            'checklist' => $task->checklistItems->map(fn ($c) => [
                'id' => ApiId::format('c', $c->id),
                'text' => $c->text,
                'done' => (bool) $c->done,
            ])->values()->all(),
            'attachments' => $task->attachments->map(fn ($a) => [
                'id' => ApiId::format('att', $a->id),
                'name' => $a->file_name,
                'url' => $a->file_url,
            ])->values()->all(),
            'comments' => $task->comments->map(fn ($cm) => [
                'id' => ApiId::format('cm', $cm->id),
                'text' => $cm->text,
                'authorId' => ApiId::format('u', $cm->author_id),
                'createdAt' => optional($cm->created_at)?->toDateTimeString(),
            ])->values()->all(),
        ];
    }

    public function store(Request $request, string $id)
    {
        if ($request->user()->role === 'guest') {
            return response()->json(['error' => 'مهمان نمی‌تواند تسک بسازد.'], 403);
        }

        $column = BoardColumn::findOrFail(ApiId::parse($id));

        if (!ProjectAccess::canAccessProject($request->user(), ProjectAccess::projectIdForColumn($column))) {
            return response()->json(['error' => 'دسترسی ندارید.'], 403);
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['nullable', 'in:low,medium,high'],
            'assigneeId' => ['nullable', 'string'],
            'dueDate' => ['nullable', 'string', 'max:30'],
            'labelIds' => ['nullable', 'array'],
            'labelIds.*' => ['string'],
        ]);

        $position = (int) Task::where('column_id', $column->id)->max('position') + 1;

        $task = Task::create([
            'column_id' => $column->id,
            'title' => trim($data['title']),
            'description' => $data['description'] ?? '',
            'priority' => $data['priority'] ?? 'medium',
            'assignee_id' => !empty($data['assigneeId']) ? ApiId::parse($data['assigneeId']) : null,
            'due_date' => $data['dueDate'] ?? null,
            'position' => $position,
        ]);

        if (!empty($data['labelIds'])) {
            $labelIds = collect($data['labelIds'])->map(fn ($lid) => ApiId::parse($lid))->all();
            $task->labels()->sync($labelIds);
        }

        return response()->json($this->taskPayload($task->fresh()), 201);
    }

    public function show(Request $request, string $id)
    {
        $task = Task::findOrFail(ApiId::parse($id));

        return response()->json($this->taskPayload($task));
    }

    public function update(Request $request, string $id)
    {
        if ($request->user()->role === 'guest') {
            return response()->json(['error' => 'مجاز نیست.'], 403);
        }

        $task = Task::findOrFail(ApiId::parse($id));

        if (!ProjectAccess::canAccessProject($request->user(), ProjectAccess::projectIdForTask($task))) {
            return response()->json(['error' => 'دسترسی ندارید.'], 403);
        }

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'priority' => ['sometimes', 'in:low,medium,high'],
            'assigneeId' => ['sometimes', 'nullable', 'string'],
            'dueDate' => ['sometimes', 'nullable', 'string', 'max:30'],
            'columnId' => ['sometimes', 'string'],
            'position' => ['sometimes', 'integer', 'min:0'],
            'labelIds' => ['sometimes', 'array'],
            'labelIds.*' => ['string'],
        ]);

        if (array_key_exists('columnId', $data)) {
            $targetColumn = BoardColumn::findOrFail(ApiId::parse($data['columnId']));
            if (!ProjectAccess::canAccessProject($request->user(), ProjectAccess::projectIdForColumn($targetColumn))) {
                return response()->json(['error' => 'دسترسی به ستون مقصد ندارید.'], 403);
            }
        }

        DB::transaction(function () use ($task, $data) {
            if (array_key_exists('title', $data)) {
                $task->title = trim($data['title']);
            }
            if (array_key_exists('description', $data)) {
                $task->description = $data['description'] ?? '';
            }
            if (array_key_exists('priority', $data)) {
                $task->priority = $data['priority'];
            }
            if (array_key_exists('assigneeId', $data)) {
                $task->assignee_id = $data['assigneeId'] ? ApiId::parse($data['assigneeId']) : null;
            }
            if (array_key_exists('dueDate', $data)) {
                $task->due_date = $data['dueDate'] ?: null;
            }
            if (array_key_exists('columnId', $data)) {
                $task->column_id = ApiId::parse($data['columnId']);
            }
            if (array_key_exists('position', $data)) {
                $task->position = $data['position'];
            }
            $task->save();

            if (array_key_exists('labelIds', $data)) {
                $labelIds = collect($data['labelIds'] ?? [])->map(fn ($lid) => ApiId::parse($lid))->all();
                $task->labels()->sync($labelIds);
            }
        });

        return response()->json($this->taskPayload($task->fresh()));
    }

    public function destroy(Request $request, string $id)
    {
        if ($request->user()->role === 'guest') {
            return response()->json(['error' => 'مجاز نیست.'], 403);
        }

        $task = Task::findOrFail(ApiId::parse($id));

        if (!ProjectAccess::canAccessProject($request->user(), ProjectAccess::projectIdForTask($task))) {
            return response()->json(['error' => 'دسترسی ندارید.'], 403);
        }

        $task->delete();

        return response()->json(['ok' => true]);
    }
}
