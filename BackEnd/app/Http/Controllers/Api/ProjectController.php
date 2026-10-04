<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\BoardColumn;
use App\Models\Label;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Task;
use App\Models\User;
use App\Support\ApiId;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProjectController extends Controller
{
    private function projectPayload(Project $p): array
    {
        return [
            'id' => ApiId::format('p', $p->id),
            'name' => $p->name,
            'icon' => $p->icon,
            'createdBy' => $p->created_by ? ApiId::format('u', $p->created_by) : null,
            'createdAt' => optional($p->created_at)?->toDateTimeString(),
        ];
    }

    private function canAccess(User $user, int $projectId): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return ProjectMember::where('project_id', $projectId)
            ->where('user_id', $user->id)
            ->exists();
    }

    public function index(Request $request)
    {
        $projects = Project::orderBy('created_at')->get();

        return response()->json(
            $projects->map(fn ($p) => $this->projectPayload($p))->values()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:200'],
            'icon' => ['nullable', 'string', 'max:30'],
        ]);

        $user = $request->user();
        $icon = $data['icon'] ?? 'diamond';

        $project = DB::transaction(function () use ($data, $user, $icon) {
            $project = Project::create([
                'name' => trim($data['name']),
                'icon' => $icon,
                'created_by' => $user->id,
            ]);

            $board = Board::create([
                'project_id' => $project->id,
                'title' => $project->name,
            ]);

            foreach (['برای انجام', 'در حال انجام', 'بازبینی', 'انجام‌شده'] as $i => $title) {
                BoardColumn::create([
                    'board_id' => $board->id,
                    'title' => $title,
                    'position' => $i,
                ]);
            }

            foreach ([
                ['بک‌اند', '#6C4CF1'],
                ['فرانت‌اند', '#2FAE7C'],
                ['طراحی', '#FF6B4A'],
                ['فوری', '#E0A419'],
            ] as [$name, $color]) {
                Label::create([
                    'project_id' => $project->id,
                    'name' => $name,
                    'color' => $color,
                ]);
            }

            ProjectMember::create([
                'project_id' => $project->id,
                'user_id' => $user->id,
                'role' => 'owner',
                'joined_at' => now(),
            ]);

            return $project;
        });

        return response()->json($this->projectPayload($project), 201);
    }

    public function update(Request $request, string $id)
    {
        $projectId = ApiId::parse($id);
        $project = Project::findOrFail($projectId);
        $user = $request->user();

        if (!$this->canAccess($user, $project->id)) {
            return response()->json(['error' => 'دسترسی ندارید.'], 403);
        }

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:200'],
            'icon' => ['sometimes', 'nullable', 'string', 'max:30'],
        ]);

        if (array_key_exists('name', $data)) {
            $project->name = trim($data['name']);
        }
        if (array_key_exists('icon', $data)) {
            $project->icon = $data['icon'];
        }
        $project->save();

        if (array_key_exists('name', $data)) {
            Board::where('project_id', $project->id)->update(['title' => $project->name]);
        }

        return response()->json($this->projectPayload($project));
    }

    public function destroy(Request $request, string $id)
    {
        $projectId = ApiId::parse($id);
        $project = Project::findOrFail($projectId);
        $user = $request->user();

        $isOwner = ProjectMember::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->where('role', 'owner')
            ->exists();

        if ($user->role !== 'admin' && !$isOwner) {
            return response()->json(['error' => 'اجازه حذف این پروژه را ندارید.'], 403);
        }

        $project->delete();

        return response()->json(['ok' => true]);
    }

    public function members(Request $request, string $id)
    {
        $projectId = ApiId::parse($id);
        Project::findOrFail($projectId);

        $rows = ProjectMember::where('project_id', $projectId)->with('user')->get();

        return response()->json(
            $rows->map(function ($pm) {
                $u = $pm->user;
                if (!$u) {
                    return null;
                }

                return [
                    'id' => ApiId::format('u', $u->id),
                    'name' => $u->name,
                    'email' => $u->email,
                    'avatar' => $u->avatar,
                    'color' => $u->color ?? '#6C4CF1',
                    'role' => $u->role,
                    'projectRole' => $pm->role,
                    'joinedAt' => optional($pm->joined_at)?->toDateTimeString(),
                ];
            })->filter()->values()
        );
    }

    public function addMember(Request $request, string $id)
    {
        $projectId = ApiId::parse($id);
        Project::findOrFail($projectId);
        $user = $request->user();

        $allowed = $user->role === 'admin' || ProjectMember::where('project_id', $projectId)
            ->where('user_id', $user->id)
            ->whereIn('role', ['owner', 'member'])
            ->exists();

        if (!$allowed) {
            return response()->json(['error' => 'اجازه افزودن عضو ندارید.'], 403);
        }

        $data = $request->validate([
            'userId' => ['nullable', 'string'],
            'email' => ['nullable', 'email'],
            'role' => ['nullable', 'in:owner,member,viewer'],
        ]);

        $target = null;
        if (!empty($data['userId'])) {
            $target = User::find(ApiId::parse($data['userId']));
        } elseif (!empty($data['email'])) {
            $target = User::where('email', strtolower($data['email']))->first();
        }

        if (!$target) {
            return response()->json(['error' => 'کاربر پیدا نشد. ابتدا باید ثبت‌نام کرده باشد.'], 404);
        }

        $role = $data['role'] ?? 'member';

        $pm = ProjectMember::updateOrCreate(
            ['project_id' => $projectId, 'user_id' => $target->id],
            ['role' => $role, 'joined_at' => now()]
        );

        return response()->json([
            'id' => ApiId::format('u', $target->id),
            'name' => $target->name,
            'email' => $target->email,
            'avatar' => $target->avatar,
            'color' => $target->color ?? '#6C4CF1',
            'role' => $target->role,
            'projectRole' => $role,
            'joinedAt' => optional($pm->joined_at)?->toDateTimeString(),
        ], 201);
    }

    public function removeMember(Request $request, string $id, string $userId)
    {
        $projectId = ApiId::parse($id);
        $project = Project::findOrFail($projectId);
        $user = $request->user();

        $allowed = $user->role === 'admin' || ProjectMember::where('project_id', $projectId)
            ->where('user_id', $user->id)
            ->where('role', 'owner')
            ->exists();

        if (!$allowed) {
            return response()->json(['error' => 'اجازه حذف عضو ندارید.'], 403);
        }

        $targetId = ApiId::parse($userId);

        if ($targetId === $project->created_by && $user->role !== 'admin') {
            return response()->json(['error' => 'نمی‌توان سازنده‌ی پروژه را حذف کرد.'], 422);
        }

        ProjectMember::where('project_id', $projectId)->where('user_id', $targetId)->delete();

        // اگر تسک‌هایی به این کاربر در همین پروژه محول شده، مسئول را پاک کن
        Task::whereHas('column.board', fn ($q) => $q->where('project_id', $projectId))
            ->where('assignee_id', $targetId)
            ->update(['assignee_id' => null]);

        return response()->json(['ok' => true]);
    }
}
