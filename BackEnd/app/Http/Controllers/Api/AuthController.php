<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeUserMail;
use App\Models\User;
use App\Support\ApiId;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
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
        ];
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:190', 'unique:users,email'],
            'password' => ['required', 'string', 'min:4'],
        ]);

        $colors = ['#6C4CF1', '#2FAE7C', '#FF6B4A', '#E0A419', '#3B82F6', '#EC4899'];

        $user = User::create([
            'name' => $data['name'],
            'email' => strtolower($data['email']),
            'password' => $data['password'],
            'color' => $colors[array_rand($colors)],
            'role' => 'member',
        ]);

        $token = $user->createToken('api')->plainTextToken;

        $emailSent = false;
        try {
            Mail::to($user->email)->send(new WelcomeUserMail($user->name, $user->email));
            $emailSent = true;
        } catch (\Throwable $e) {
            report($e);
            $emailSent = false;
        }

        return response()->json([
            'token' => $token,
            'user' => $this->userPayload($user),
            'emailSent' => $emailSent,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', strtolower($data['email']))->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['error' => 'ایمیل یا رمز عبور اشتباه است.'], 401);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->userPayload($user),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['ok' => true]);
    }

    public function me(Request $request)
    {
        return response()->json($this->userPayload($request->user()));
    }
}
