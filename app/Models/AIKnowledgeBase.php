<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AIKnowledgeBase extends Model
{
    use HasFactory;

    protected $table = 'ai_knowledge_base';

    protected $fillable = [
        'file_name',
        'file_path',
        'file_size',
        'parsed_content',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'file_size' => 'integer',
    ];

    protected $appends = ['file_size_human'];

    /**
     * Get all active documents' content combined
     */
    public static function getActiveContent(): string
    {
        return static::where('is_active', true)
            ->pluck('parsed_content')
            ->filter()
            ->implode("\n\n---\n\n");
    }

    /**
     * Get human-readable file size
     */
    public function getFileSizeHumanAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
