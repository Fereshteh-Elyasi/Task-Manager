<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Support\ApiId;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    private function canAccess(Request $request, Project $project): bool
    {
        $user = $request->user();
        if ($user->role === 'admin') {
            return true;
        }

        return ProjectMember::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->exists();
    }

    public function show(Request $request, string $id)
    {
        $projectId = ApiId::parse($id);
        $project = Project::with([
            'board.columns.tasks.labels',
            'board.columns.tasks.checklistItems',
            'board.columns.tasks.comments',
            'board.columns.tasks.attachments',
            'labels',
        ])->findOrFail($projectId);

        $board = $project->board;
        if (!$board) {
            return response()->json(['error' => 'برد پیدا نشد.'], 404);
        }

        $tasksMap = [];
        $columnsPayload = [];

        foreach ($board->columns as $col) {
            $taskIds = [];
            foreach ($col->tasks as $task) {
                $tid = ApiId::format('t', $task->id);
                $taskIds[] = $tid;

                $tasksMap[$tid] = [
                    'id' => $tid,
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

            $columnsPayload[] = [
                'id' => ApiId::format('col', $col->id),
                'title' => $col->title,
                'taskIds' => $taskIds,
            ];
        }

        return response()->json([
            'board' => [
                'id' => $board->id,
                'title' => $board->title,
                'columns' => $columnsPayload,
            ],
            'tasks' => $tasksMap,
            'labels' => $project->labels->map(fn ($l) => [
                'id' => ApiId::format('l', $l->id),
                'name' => $l->name,
                'color' => $l->color,
            ])->values(),
        ]);
    }
}
