<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\Task;
use App\Support\ApiId;
use App\Support\ProjectAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
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

        $request->validate([
            'file' => ['required', 'file', 'max:5120'],
        ]);

        $file = $request->file('file');
        $path = $file->store('attachments', 'public');
        $url = url(Storage::url($path));

        $att = Attachment::create([
            'task_id' => $task->id,
            'file_name' => $file->getClientOriginalName(),
            'file_url' => $url,
        ]);

        return response()->json([
            'id' => ApiId::format('att', $att->id),
            'name' => $att->file_name,
            'url' => $att->file_url,
        ], 201);
    }

    public function destroy(Request $request, string $id)
    {
        if ($request->user()->role === 'guest') {
            return response()->json(['error' => 'مجاز نیست.'], 403);
        }

        $att = Attachment::findOrFail(ApiId::parse($id));

        if (!ProjectAccess::canAccessProject($request->user(), ProjectAccess::projectIdForAttachment($att))) {
            return response()->json(['error' => 'دسترسی ندارید.'], 403);
        }

        $publicPath = parse_url($att->file_url, PHP_URL_PATH);
        if ($publicPath && str_contains($publicPath, '/storage/')) {
            $relative = ltrim(str_replace('/storage/', '', $publicPath), '/');
            Storage::disk('public')->delete($relative);
        }

        $att->delete();

        return response()->json(['ok' => true]);
    }
}
