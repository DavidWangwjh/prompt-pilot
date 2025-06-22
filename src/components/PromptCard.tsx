import { ThumbsUp, Save, Copy, X, Edit, Check, Loader2, Lock } from 'lucide-react';
import { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { clsx } from 'clsx';

interface PromptCardProps {
  id: number;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  model: string;
  is_public: boolean;
  view: 'grid' | 'list';
  source: 'explore' | 'vault';
  onSave?: () => void;
  onEdit?: () => void;
  isSaving?: boolean;
  size?: 'large' | 'small';
  variant?: 'default' | 'featured';
}

export default function PromptCard({ id, title, content, tags, likes, model, is_public, view, source, onSave, onEdit, isSaving = false, size = 'large', variant = 'default' }: PromptCardProps) {
  const { toggleLike, likedPrompts } = useDashboard();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const isLiked = likedPrompts.has(id);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(id);
  };

  const renderFooter = () => (
    <div className={clsx(
      "px-4 py-3 border-t border-gray-200 flex justify-between items-center text-gray-500",
      size === 'large' ? 'text-sm' : 'text-xs',
      variant === 'featured' ? 'bg-purple-100' : 'bg-sky-100'
    )}>
      <div className="flex items-center gap-4">
        {is_public ? (
          <button 
            className={`flex items-center gap-1 transition-all duration-200 cursor-pointer ${
              isLiked 
                ? 'text-blue-600 hover:text-blue-700' 
                : 'text-gray-500 hover:text-blue-600'
            }`}
            onClick={handleLike}
          >
            <ThumbsUp 
              size={size === 'large' ? 16 : 14}
              className={`hover:scale-110 transition-transform duration-200 ${
                isLiked ? 'fill-current' : ''
              }`} 
            />
            <span>{likes}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <Lock size={size === 'large' ? 14 : 12} />
            <span>Private</span>
          </div>
        )}
      </div>
      {source === 'explore' && onSave && (
        <button 
          className="flex items-center gap-1 hover:text-blue-600 transition-colors duration-200 btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={(e) => {
            e.stopPropagation();
            if (!isSaving) {
              handleSave();
            }
          }}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 size={size === 'large' ? 16 : 14} className="animate-spin" />
          ) : (
            <Save size={size === 'large' ? 16 : 14} className="hover:scale-110 transition-transform duration-200" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>
      )}
    </div>
  );

  if (view === 'list') {
    return (
      <>
        <div 
          className={clsx(
            "rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 flex items-center p-4 w-full card-hover group cursor-pointer",
            variant === 'featured' ? 'bg-lime-400' : 'bg-white'
          )}
          onClick={() => setShowDetailModal(true)}
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-md text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">Model: {model}</p>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{content}</p>
          </div>
          <div className="hidden md:flex flex-wrap gap-2 mx-4" style={{ flexBasis: '250px' }}>
            {tags.slice(0, 6).map((tag) => (
              <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full hover:bg-blue-200 transition-colors duration-200">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 ml-auto">
            {is_public ? (
              <button 
                className={`flex items-center gap-1 transition-all duration-200 cursor-pointer ${
                  isLiked 
                    ? 'text-blue-600 hover:text-blue-700' 
                    : 'text-gray-500 hover:text-blue-600'
                }`}
                onClick={handleLike}
              >
                <ThumbsUp 
                  size={16} 
                  className={`hover:scale-110 transition-transform duration-200 ${
                    isLiked ? 'fill-current' : ''
                  }`} 
                />
                <span>{likes}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <Lock size={14} />
                <span>Private</span>
              </div>
            )}
            {source === 'explore' && onSave && (
              <button 
                className="flex items-center gap-1 hover:text-blue-600 transition-colors duration-200 btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isSaving) {
                    handleSave();
                  }
                }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} className="hover:scale-110 transition-transform duration-200" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && (
          <div className="fixed inset-0 backdrop-blur-xs bg-opacity-10 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                  <p className="text-sm text-gray-500 mt-1">Model: {model}</p>
                </div>
                <div className="flex items-center gap-2">
                  {source === 'vault' && onEdit && (
                    <button
                      onClick={() => {
                        onEdit();
                        setShowDetailModal(false);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 transition-all duration-200 btn-hover"
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Tags */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Prompt Content */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">Prompt Content</h3>
                    <button
                      onClick={handleCopy}
                      className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 btn-hover"
                    >
                      {copied ? (
                        <>
                          <Copy size={16} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap leading-relaxed">{content}</pre>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  {is_public ? (
                    <button 
                      className={`flex items-center gap-1 transition-all duration-200 cursor-pointer ${
                        isLiked 
                          ? 'text-blue-600 hover:text-blue-700' 
                          : 'text-gray-500 hover:text-blue-600'
                      }`}
                      onClick={handleLike}
                    >
                      <ThumbsUp 
                        size={16} 
                        className={`${
                          isLiked ? 'fill-current' : ''
                        }`} 
                      />
                      <span>{likes} likes</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Lock size={14} />
                      <span>Private</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in">
            <Check size={20} />
            <span className="font-medium">This prompt has been saved to your vault!</span>
          </div>
        )}
      </>
    );
  }

  // Grid view (default)
  return (
    <>
      <div
        className={clsx(
          "rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200",
          "flex flex-col",                  // stack header/content/tags/footer
          size === "large" ? "h-80" : "h-72", // fixed card height
          "card-hover group cursor-pointer",
          
        )}
        onClick={() => setShowDetailModal(true)}
      >
        {/* ── CARD BODY ── */}
        <div className="p-4 flex flex-col overflow-hidden text-clip">
          {/* Header */}
          <div className="flex justify-between items-start">
            <h3
              className={clsx(
                "font-bold group-hover:text-blue-600 transition-colors duration-200",
                size === "large" ? "text-lg" : "text-base"
              )}
            >
              {title}
            </h3>
            <span
              className={clsx(
                "px-2 py-1 bg-gray-100 font-medium rounded whitespace-nowrap",
                size === "large" ? "text-xs" : "text-[10px]"
              )}
            >
              {model}
            </span>
          </div>

          {/* Content area: flex-grow + clamp */}
          <div className="mt-1">
            <p
              className={clsx(
                "text-gray-600",
                size === "large" ? "text-sm" : "text-xs",
                size === "large" ? "line-clamp-8" : "line-clamp-5"
              )}
            >
              {content}
            </p>
          </div>
        </div>
        {/* Tags: pushed to bottom of body via mt-auto */}
        <div className="mt-auto flex flex-wrap gap-2 px-4 pb-3 pt-2">
          {tags
            .slice(0, size === "large" ? 6 : 4)
            .map((tag) => (
              <span
                key={tag}
                className={clsx(
                  "px-2 py-1 bg-blue-100 font-medium rounded-full hover:bg-blue-200 transition-colors duration-200",
                  size === "large" ? "text-xs" : "text-[10px]",
                  "text-blue-800"
                )}
              >
                {tag}
              </span>
            ))}
        </div>

        {/* Footer (likes / save) */}
        {renderFooter()}
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-10 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500 mt-1">Model: {model}</p>
              </div>
              <div className="flex items-center gap-2">
                {source === 'vault' && onEdit && (
                  <button
                    onClick={() => {
                      onEdit();
                      setShowDetailModal(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 transition-all duration-200 btn-hover"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Tags */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Prompt Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">Prompt Content</h3>
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 btn-hover"
                  >
                    {copied ? (
                      <>
                        <Copy size={16} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap leading-relaxed">{content}</pre>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                {is_public ? (
                  <button 
                    className={`flex items-center gap-1 transition-all duration-200 cursor-pointer ${
                      isLiked 
                        ? 'text-blue-600 hover:text-blue-700' 
                        : 'text-gray-500 hover:text-blue-600'
                    }`}
                    onClick={handleLike}
                  >
                    <ThumbsUp 
                      size={16} 
                      className={`${
                        isLiked ? 'fill-current' : ''
                      }`} 
                    />
                    <span>{likes} likes</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Lock size={14} />
                    <span>Private</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <Check size={20} />
          <span className="font-medium">This prompt has been saved to your vault!</span>
        </div>
      )}
    </>
  );
} 