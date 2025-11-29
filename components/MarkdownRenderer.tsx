import React from 'react';

// A lightweight markdown renderer to avoid heavy dependencies for this specific demo format
// In a production app, use 'react-markdown'
interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const processText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('### ')) return <h3 key={index} className="text-lg font-bold text-legal-800 mt-4 mb-2 font-serif">{line.replace('### ', '')}</h3>;
      if (line.startsWith('## ')) return <h2 key={index} className="text-xl font-bold text-legal-900 mt-6 mb-3 font-serif border-b border-legal-200 pb-1">{line.replace('## ', '')}</h2>;
      if (line.startsWith('# ')) return <h1 key={index} className="text-2xl font-bold text-legal-900 mt-6 mb-4 font-serif">{line.replace('# ', '')}</h1>;

      // Lists
      if (line.trim().startsWith('- ')) return <li key={index} className="ml-4 list-disc text-legal-700 pl-2 mb-1">{parseInline(line.replace('- ', ''))}</li>;
      if (line.trim().match(/^\d+\./)) return <li key={index} className="ml-4 list-decimal text-legal-700 pl-2 mb-1">{parseInline(line.replace(/^\d+\.\s/, ''))}</li>;

      // Blockquotes
      if (line.startsWith('> ')) return <blockquote key={index} className="border-l-4 border-highlight bg-yellow-50 p-3 my-3 italic text-legal-800">{parseInline(line.replace('> ', ''))}</blockquote>;

      // Empty lines
      if (line.trim() === '') return <div key={index} className="h-2"></div>;

      // Standard Paragraph
      return <p key={index} className="mb-2 text-legal-800 leading-relaxed">{parseInline(line)}</p>;
    });
  };

  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-legal-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return <div className="markdown-body font-sans">{processText(content)}</div>;
};
