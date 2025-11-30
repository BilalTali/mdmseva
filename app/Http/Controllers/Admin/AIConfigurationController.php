<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AIConfiguration;
use App\Models\AIKnowledgeBase;
use App\Services\PDFParserService;
use App\Services\AIAgentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AIConfigurationController extends Controller
{
    /**
     * Display AI configuration page
     */
    public function index(): Response
    {
        $config = AIConfiguration::current();
        $knowledgeBase = AIKnowledgeBase::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/AIConfiguration/Index', [
            'config' => $config,
            'knowledgeBase' => $knowledgeBase,
        ]);
    }

    /**
     * Update AI configuration
     */
    public function updateConfig(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'system_prompt' => 'required|string|max:10000',
            'is_enabled' => 'boolean',
            'auto_respond' => 'boolean',
            'model_name' => 'required|string|max:255',
            'max_tokens' => 'integer|min:100|max:4096',
            'temperature' => 'numeric|min:0|max:1',
        ]);

        $config = AIConfiguration::current();
        $config->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'AI configuration updated successfully',
            'data' => $config
        ]);
    }

    /**
     * Upload and process PDF for knowledge base
     */
    public function uploadPDF(Request $request): JsonResponse
    {
        $request->validate([
            'pdf' => 'required|file|mimes:pdf|max:10240', // 10MB max
        ]);

        try {
            $file = $request->file('pdf');
            
            // Store file in private disk (stores directly in storage/app/ai-knowledge-base/)
            $path = $file->store('', 'private'); // Empty string = root of private disk
            
            // Get full path using Storage facade (handles cross-platform paths correctly)
            $fullPath = Storage::disk('private')->path($path);

            // Parse PDF content
            $parser = app(PDFParserService::class);
            $content = $parser->parse($fullPath);

            if (empty($content)) {
                // Clean up the uploaded file
                Storage::disk('private')->delete($path);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to extract text from PDF. The file may be empty or contain only images.'
                ], 422);
            }

            // Save to database
            $knowledgeBase = AIKnowledgeBase::create([
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'parsed_content' => $content,
                'is_active' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'PDF uploaded and processed successfully',
                'data' => $knowledgeBase
            ]);

        } catch (\Exception $e) {
            // Clean up if file was uploaded but processing failed
            if (isset($path)) {
                Storage::disk('private')->delete($path);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to process PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle PDF active status
     */
    public function togglePDF(int $id): JsonResponse
    {
        $pdf = AIKnowledgeBase::findOrFail($id);
        $pdf->update(['is_active' => !$pdf->is_active]);

        return response()->json([
            'success' => true,
            'message' => $pdf->is_active ? 'PDF activated' : 'PDF deactivated',
            'data' => $pdf
        ]);
    }

    /**
     * Delete PDF from knowledge base
     */
    public function deletePDF(int $id): JsonResponse
    {
        $pdf = AIKnowledgeBase::findOrFail($id);

        // Delete file from storage
        Storage::disk('private')->delete($pdf->file_path);

        // Delete database record
        $pdf->delete();

        return response()->json([
            'success' => true,
            'message' => 'PDF deleted successfully'
        ]);
    }

    /**
     * Test AI configuration
     */
    public function testAI(): JsonResponse
    {
        $aiService = app(AIAgentService::class);
        $result = $aiService->testConfiguration();

        return response()->json($result);
    }
}
