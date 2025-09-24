import { useState, useRef, useCallback, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface UseDraggableWindowProps {
  initialPosition?: Position;
  initialSize?: Size;
  minSize?: Size;
  maxSize?: Size;
  bounds?: 'parent' | 'viewport' | DOMRect;
  storageKey?: string; // Para persistir posição e tamanho
}

export const useDraggableWindow = ({
  initialPosition = { x: window.innerWidth - 340, y: 16 },
  initialSize = { width: 320, height: 400 },
  minSize = { width: 280, height: 300 },
  maxSize = { width: 600, height: 800 },
  bounds = 'viewport',
  storageKey
}: UseDraggableWindowProps = {}) => {
  
  // Carregar posição e tamanho salvos do localStorage
  const getStoredState = useCallback(() => {
    if (!storageKey) return { position: initialPosition, size: initialSize };
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const { position, size } = JSON.parse(stored);
        return {
          position: position || initialPosition,
          size: size || initialSize
        };
      }
    } catch (error) {
      console.warn('Failed to load stored window state:', error);
    }
    
    return { position: initialPosition, size: initialSize };
  }, [initialPosition, initialSize, storageKey]);

  const { position: storedPosition, size: storedSize } = getStoredState();
  
  const [position, setPosition] = useState<Position>(storedPosition);
  const [size, setSize] = useState<Size>(storedSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  
  const windowRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; startWidth: number; startHeight: number; startX: number; startY: number } | null>(null);

  // Salvar estado no localStorage
  const saveState = useCallback(() => {
    if (!storageKey) return;
    
    try {
      localStorage.setItem(storageKey, JSON.stringify({ position, size }));
    } catch (error) {
      console.warn('Failed to save window state:', error);
    }
  }, [position, size, storageKey]);

  // Salvar quando posição ou tamanho mudam
  useEffect(() => {
    const timer = setTimeout(saveState, 100); // Debounce
    return () => clearTimeout(timer);
  }, [position, size, saveState]);

  // Constrain position and size within bounds
  const constrainToBounds = useCallback((pos: Position, sz: Size) => {
    let constrainedPos = { ...pos };
    let constrainedSize = { ...sz };

    // Constrain size
    constrainedSize.width = Math.max(minSize.width, Math.min(maxSize.width, constrainedSize.width));
    constrainedSize.height = Math.max(minSize.height, Math.min(maxSize.height, constrainedSize.height));

    // Constrain position
    if (bounds === 'viewport') {
      constrainedPos.x = Math.max(0, Math.min(window.innerWidth - constrainedSize.width, constrainedPos.x));
      constrainedPos.y = Math.max(0, Math.min(window.innerHeight - constrainedSize.height, constrainedPos.y));
    }

    return { position: constrainedPos, size: constrainedSize };
  }, [bounds, minSize, maxSize]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!windowRef.current || isResizing) return;
    
    const rect = windowRef.current.getBoundingClientRect();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    };
    
    setIsDragging(true);
    e.preventDefault();
  }, [isResizing]);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
    if (!windowRef.current) return;
    
    const rect = windowRef.current.getBoundingClientRect();
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
      startX: position.x,
      startY: position.y
    };
    
    setIsResizing(true);
    setResizeHandle(handle);
    setIsDragging(false);
    e.preventDefault();
    e.stopPropagation();
  }, [size, position]);

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragStartRef.current) {
        const newX = e.clientX - dragStartRef.current.offsetX;
        const newY = e.clientY - dragStartRef.current.offsetY;
        
        const { position: constrainedPos } = constrainToBounds({ x: newX, y: newY }, size);
        setPosition(constrainedPos);
      }
      
      if (isResizing && resizeStartRef.current && resizeHandle) {
        const deltaX = e.clientX - resizeStartRef.current.x;
        const deltaY = e.clientY - resizeStartRef.current.y;
        
        let newSize = { ...size };
        let newPosition = { ...position };
        
        switch (resizeHandle) {
          case 'se': // bottom-right
            newSize.width = resizeStartRef.current.startWidth + deltaX;
            newSize.height = resizeStartRef.current.startHeight + deltaY;
            break;
          case 'sw': // bottom-left
            newSize.width = resizeStartRef.current.startWidth - deltaX;
            newSize.height = resizeStartRef.current.startHeight + deltaY;
            newPosition.x = resizeStartRef.current.startX + deltaX;
            break;
          case 'ne': // top-right
            newSize.width = resizeStartRef.current.startWidth + deltaX;
            newSize.height = resizeStartRef.current.startHeight - deltaY;
            newPosition.y = resizeStartRef.current.startY + deltaY;
            break;
          case 'nw': // top-left
            newSize.width = resizeStartRef.current.startWidth - deltaX;
            newSize.height = resizeStartRef.current.startHeight - deltaY;
            newPosition.x = resizeStartRef.current.startX + deltaX;
            newPosition.y = resizeStartRef.current.startY + deltaY;
            break;
          case 'n': // top
            newSize.height = resizeStartRef.current.startHeight - deltaY;
            newPosition.y = resizeStartRef.current.startY + deltaY;
            break;
          case 's': // bottom
            newSize.height = resizeStartRef.current.startHeight + deltaY;
            break;
          case 'w': // left
            newSize.width = resizeStartRef.current.startWidth - deltaX;
            newPosition.x = resizeStartRef.current.startX + deltaX;
            break;
          case 'e': // right
            newSize.width = resizeStartRef.current.startWidth + deltaX;
            break;
        }
        
        const { position: constrainedPos, size: constrainedSize } = constrainToBounds(newPosition, newSize);
        setPosition(constrainedPos);
        setSize(constrainedSize);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
      dragStartRef.current = null;
      resizeStartRef.current = null;
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isDragging ? 'grabbing' : 'resizing';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, isResizing, resizeHandle, size, position, constrainToBounds]);

  // Reset to default position and size
  const resetWindow = useCallback(() => {
    setPosition(initialPosition);
    setSize(initialSize);
  }, [initialPosition, initialSize]);

  // Center window
  const centerWindow = useCallback(() => {
    const centerX = (window.innerWidth - size.width) / 2;
    const centerY = (window.innerHeight - size.height) / 2;
    setPosition({ x: Math.max(0, centerX), y: Math.max(0, centerY) });
  }, [size]);

  const windowStyle = {
    position: 'fixed' as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${size.width}px`,
    height: `${size.height}px`,
    zIndex: 50,
    cursor: isDragging ? 'grabbing' : 'default',
  };

  return {
    windowRef,
    windowStyle,
    isDragging,
    isResizing,
    position,
    size,
    setPosition,
    setSize,
    handleDragStart,
    handleResizeStart,
    resetWindow,
    centerWindow,
  };
};