import React from 'react';

interface ResizeHandlesProps {
  onResizeStart: (e: React.MouseEvent, handle: string) => void;
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({ onResizeStart }) => {
  return (
    <>
      {/* Corner handles */}
      <div
        className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize hover:bg-primary/20 transition-colors"
        onMouseDown={(e) => onResizeStart(e, 'nw')}
      />
      <div
        className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize hover:bg-primary/20 transition-colors"
        onMouseDown={(e) => onResizeStart(e, 'ne')}
      />
      <div
        className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize hover:bg-primary/20 transition-colors"
        onMouseDown={(e) => onResizeStart(e, 'sw')}
      />
      <div
        className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize hover:bg-primary/20 transition-colors"
        onMouseDown={(e) => onResizeStart(e, 'se')}
      />
      
      {/* Edge handles */}
      <div
        className="absolute top-0 left-3 right-3 h-1 cursor-n-resize hover:bg-primary/20 transition-colors"
        onMouseDown={(e) => onResizeStart(e, 'n')}
      />
      <div
        className="absolute bottom-0 left-3 right-3 h-1 cursor-s-resize hover:bg-primary/20 transition-colors"
        onMouseDown={(e) => onResizeStart(e, 's')}
      />
      <div
        className="absolute left-0 top-3 bottom-3 w-1 cursor-w-resize hover:bg-primary/20 transition-colors"
        onMouseDown={(e) => onResizeStart(e, 'w')}
      />
      <div
        className="absolute right-0 top-3 bottom-3 w-1 cursor-e-resize hover:bg-primary/20 transition-colors"
        onMouseDown={(e) => onResizeStart(e, 'e')}
      />
    </>
  );
};