import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Settings, Upload, File, Trash2, ToggleLeft, ToggleRight, Sparkles, Save, TestTube } from 'lucide-react';

export default function AIConfiguration({ config, knowledgeBase }) {
    const [activeTab, setActiveTab] = useState('settings');
    const [testResult, setTestResult] = useState(null);
    const [testing, setTesting] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        system_prompt: config?.system_prompt || '',
        is_enabled: config?.is_enabled ?? true,
        auto_respond: config?.auto_respond ?? true,
        max_tokens: config?.max_tokens || 1024,
        temperature: config?.temperature || 0.7,
    });

    const uploadForm = useForm({ pdf: null });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.ai-config.update'), {
            preserveScroll: true,
            onSuccess: () => {
                alert('AI configuration updated successfully!');
            },
        });
    };

    const handlePDFUpload = (e) => {
        e.preventDefault();
        if (!uploadForm.data.pdf) {
            alert('Please select a PDF file');
            return;
        }

        uploadForm.post(route('admin.ai-config.upload-pdf'), {
            preserveScroll: true,
            onSuccess: () => {
                uploadForm.reset();
                alert('PDF uploaded and processed successfully!');
            },
            onError: (errors) => {
                alert(errors.pdf || 'Failed to upload PDF');
            },
        });
    };

    const handleTogglePDF = (id) => {
        router.post(route('admin.ai-config.toggle-pdf', id), {}, {
            preserveScroll: true,
        });
    };

    const handleDeletePDF = (id) => {
        if (confirm('Are you sure you want to delete this PDF?')) {
            router.delete(route('admin.ai-config.delete-pdf', id), {
                preserveScroll: true,
            });
        }
    };

    const handleTestAI = async () => {
        setTesting(true);
        setTestResult(null);

        try {
            const response = await fetch(route('admin.ai-config.test-ai'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });

            const result = await response.json();
            setTestResult(result);
        } catch (error) {
            setTestResult({
                success: false,
                message: 'Failed to test AI configuration',
                error: error.message,
            });
        } finally {
            setTesting(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-md">
                    {/* Header */}
                    <div className="border-b px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-lg">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">AI Agent Configuration</h1>
                                <p className="text-gray-600 mt-1 text-sm">Configure the AI agent for automated support chat responses</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b px-6">
                        <div className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'settings'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Settings className="inline w-5 h-5 mr-2" />
                                AI Settings
                            </button>
                            <button
                                onClick={() => setActiveTab('knowledge')}
                                className={`py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'knowledge'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <File className="inline w-5 h-5 mr-2" />
                                Knowledge Base ({knowledgeBase?.length || 0})
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {activeTab === 'settings' && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Enable AI Toggle */}
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-green-600" />
                                            Enable AI Agent
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">Activate AI-powered automatic responses for user messages</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_enabled}
                                            onChange={(e) => setData('is_enabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                </div>

                                {/* Auto Respond */}
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Auto Respond</h3>
                                        <p className="text-sm text-gray-600 mt-1">Automatically reply to new user messages (if AI is enabled)</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.auto_respond}
                                            onChange={(e) => setData('auto_respond', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {/* System Prompt */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        System Prompt <span className="text-red-500">*</span>
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Define the AI's behavior, personality, and how it should respond to users. Be specific about its role and capabilities.
                                    </p>
                                    <textarea
                                        value={data.system_prompt}
                                        onChange={(e) => setData('system_prompt', e.target.value)}
                                        rows={8}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                        placeholder="You are a helpful support assistant for MDM SEVA..."
                                        required
                                    />
                                    {errors.system_prompt && (
                                        <p className="mt-1 text-sm text-red-600">{errors.system_prompt}</p>
                                    )}
                                </div>

                                {/* Advanced Settings */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Advanced Settings</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Max Tokens
                                            </label>
                                            <p className="text-xs text-gray-500 mb-2">Maximum length of AI responses (100-4096)</p>
                                            <input
                                                type="number"
                                                value={data.max_tokens}
                                                onChange={(e) => setData('max_tokens', parseInt(e.target.value))}
                                                min="100"
                                                max="4096"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Temperature ({data.temperature})
                                            </label>
                                            <p className="text-xs text-gray-500 mb-2">Response creativity: 0 (precise) to 1 (creative)</p>
                                            <input
                                                type="range"
                                                value={data.temperature}
                                                onChange={(e) => setData('temperature', parseFloat(e.target.value))}
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                <span>Precise</span>
                                                <span>Balanced</span>
                                                <span>Creative</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Test AI Button */}
                                <div className="border-t pt-6">
                                    <button
                                        type="button"
                                        onClick={handleTestAI}
                                        disabled={testing}
                                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                    >
                                        <TestTube className="w-5 h-5 mr-2" />
                                        {testing ? 'Testing...' : 'Test AI Connection'}
                                    </button>

                                    {testResult && (
                                        <div className={`mt-4 p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                            <h4 className={`font-semibold ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                                                {testResult.success ? '✓ Test Successful' : '✗ Test Failed'}
                                            </h4>
                                            <p className={`text-sm mt-1 ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                                                {testResult.message}
                                            </p>
                                            {testResult.response && (
                                                <div className="mt-2 p-3 bg-white rounded border border-green-300">
                                                    <p className="text-sm font-mono text-gray-700">{testResult.response}</p>
                                                </div>
                                            )}
                                            {testResult.error && (
                                                <p className="text-sm mt-2 font-mono text-red-600">{testResult.error}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end border-t pt-6">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors shadow-md hover:shadow-lg"
                                    >
                                        <Save className="w-5 h-5 mr-2" />
                                        {processing ? 'Saving...' : 'Save Configuration'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'knowledge' && (
                            <div className="space-y-6">
                                {/* Upload Form */}
                                <form onSubmit={handlePDFUpload} className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">Upload PDF Document</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Add documents to the AI knowledge base (Max 10MB)
                                        </p>
                                        <div className="mt-4">
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={(e) => uploadForm.setData('pdf', e.target.files[0])}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!uploadForm.data.pdf || uploadForm.processing}
                                            className="mt-4 inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            {uploadForm.processing ? 'Processing...' : 'Upload & Process PDF'}
                                        </button>
                                    </div>
                                </form>

                                {/* Knowledge Base List */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <File className="w-5 h-5 text-blue-600" />
                                        Uploaded Documents ({knowledgeBase?.length || 0})
                                    </h3>

                                    {!knowledgeBase || knowledgeBase.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                            <File className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-500">No documents uploaded yet</p>
                                            <p className="text-xs text-gray-400 mt-1">Upload PDFs to build the knowledge base</p>
                                        </div>
                                    ) : (
                                        knowledgeBase.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center space-x-4 flex-1 min-w-0">
                                                    <div className={`p-3 rounded-lg ${doc.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                        <File className={`w-8 h-8 ${doc.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-gray-900 truncate">{doc.file_name}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <p className="text-sm text-gray-500">
                                                                {doc.file_size_human}
                                                            </p>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${doc.is_active
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                {doc.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2 ml-4">
                                                    <button
                                                        onClick={() => handleTogglePDF(doc.id)}
                                                        className={`p-2 rounded-lg transition-colors ${doc.is_active
                                                            ? 'text-green-600 hover:bg-green-50'
                                                            : 'text-gray-400 hover:bg-gray-100'
                                                            }`}
                                                        title={doc.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {doc.is_active ? (
                                                            <ToggleRight className="w-6 h-6" />
                                                        ) : (
                                                            <ToggleLeft className="w-6 h-6" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePDF(doc.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
