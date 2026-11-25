import React, { useState, useEffect } from 'react';
import { fileService } from '../../services/fileService';
import { businessService } from '../../services/businessService';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  FolderOpen,
  UploadCloud,
  FileText,
  Image,
  Download,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { formatDate } from '../../utils';

export default function FilesPage() {
  const { currentWorkspace } = useWorkspace();
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [isDeliverable, setIsDeliverable] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);

  const loadData = async () => {
    if (!currentWorkspace?._id) return;
    try {
      setLoading(true);
      const [filesRes, projRes] = await Promise.all([
        fileService.getFiles({}),
        businessService.getProjects({}),
      ]);
      setFiles(filesRes.data?.files || []);
      setProjects(projRes.data?.projects || []);
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentWorkspace?._id]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileToUpload) return alert('Please choose a file');

    const formData = new FormData();
    formData.append('file', fileToUpload);
    if (selectedProject) formData.append('projectId', selectedProject);
    if (isDeliverable) formData.append('isDeliverable', 'true');

    try {
      setUploading(true);
      await fileService.uploadFile(formData);
      setShowModal(false);
      setFileToUpload(null);
      setSelectedProject('');
      setIsDeliverable(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this file?')) {
      try {
        await fileService.deleteFile(id);
        loadData();
      } catch (err) {
        alert('Failed to delete file');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Files & Assets</h1>
          <p className="text-xs text-surface-500 mt-1">
            Secure cloud asset repository backed by Cloudinary CDN storage.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Upload File</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="h-6 w-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-200 p-12 text-center shadow-sm">
          <FolderOpen className="h-10 w-10 text-surface-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-surface-900">No files uploaded</h3>
          <p className="text-xs text-surface-500 mt-1 max-w-sm mx-auto">
            Upload project briefs, design deliverables, or client documents.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => {
            const isImage = file.mimeType.startsWith('image/');
            return (
              <div
                key={file._id}
                className="bg-white rounded-xl border border-surface-200 p-4 shadow-sm hover:border-brand-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-28 w-full bg-surface-50 rounded-lg flex items-center justify-center overflow-hidden mb-3 border border-surface-100">
                    {isImage ? (
                      <img
                        src={file.url}
                        alt={file.originalName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FileText className="h-8 w-8 text-surface-400" />
                    )}
                  </div>

                  <h4 className="font-semibold text-xs text-surface-900 truncate" title={file.originalName}>
                    {file.originalName}
                  </h4>
                  <p className="text-[10px] text-surface-500 mt-0.5">
                    {formatFileSize(file.size)} &bull; {file.project?.title || 'Workspace Asset'}
                  </p>
                </div>

                <div className="pt-3 border-t border-surface-100 flex items-center justify-between mt-3 text-xs">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 hover:text-brand-700 flex items-center space-x-1 font-medium text-[11px]"
                  >
                    <span>View</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <button
                    onClick={() => handleDelete(file._id)}
                    className="text-surface-400 hover:text-red-600 p-1 rounded"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-surface-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-surface-200 max-w-md w-full p-6 animate-in fade-in">
            <h3 className="text-base font-bold text-surface-900 mb-4">Upload File</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Choose File
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setFileToUpload(e.target.files[0])}
                  className="w-full text-xs text-surface-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Associate with Project (Optional)
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                >
                  <option value="">None (Workspace Level)</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="deliverableCheckbox"
                  checked={isDeliverable}
                  onChange={(e) => setIsDeliverable(e.target.checked)}
                  className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="deliverableCheckbox" className="text-xs text-surface-700 font-medium">
                  Mark as Client Deliverable (Requires client approval)
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-surface-600 hover:bg-surface-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

