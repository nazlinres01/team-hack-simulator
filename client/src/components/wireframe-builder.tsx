import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Square, Type, Circle, Smartphone, RotateCcw, CheckCircle } from "lucide-react";
import type { ChallengeWithAttempts } from "@shared/schema";

interface WireframeElement {
  id: string;
  type: 'button' | 'input' | 'text' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

interface WireframeBuilderProps {
  challenge: ChallengeWithAttempts;
  solution: any;
  onSolutionChange: (solution: any) => void;
}

export default function WireframeBuilder({ challenge, solution, onSolutionChange }: WireframeBuilderProps) {
  const [elements, setElements] = useState<WireframeElement[]>(solution.elements || []);
  const [selectedTool, setSelectedTool] = useState<'button' | 'input' | 'text' | 'image'>('button');
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const requirements = challenge.content?.requirements || [
    "Login form",
    "Social login options", 
    "Forgot password link",
    "Sign up button"
  ];

  const constraints = challenge.content?.constraints || { width: 375, height: 667 };

  useEffect(() => {
    onSolutionChange({ ...solution, elements });
  }, [elements]);

  const tools = [
    { type: 'button' as const, icon: Square, label: 'Button', color: 'bg-primary' },
    { type: 'input' as const, icon: Square, label: 'Input Field', color: 'bg-secondary' },
    { type: 'text' as const, icon: Type, label: 'Text', color: 'bg-accent-green' },
    { type: 'image' as const, icon: Circle, label: 'Image', color: 'bg-accent-amber' },
  ];

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newElement: WireframeElement = {
      id: Date.now().toString(),
      type: selectedTool,
      x,
      y,
      width: selectedTool === 'input' ? 200 : selectedTool === 'button' ? 120 : 100,
      height: selectedTool === 'input' || selectedTool === 'button' ? 40 : 30,
      label: `${selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)} ${elements.length + 1}`,
    };

    setElements([...elements, newElement]);
  };

  const handleElementDragStart = (elementId: string) => {
    setDraggedElement(elementId);
  };

  const handleElementDrop = (e: React.MouseEvent) => {
    if (!draggedElement || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setElements(elements.map(el => 
      el.id === draggedElement ? { ...el, x, y } : el
    ));
    setDraggedElement(null);
  };

  const deleteElement = (elementId: string) => {
    setElements(elements.filter(el => el.id !== elementId));
  };

  const resetCanvas = () => {
    setElements([]);
  };

  const getElementStyle = (element: WireframeElement) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      cursor: 'move',
      border: '2px solid',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
      userSelect: 'none' as const,
    };

    switch (element.type) {
      case 'button':
        return { ...baseStyle, backgroundColor: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary))', color: 'white' };
      case 'input':
        return { ...baseStyle, backgroundColor: 'hsl(var(--dark-700))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' };
      case 'text':
        return { ...baseStyle, backgroundColor: 'transparent', borderColor: 'hsl(var(--accent-green))', color: 'hsl(var(--accent-green))' };
      case 'image':
        return { ...baseStyle, backgroundColor: 'hsl(var(--dark-600))', borderColor: 'hsl(var(--accent-amber))', color: 'hsl(var(--accent-amber))' };
      default:
        return baseStyle;
    }
  };

  const checkRequirements = () => {
    const elementTypes = elements.map(el => el.type.toLowerCase());
    const labels = elements.map(el => el.label?.toLowerCase() || '');
    
    return requirements.map(req => {
      const reqLower = req.toLowerCase();
      let satisfied = false;
      
      if (reqLower.includes('login') && reqLower.includes('form')) {
        satisfied = elementTypes.includes('input') && elementTypes.includes('button');
      } else if (reqLower.includes('button')) {
        satisfied = elementTypes.includes('button') || labels.some(label => label.includes('button'));
      } else if (reqLower.includes('input') || reqLower.includes('field')) {
        satisfied = elementTypes.includes('input');
      } else if (reqLower.includes('text') || reqLower.includes('link')) {
        satisfied = elementTypes.includes('text') || labels.some(label => label.includes(reqLower));
      } else {
        satisfied = labels.some(label => label.includes(reqLower));
      }
      
      return { requirement: req, satisfied };
    });
  };

  const requirementStatus = checkRequirements();
  const completedRequirements = requirementStatus.filter(r => r.satisfied).length;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="bg-dark-800 border-dark-600">
        <CardHeader>
          <CardTitle className="flex items-center">
            🎨 Wireframe Challenge: {challenge.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 mb-4">{challenge.description}</p>
          
          <div className="bg-dark-700 p-3 rounded-lg">
            <h4 className="font-semibold mb-2 text-secondary">Requirements:</h4>
            <div className="space-y-2">
              {requirementStatus.map((req, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle 
                    className={`w-4 h-4 ${req.satisfied ? 'text-accent-green' : 'text-slate-400'}`} 
                  />
                  <span className={`text-sm ${req.satisfied ? 'text-accent-green' : 'text-slate-300'}`}>
                    {req.requirement}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-3 pt-3 border-t border-dark-600">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Progress:</span>
                <Badge className={completedRequirements === requirements.length ? 'bg-accent-green' : 'bg-accent-amber'}>
                  {completedRequirements}/{requirements.length} Requirements
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wireframe Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tools Panel */}
        <Card className="bg-dark-800 border-dark-600">
          <CardHeader>
            <CardTitle className="text-sm">Design Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.type}
                  variant={selectedTool === tool.type ? "default" : "outline"}
                  size="sm"
                  className={`w-full justify-start ${
                    selectedTool === tool.type 
                      ? `${tool.color} text-white` 
                      : 'border-dark-600 hover:bg-dark-700'
                  }`}
                  onClick={() => setSelectedTool(tool.type)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tool.label}
                </Button>
              );
            })}
            
            <div className="pt-3 border-t border-dark-600">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-dark-600 hover:bg-dark-700"
                onClick={resetCanvas}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Canvas
              </Button>
            </div>
            
            <div className="text-xs text-slate-400">
              <p>Click on canvas to add elements</p>
              <p>Drag elements to move them</p>
              <p>Double-click to delete</p>
            </div>
          </CardContent>
        </Card>

        {/* Canvas */}
        <div className="lg:col-span-3">
          <Card className="bg-dark-800 border-dark-600">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Mobile Screen ({constraints.width}x{constraints.height})
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {elements.length} Elements
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div
                  ref={canvasRef}
                  className="relative bg-dark-700 border-2 border-dashed border-dark-600 rounded-lg cursor-crosshair"
                  style={{ 
                    width: constraints.width * 0.8, 
                    height: constraints.height * 0.8,
                    maxWidth: '100%',
                    maxHeight: '500px'
                  }}
                  onClick={handleCanvasClick}
                  onDrop={handleElementDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {elements.map((element) => (
                    <div
                      key={element.id}
                      style={getElementStyle(element)}
                      draggable
                      onDragStart={() => handleElementDragStart(element.id)}
                      onDoubleClick={() => deleteElement(element.id)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {element.label}
                    </div>
                  ))}
                  
                  {elements.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                      Click to add wireframe elements
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
