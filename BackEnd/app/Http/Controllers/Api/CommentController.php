<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Task;
use App\Support\ApiId;
use App\Support\ProjectAccess;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(Request $request, string $id)
    {
        $task = Task::findOrFail(ApiId::parse($id));

        if (!ProjectAccess::canAccessProject($request->user(), ProjectAccess::projectIdForTask($task))) {
            return response()->json(['error' => 'دسترسی ندارید.'], 403);
        }

        $data = $request->validate(['text' => ['required', 'string', 'max:5000']]);

        $comment = Comment::create([
            'task_id' => $task->id,
            'author_id' => $request->user()->id,
            'text' => trim($data['text']),
        ]);

        return response()->json([
            'id' => ApiId::format('cm', $comment->id),
            'text' => $comment->text,
            'authorId' => ApiId::format('u', $comment->author_id),
            'createdAt' => optional($comment->created_at)?->toDateTimeString(),
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $comment = Comment::findOrFail(ApiId::parse($id));
        $user = $request->user();

        if ($comment->author_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['error' => 'فقط نویسنده‌ی کامنت می‌تواند آن را ویرایش کند.'], 403);
        }

        $data = $request->validate(['text' => ['required', 'string', 'max:5000']]);
        $comment->text = trim($data['text']);
        $comment->save();

        return response()->json([
            'id' => ApiId::format('cm', $comment->id),
            'text' => $comment->text,
            'authorId' => ApiId::format('u', $comment->author_id),
            'createdAt' => optional($comment->created_at)?->toDateTimeString(),
        ]);
    }

    public function destroy(Request $request, string $id)
    {
        $comment = Comment::findOrFail(ApiId::parse($id));
        $user = $request->user();

        if ($comment->author_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['error' => 'فقط نویسنده‌ی کامنت می‌تواند آن را حذف کند.'], 403);
        }

        $comment->delete();

        return response()->json(['ok' => true]);
    }
}
