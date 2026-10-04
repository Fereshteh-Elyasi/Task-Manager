<?php

use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\ChecklistController;
use App\Http\Controllers\Api\ColumnController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\LabelController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    // Users
    Route::get('users', [UserController::class, 'index']);
    Route::get('users/{id}', [UserController::class, 'show']);
    Route::patch('users/me', [UserController::class, 'updateMe']);
    Route::post('users/me/password', [UserController::class, 'changePassword']);
    Route::post('users/invite', [UserController::class, 'invite']);
    Route::patch('users/{id}/role', [UserController::class, 'updateRole']);

    // Projects
    Route::get('projects', [ProjectController::class, 'index']);
    Route::post('projects', [ProjectController::class, 'store']);
    Route::patch('projects/{id}', [ProjectController::class, 'update']);
    Route::delete('projects/{id}', [ProjectController::class, 'destroy']);
    Route::get('projects/{id}/board', [BoardController::class, 'show']);
    Route::post('projects/{id}/columns', [ColumnController::class, 'store']);
    Route::get('projects/{id}/labels', [LabelController::class, 'index']);
    Route::post('projects/{id}/labels', [LabelController::class, 'store']);
    Route::get('projects/{id}/members', [ProjectController::class, 'members']);
    Route::post('projects/{id}/members', [ProjectController::class, 'addMember']);
    Route::delete('projects/{id}/members/{userId}', [ProjectController::class, 'removeMember']);

    // Columns
    Route::patch('columns/{id}', [ColumnController::class, 'update']);
    Route::delete('columns/{id}', [ColumnController::class, 'destroy']);

    // Tasks
    Route::post('columns/{id}/tasks', [TaskController::class, 'store']);
    Route::get('tasks/{id}', [TaskController::class, 'show']);
    Route::patch('tasks/{id}', [TaskController::class, 'update']);
    Route::delete('tasks/{id}', [TaskController::class, 'destroy']);
    Route::post('tasks/{id}/checklist', [ChecklistController::class, 'store']);
    Route::post('tasks/{id}/comments', [CommentController::class, 'store']);
    Route::post('tasks/{id}/attachments', [AttachmentController::class, 'store']);

    // Checklist / Labels / Attachments
    Route::patch('checklist/{id}', [ChecklistController::class, 'update']);
    Route::delete('checklist/{id}', [ChecklistController::class, 'destroy']);
    Route::patch('comments/{id}', [CommentController::class, 'update']);
    Route::delete('comments/{id}', [CommentController::class, 'destroy']);
    Route::delete('labels/{id}', [LabelController::class, 'destroy']);
    Route::patch('labels/{id}', [LabelController::class, 'update']);
    Route::delete('attachments/{id}', [AttachmentController::class, 'destroy']);
});
