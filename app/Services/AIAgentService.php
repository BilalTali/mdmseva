<?php

namespace App\Services;

use App\Models\AIConfiguration;
use App\Models\AIKnowledgeBase;
use App\Models\SupportChat;
use App\Models\SupportMessage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class AIAgentService
{
    protected $apiKey;
    protected $baseUrl;
    protected $defaultModel;
    protected $schoolDataService;

    public function __construct(SchoolDataContextService $schoolDataService)
    {
        $this->apiKey = config('services.gemini.api_key');
        $this->baseUrl = rtrim(config('services.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta'), '/');
        $this->defaultModel = config('services.gemini.default_model', 'gemini-2.5-flash');
        $this->schoolDataService = $schoolDataService;
    }

    /**
     * Generate AI response for a user message in a chat
     * 
     * @param SupportChat $chat
     * @param SupportMessage $userMessage
     * @return SupportMessage|null
     */
    public function generateResponse(SupportChat $chat, SupportMessage $userMessage): ?SupportMessage
    {
        try {
            // Build conversation context
            $context = $this->buildContext($chat);

            // Call Gemini API
            $aiResponse = $this->callGeminiAPI($context, $userMessage->message);

            if (!$aiResponse) {
                Log::warning('AI Agent: No response from Gemini API');
                return null;
            }

            // Create AI-generated message
            // Using user_id = 1 (assuming system/admin user) - adjust based on your setup
            $message = SupportMessage::create([
                'support_chat_id' => $chat->id,
                'user_id' => 1, // System user - you may want to create a dedicated AI user
                'message' => $aiResponse,
                'is_admin' => true,
                'is_ai_generated' => true,
                'is_read' => false,
            ]);

            // Update chat timestamp
            $chat->update(['last_message_at' => now()]);

            Log::info("AI Agent: Generated response for chat {$chat->id}");

            return $message;

        } catch (Exception $e) {
            Log::error('AI Agent Error: ' . $e->getMessage(), [
                'chat_id' => $chat->id,
                'exception' => $e,
            ]);
            return null;
        }
    }

    /**
     * Build conversation context for AI
     * 
     * @param SupportChat $chat
     * @return array
     */
    protected function buildContext(SupportChat $chat): array
    {
        $config = AIConfiguration::current();

        // Get recent message history (last 10 messages)
        $history = $chat->messages()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->reverse()
            ->map(function ($msg) {
                return [
                    'role' => $msg->is_admin ? 'model' : 'user',
                    'parts' => [['text' => $msg->message]]
                ];
            })
            ->toArray();

        // Get knowledge base content
        $knowledgeBase = AIKnowledgeBase::getActiveContent();
        
        // Get user's school data context
        $schoolContext = $this->schoolDataService->formatContextForAI($chat->user_id);

        return [
            'system_instruction' => $config->system_prompt ?? 'You are a helpful support assistant.',
            'knowledge_base' => $knowledgeBase,
            'school_context' => $schoolContext,
            'history' => $history,
            'config' => $config,
        ];
    }

    /**
     * Call Gemini API to generate response
     * 
     * @param array $context
     * @param string $userMessage
     * @return string|null
     */
    protected function callGeminiAPI(array $context, string $userMessage): ?string
    {
        if (empty($this->apiKey)) {
            Log::error('AI Agent: Gemini API key not configured');
            return null;
        }

        try {
            $systemParts = [
                ['text' => $context['system_instruction']]
            ];

            // Add knowledge base if available
            if (!empty($context['knowledge_base'])) {
                $systemParts[] = [
                    'text' => "Knowledge Base:\n\n" . $context['knowledge_base']
                ];
            }
            
            // Add school-specific data context
            if (!empty($context['school_context'])) {
                $systemParts[] = [
                    'text' => "=== USER'S SCHOOL DATA (Answer questions using this data) ===\n\n" . $context['school_context']
                ];
            }

            $payload = [
                'system_instruction' => [
                    'parts' => $systemParts
                ],
                'contents' => array_merge($context['history'], [
                    [
                        'role' => 'user',
                        'parts' => [['text' => $userMessage]]
                    ]
                ]),
                'generationConfig' => [
                    'temperature' => $context['config']->temperature ?? 0.7,
                    'maxOutputTokens' => $context['config']->max_tokens ?? 1024,
                ],
            ];

            $model = $context['config']->model_name
                ?? $this->defaultModel;

            $response = Http::timeout(30)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->baseUrl}/models/{$model}:generateContent?key={$this->apiKey}", $payload);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                    return $data['candidates'][0]['content']['parts'][0]['text'];
                }
                
                Log::warning('AI Agent: Unexpected response structure', ['response' => $data]);
                return null;
            }

            Log::error('AI Agent: API call failed', [
                'status' => $response->status(),
                'body' => $response->body(),
                'model' => $model,
                'url' => "{$this->baseUrl}/models/{$model}:generateContent",
                'payload_keys' => array_keys($payload),
            ]);

            return null;

        } catch (Exception $e) {
            Log::error('AI Agent: Exception calling Gemini API', [
                'exception' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Test the AI configuration
     * 
     * @return array
     */
    public function testConfiguration(): array
    {
        try {
            $config = AIConfiguration::current();
            $model = $config->model_name ?? $this->defaultModel;

            $response = Http::timeout(10)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post("{$this->baseUrl}/models/{$model}:generateContent?key={$this->apiKey}", [
                    'contents' => [
                        [
                            'role' => 'user',
                            'parts' => [['text' => 'Hello, this is a test message. Please respond briefly.']]
                        ]
                    ]
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Connection successful! AI agent is working.',
                    'response' => $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? 'No response text'
                ];
            }

            return [
                'success' => false,
                'message' => 'API request failed',
                'error' => $response->body()
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Connection failed',
                'error' => $e->getMessage()
            ];
        }
    }
}
