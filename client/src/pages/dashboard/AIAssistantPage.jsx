import React, { useState, useEffect } from 'react';
import { aiService } from '../../services/aiService';
import { businessService } from '../../services/businessService';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Bot, Send, AlertTriangle, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';

export default function AIAssistantPage() {
  const { currentWorkspace } = useWorkspace();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am FlowDesk AI, your operations intelligence copilot. Ask me about project delivery risk, revenue trends, overdue team tasks, or an executive summary of your active workspace.',
    },
  ]);

  const [projects, setProjects] = useState([]);
  const [selectedRiskProject, setSelectedRiskProject] = useState(null);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!currentWorkspace?._id) return;
      try {
        const res = await businessService.getProjects({});
        const list = res.data?.projects || [];
        setProjects(list);
        if (list.length > 0) {
          handleAnalyzeRisk(list[0]._id);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };

    fetchProjects();
  }, [currentWorkspace?._id]);

  const handleAnalyzeRisk = async (projectId) => {
    try {
      setRiskLoading(true);
      const res = await aiService.getProjectRisk(projectId);
      setRiskAnalysis(res.data);
    } catch (err) {
      console.error('Risk analysis error:', err);
    } finally {
      setRiskLoading(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query.trim();
    setQuery('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);

    try {
      setLoading(true);
      const res = await aiService.askCopilot(userText);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: res.data?.response || 'Analysis complete.' },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Encountered an issue processing query. Please check workspace connectivity.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight flex items-center space-x-2">
            <span>FlowDesk AI</span>
            <span className="text-xs bg-brand-50 text-brand-700 font-semibold px-2 py-0.5 rounded-full border border-brand-200">
              Operations Copilot
            </span>
          </h1>
          <p className="text-xs text-surface-500 mt-1">
            Predictive project delivery risk forecasting and grounded workspace intelligence.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Risk Analysis Engine */}
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-surface-100 pb-3">
            <Sparkles className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-bold text-surface-900">Project Delivery Risk Engine</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Select Target Project
            </label>
            <select
              onChange={(e) => handleAnalyzeRisk(e.target.value)}
              className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {riskLoading ? (
            <div className="py-8 flex justify-center">
              <div className="h-5 w-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : riskAnalysis ? (
            <div className="space-y-3 pt-2">
              <div
                className={`p-3.5 rounded-xl border ${
                  riskAnalysis.riskLevel === 'HIGH'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : riskAnalysis.riskLevel === 'MEDIUM'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>PREDICTED RISK LEVEL</span>
                  <span>{riskAnalysis.riskLevel}</span>
                </div>
                <p className="text-xs mt-1.5 font-medium">{riskAnalysis.reasons[0]}</p>
              </div>

              <div className="bg-surface-50 p-3 rounded-lg border border-surface-200 text-xs space-y-1">
                <span className="font-semibold text-surface-700 block">AI Strategic Action:</span>
                <p className="text-surface-600">{riskAnalysis.recommendations[0]}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-surface-600 pt-2 border-t border-surface-100">
                <div>
                  <span className="block text-surface-400">Days Remaining</span>
                  <span className="font-bold text-surface-900">{riskAnalysis.project.daysRemaining} days</span>
                </div>
                <div>
                  <span className="block text-surface-400">Overdue Tasks</span>
                  <span className="font-bold text-surface-900">{riskAnalysis.metrics.overdueTasks}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-surface-400 py-6 text-center">No projects available to analyze.</p>
          )}
        </div>

        {/* Live Copilot Chat Interface */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-surface-200 shadow-sm flex flex-col h-[520px]">
          <div className="p-4 border-b border-surface-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-brand-600" />
              <span className="text-sm font-bold text-surface-900">FlowDesk Q&A Assistant</span>
            </div>
            <span className="text-[10px] text-surface-400">Grounded in Live Workspace Telemetry</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-2.5 ${
                  m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    m.role === 'user'
                      ? 'bg-surface-900 text-white'
                      : 'bg-brand-600 text-white'
                  }`}
                >
                  {m.role === 'user' ? 'U' : <Bot className="h-4 w-4" />}
                </div>
                <div
                  className={`p-3 rounded-xl text-xs max-w-lg leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-surface-900 text-white'
                      : 'bg-surface-100 text-surface-800'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="p-3 border-t border-surface-200 flex items-center space-x-2">
            <input
              type="text"
              placeholder="e.g. 'What projects are at risk?' or 'How much revenue is outstanding?'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-lg text-xs text-surface-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

