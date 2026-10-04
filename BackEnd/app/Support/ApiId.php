<?php

namespace App\Support;

class ApiId
{
    public static function format(string $prefix, int|string $id): string
    {
        return $prefix . '-' . $id;
    }

    public static function parse(?string $value): int
    {
        if ($value === null || $value === '') {
            return 0;
        }

        $parts = explode('-', $value);

        return (int) end($parts);
    }
}
