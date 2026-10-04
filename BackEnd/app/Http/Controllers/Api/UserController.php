<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\InviteUserMail;
use App\Models\ProjectMember;
use App\Models\User;
use App\Support\ApiId;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class UserController extends Controller
{
    private function userPayload(User $user): array
    {
        return [
            'id' => ApiId::format('u', $user->id),
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'color' => $user->color ?? '#6C4CF1',
            'role' => $user->role ?? 'member',
            'createdAt' => optional($user->created_at)?->toDateTimeString(),
        ];
    }

    public function index()
    {
        return response()->json(
            User::orderBy('name')->get()->map(fn ($u) => $this->userPayload($u))->values()
        );
    }

    public function show(Request $request, string $id)
    {
        $user = User::findOrFail(ApiId::parse($id));

        $memberships = ProjectMember::where('user_id', $user->id)
            ->with('project')
            ->get()
            ->map(fn ($pm) => $pm->project ? [
                'id' => ApiId::format('p', $pm->project->id),
                'name' => $pm->project->name,
                'icon' => $pm->project->icon,
                'projectRole' => $pm->role,
                'joinedAt' => optional($pm->joined_at)?->toDateTimeString(),
            ] : null)
            ->filter()
            ->values();

        return response()->json([
            ...$this->userPayload($user),
            'projects' => $memberships,
        ]);
    }

    public function updateMe(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:150'],
            'avatar' => ['sometimes', 'nullable', 'string'],
            'color' => ['sometimes', 'string', 'max:20'],
        ]);

        if (array_key_exists('name', $data)) {
            $user->name = trim($data['name']);
        }
        if (array_key_exists('avatar', $data)) {
            $user->avatar = $data['avatar'];
        }
        if (array_key_exists('color', $data)) {
            $user->color = $data['color'];
        }

        $user->save();

        return response()->json($this->userPayload($user));
    }

    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'currentPassword' => ['required', 'string'],
            'newPassword' => ['required', 'string', 'min:4'],
        ]);

        $user = $request->user();

        if (!Hash::check($data['currentPassword'], $user->password)) {
            return response()->json(['error' => 'رمز فعلی اشتباه است.'], 422);
        }

        $user->password = $data['newPassword'];
        $user->save();

        return response()->json(['ok' => true]);
    }

    public function invite(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'فقط ادمین می‌تواند دعوت کند.'], 403);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'unique:users,email'],
            'role' => ['nullable', 'in:admin,member,guest'],
        ]);

        $tempPassword = bin2hex(random_bytes(4));
        $colors = ['#6C4CF1', '#2FAE7C', '#FF6B4A', '#E0A419', '#2F8FE0', '#C13584'];

        $user = User::create([
            'name' => trim($data['name']),
            'email' => strtolower($data['email']),
            'password' => $tempPassword,
            'role' => $data['role'] ?? 'member',
            'color' => $colors[array_rand($colors)],
        ]);

        $emailSent = false;
        try {
            Mail::to($user->email)->send(new InviteUserMail(
                $user->name,
                $user->email,
                $tempPassword
            ));
            $emailSent = true;
        } catch (\Throwable $e) {
            report($e);
            $emailSent = false;
        }

        return response()->json([
            'user' => $this->userPayload($user),
            'tempPassword' => $tempPassword,
            'emailSent' => $emailSent,
        ], 201);
    }

    public function updateRole(Request $request, string $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'فقط ادمین.'], 403);
        }

        $data = $request->validate([
            'role' => ['required', 'in:admin,member,guest'],
        ]);

        $user = User::findOrFail(ApiId::parse($id));
        $user->role = $data['role'];
        $user->save();

        return response()->json($this->userPayload($user));
    }
}
