import { MessageSquare, ThumbsUp, Share2, MoreVertical } from 'lucide-react';

interface PromptCardProps {
  title: string;
  description: string;
  tags: string[];
  likes: number;
  comments: number;
  view: 'grid' | 'list';
}

export default function PromptCard({ title, description, tags, likes, comments, view }: PromptCardProps) {
  if (view === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all flex items-center p-4 w-full">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-md text-gray-900 truncate">{title}</h3>
        </div>
        <div className="hidden md:flex flex-wrap gap-2 mx-4" style={{ flexBasis: '250px' }}>
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500 ml-auto">
          <div className="flex items-center gap-1">
            <ThumbsUp size={16} />
            <span>{likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare size={16} />
            <span>{comments}</span>
          </div>
          <button className="text-gray-400 hover:text-gray-600 ml-2">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-gray-900">{title}</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical size={20} />
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <ThumbsUp size={16} />
            <span>{likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare size={16} />
            <span>{comments}</span>
          </div>
        </div>
        <button className="flex items-center gap-1 hover:text-gray-800">
          <Share2 size={16} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
} 