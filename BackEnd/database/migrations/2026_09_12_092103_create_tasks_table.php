<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::create('tasks', function (Blueprint $table) {
        $table->id();
        $table->foreignId('column_id')->constrained('board_columns')->cascadeOnDelete();
        $table->string('title');
        $table->text('description')->nullable();
        $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
        $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
        $table->string('due_date', 30)->nullable();
        $table->unsignedInteger('position')->default(0);
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('tasks');
}
};
