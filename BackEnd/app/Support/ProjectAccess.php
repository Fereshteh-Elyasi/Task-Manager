<?php

namespace App\Support;

use App\Models\BoardColumn;
use App\Models\ChecklistItem;
use App\Models\Comment;
use App\Models\Attachment;
use App\Models\ProjectMember;
use App\Models\Task;
use App\Models\User;

class ProjectAccess
{
    public static function canAccessProject(User $user, int $projectId): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return ProjectMember::where('project_id', $projectId)
            ->where('user_id', $user->id)
            ->exists();
    }

    public static function projectIdForColumn(BoardColumn $column): int
    {
        return $column->board->project_id;
    }

    public static function projectIdForTask(Task $task): int
    {
        return $task->column->board->project_id;
    }

    public static function projectIdForChecklistItem(ChecklistItem $item): int
    {
        return self::projectIdForTask($item->task);
    }

    public static function projectIdForComment(Comment $comment): int
    {
        return self::projectIdForTask($comment->task);
    }

    public static function projectIdForAttachment(Attachment $attachment): int
    {
        return self::projectIdForTask($attachment->task);
    }
}
