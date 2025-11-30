import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { MessageCircle, User, Mail, Phone, School, Star, Clock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function FeedbackShow({ feedback }) {
  const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
    response: '',
    status: feedback.status === 'resolved' ? 'resolved' : (feedback.status === 'closed' ? 'closed' : 'in_progress')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.feedback.respond', feedback.id), {
      onSuccess: () => {
        reset('response');
      }
    });
  };

  const statusBadge = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const priorityBadge = (priority) => {
    const colors = {
      low: 'bg-emerald-100 text-emerald-800',
      medium: 'bg-amber-100 text-amber-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-stone-100 text-stone-700';
  };

  return (
    <AdminLayout>
      <Head title={`Feedback #${feedback.id}`} />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-500">Feedback ID #{feedback.id}</p>
            <h1 className="text-2xl font-bold text-stone-900">Feedback Details</h1>
          </div>
          <Link
            href={route('admin.feedback.index')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to list
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide text-stone-500">Feedback Type</p>
                  <p className="text-lg font-semibold text-stone-900">{feedback.type?.replace('_', ' ') ?? 'General'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(feedback.status)}`}>
                  {feedback.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityBadge(feedback.priority)}`}>
                  Priority: {feedback.priority ?? 'medium'}
                </span>
                <span className="flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  {feedback.rating}/5
                </span>
              </div>

              <div className="bg-stone-50 rounded-xl p-5">
                <p className="text-sm uppercase tracking-wide text-stone-500 mb-2">Message</p>
                <p className="text-stone-800 whitespace-pre-line leading-relaxed">{feedback.message}</p>
              </div>
            </div>

            {feedback.admin_response && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">Admin Response</p>
                    <p className="text-xs text-green-700">
                      {feedback.responded_by ? `Responded by ${feedback.responded_by.name}` : 'Response'}
                      {feedback.responded_at && ` • ${new Date(feedback.responded_at).toLocaleString()}`}
                    </p>
                  </div>
                </div>
                <p className="text-green-900 whitespace-pre-line">{feedback.admin_response}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                <User className="w-5 h-5 text-stone-500" />
                Reporter Details
              </h2>
              <div className="space-y-3 text-sm text-stone-700">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-stone-400" />
                  {feedback.name}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-stone-400" />
                  {feedback.email}
                </div>
                {feedback.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-stone-400" />
                    {feedback.phone}
                  </div>
                )}
                {feedback.school_name && (
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4 text-stone-400" />
                    {feedback.school_name}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <Clock className="w-4 h-4" />
                  Submitted on {new Date(feedback.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">Add Admin Response</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
                  <select
                    value={data.status}
                    onChange={(e) => setData('status', e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Response *</label>
                  <textarea
                    value={data.response}
                    onChange={(e) => setData('response', e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:ring-2 focus:ring-amber-500"
                    placeholder="Write your reply to the reporter..."
                  />
                  {errors.response && <p className="text-sm text-red-600 mt-1">{errors.response}</p>}
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 disabled:opacity-60"
                >
                  {processing ? 'Submitting…' : 'Send Response'}
                </button>

                {recentlySuccessful && (
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Response saved successfully.
                  </div>
                )}

                {errors.submit && (
                  <div className="flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.submit}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
