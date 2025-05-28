import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Square, Type, Circle, Smartphone, RotateCcw, CheckCircle, Move, MousePointer, Link, Image, Lock, Trash2, Edit } from "lucide-react";
import type { ChallengeWithAttempts } from "@shared/schema";

interface WireframeElement {
  id: string;
  type: 'button' | 'input' | 'text' | 'image' | 'link' | 'checkbox' | 'logo';
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  placeholder?: string;
  style?: string;
}

interface WireframeBuilderProps {
  challenge: ChallengeWithAttempts;
  solution: any;
  onSolutionChange: (solution: any) => void;
}

export default function WireframeBuilder({ challenge, solution, onSolutionChange }: WireframeBuilderProps) {
  const [elements, setElements] = useState<WireframeElement[]>(solution.elements || []);
  const [selectedTool, setSelectedTool] = useState<'button' | 'input' | 'text' | 'image' | 'link' | 'checkbox' | 'logo'>('input');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showProperties, setShowProperties] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const requirements = challenge.content?.requirements || [
    "Email input field",
    "Password input field", 
    "Login button",
    "Forgot password link",
    "Social login options",
    "Sign up link"
  ];

  const tools = [
    { type: 'input' as const, icon: Type, label: 'Input Field', color: 'bg-green-500' },
    { type: 'button' as const, icon: Square, label: 'Button', color: 'bg-blue-500' },
    { type: 'text' as const, icon: Type, label: 'Text Label', color: 'bg-gray-500' },
    { type: 'link' as const, icon: Link, label: 'Link', color: 'bg-purple-500' },
    { type: 'checkbox' as const, icon: CheckCircle, label: 'Checkbox', color: 'bg-orange-500' },
    { type: 'logo' as const, icon: Circle, label: 'Logo/Icon', color: 'bg-yellow-500' },
    { type: 'image' as const, icon: Image, label: 'Image', color: 'bg-red-500' }
  ];

  useEffect(() => {
    onSolutionChange({ ...solution, elements });
  }, [elements]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current || isDragging) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Default sizes and labels for different element types
    const elementDefaults = {
      button: { width: 120, height: 44, label: 'Login' },
      input: { width: 280, height: 44, label: '', placeholder: 'Email address' },
      text: { width: 120, height: 24, label: 'Welcome Back' },
      link: { width: 120, height: 20, label: 'Forgot Password?' },
      checkbox: { width: 20, height: 20, label: 'Remember me' },
      image: { width: 80, height: 80, label: 'Logo' },
      logo: { width: 60, height: 60, label: 'App' }
    };

    const defaults = elementDefaults[selectedTool];
    
    const newElement: WireframeElement = {
      id: `element-${Date.now()}`,
      type: selectedTool,
      x: Math.max(10, Math.min(x - defaults.width/2, 355 - defaults.width)),
      y: Math.max(10, Math.min(y - defaults.height/2, 647 - defaults.height)),
      width: defaults.width,
      height: defaults.height,
      label: defaults.label,
      placeholder: defaults.placeholder || undefined
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    setSelectedElement(elementId);
    setIsDragging(true);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - element.x,
        y: e.clientY - rect.top - element.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    setElements(elements.map(el => 
      el.id === selectedElement 
        ? { 
            ...el, 
            x: Math.max(5, Math.min(newX, 375 - el.width - 5)),
            y: Math.max(5, Math.min(newY, 667 - el.height - 5))
          }
        : el
    ));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const getElementStyle = (element: WireframeElement) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      border: selectedElement === element.id ? '2px solid #3b82f6' : '1px solid #d1d5db',
      cursor: 'move',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      userSelect: 'none' as const,
      boxShadow: selectedElement === element.id ? '0 0 8px rgba(59, 130, 246, 0.3)' : 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s'
    };

    switch (element.type) {
      case 'button':
        return { 
          ...baseStyle, 
          backgroundColor: '#3b82f6', 
          color: 'white', 
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '14px'
        };
      case 'input':
        return { 
          ...baseStyle, 
          backgroundColor: 'white', 
          color: '#9ca3af', 
          borderRadius: '8px',
          justifyContent: 'flex-start',
          paddingLeft: '12px',
          borderColor: '#d1d5db',
          fontSize: '14px'
        };
      case 'text':
        return { 
          ...baseStyle, 
          backgroundColor: 'transparent', 
          border: '1px dashed #9ca3af',
          color: '#1f2937',
          justifyContent: 'flex-start',
          paddingLeft: '4px',
          fontWeight: '600',
          fontSize: '16px'
        };
      case 'link':
        return { 
          ...baseStyle, 
          backgroundColor: 'transparent', 
          color: '#3b82f6', 
          border: '1px dashed #3b82f6',
          textDecoration: 'underline',
          fontSize: '14px'
        };
      case 'checkbox':
        return { 
          ...baseStyle, 
          backgroundColor: 'white', 
          borderRadius: '4px',
          borderColor: '#d1d5db',
          width: 20,
          height: 20
        };
      case 'image':
        return { 
          ...baseStyle, 
          backgroundColor: '#f9fafb', 
          borderRadius: '8px',
          borderStyle: 'dashed',
          color: '#6b7280',
          flexDirection: 'column' as const,
          gap: '4px'
        };
      case 'logo':
        return { 
          ...baseStyle, 
          backgroundColor: '#f59e0b', 
          borderRadius: '12px',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '18px'
        };
      default:
        return baseStyle;
    }
  };

  const updateElementProperty = (id: string, property: keyof WireframeElement, value: any) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, [property]: value } : el
    ));
  };

  const removeElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
  };

  const addQuickTemplate = () => {
    const template = [
      { id: 'logo-1', type: 'logo' as const, x: 157, y: 40, width: 60, height: 60, label: 'App' },
      { id: 'title-1', type: 'text' as const, x: 127, y: 120, width: 120, height: 24, label: 'Welcome Back' },
      { id: 'email-1', type: 'input' as const, x: 47, y: 180, width: 280, height: 44, placeholder: 'Email address' },
      { id: 'password-1', type: 'input' as const, x: 47, y: 240, width: 280, height: 44, placeholder: 'Password' },
      { id: 'login-1', type: 'button' as const, x: 47, y: 320, width: 280, height: 44, label: 'Login' },
      { id: 'forgot-1', type: 'link' as const, x: 127, y: 380, width: 120, height: 20, label: 'Forgot Password?' },
      { id: 'signup-1', type: 'link' as const, x: 110, y: 580, width: 154, height: 20, label: "Don't have an account? Sign up" }
    ];
    
    setElements(template);
  };

  const checkRequirements = () => {
    const fulfilled = requirements.map(req => {
      const reqLower = req.toLowerCase();
      return elements.some(el => {
        const label = (el.label || '').toLowerCase();
        const placeholder = (el.placeholder || '').toLowerCase();
        
        if (reqLower.includes('email') && reqLower.includes('input')) {
          return el.type === 'input' && (label.includes('email') || placeholder.includes('email'));
        }
        if (reqLower.includes('password') && reqLower.includes('input')) {
          return el.type === 'input' && (label.includes('password') || placeholder.includes('password'));
        }
        if (reqLower.includes('login') && reqLower.includes('button')) {
          return el.type === 'button' && label.includes('login');
        }
        if (reqLower.includes('sign up') && reqLower.includes('link')) {
          return el.type === 'link' && (label.includes('sign up') || label.includes('register'));
        }
        if (reqLower.includes('forgot') && reqLower.includes('password')) {
          return el.type === 'link' && (label.includes('forgot') || placeholder.includes('forgot'));
        }
        if (reqLower.includes('social') && reqLower.includes('login')) {
          return el.type === 'button' && (label.includes('google') || label.includes('facebook') || label.includes('social'));
        }
        
        return false;
      });
    });
    
    return fulfilled;
  };

  const requirementsFulfilled = checkRequirements();
  const completionPercentage = Math.round((requirementsFulfilled.filter(Boolean).length / requirements.length) * 100);
  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Tools Panel */}
      <Card className="bg-dark-800 border-dark-600">
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <MousePointer className="w-4 h-4 mr-2" />
            Design Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tool Selection */}
          <div className="grid grid-cols-2 gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.type}
                  variant={selectedTool === tool.type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTool(tool.type)}
                  className="flex items-center justify-start space-x-2 p-2 h-auto"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{tool.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Button
              onClick={addQuickTemplate}
              className="w-full bg-accent-green hover:bg-accent-green/90"
              size="sm"
            >
              📱 Add Login Template
            </Button>
            <Button
              onClick={clearCanvas}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear Canvas
            </Button>
          </div>

          {/* Requirements Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Requirements</h4>
              <Badge variant={completionPercentage === 100 ? "default" : "outline"}>
                {completionPercentage}%
              </Badge>
            </div>
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs">
                <CheckCircle 
                  className={`w-4 h-4 ${
                    requirementsFulfilled[index] ? 'text-accent-green' : 'text-slate-400'
                  }`} 
                />
                <span className={requirementsFulfilled[index] ? 'text-accent-green' : 'text-slate-400'}>
                  {req}
                </span>
              </div>
            ))}
          </div>

          {/* Element Properties */}
          {selectedElementData && (
            <div className="space-y-3 pt-4 border-t border-dark-600">
              <h4 className="text-sm font-semibold flex items-center">
                <Edit className="w-4 h-4 mr-2" />
                Element Properties
              </h4>
              
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">Label/Text</Label>
                  <Input
                    value={selectedElementData.label || ''}
                    onChange={(e) => updateElementProperty(selectedElement!, 'label', e.target.value)}
                    className="bg-dark-700 border-dark-600 text-xs"
                    placeholder="Enter text..."
                  />
                </div>
                
                {selectedElementData.type === 'input' && (
                  <div>
                    <Label className="text-xs">Placeholder</Label>
                    <Input
                      value={selectedElementData.placeholder || ''}
                      onChange={(e) => updateElementProperty(selectedElement!, 'placeholder', e.target.value)}
                      className="bg-dark-700 border-dark-600 text-xs"
                      placeholder="Enter placeholder..."
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Width</Label>
                    <Input
                      type="number"
                      value={selectedElementData.width}
                      onChange={(e) => updateElementProperty(selectedElement!, 'width', parseInt(e.target.value))}
                      className="bg-dark-700 border-dark-600 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Height</Label>
                    <Input
                      type="number"
                      value={selectedElementData.height}
                      onChange={(e) => updateElementProperty(selectedElement!, 'height', parseInt(e.target.value))}
                      className="bg-dark-700 border-dark-600 text-xs"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={() => removeElement(selectedElement!)}
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Element
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="lg:col-span-2 bg-dark-800 border-dark-600">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile Screen (375×667)
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {elements.length} elements
              </Badge>
              {completionPercentage === 100 && (
                <Badge className="bg-accent-green text-xs">Complete!</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div
              ref={canvasRef}
              className="relative bg-white border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden cursor-crosshair"
              style={{ width: 375, height: 667 }}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Phone Status Bar */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-black text-white text-xs flex items-center justify-between px-3">
                <span>9:41</span>
                <span>📶 🔋</span>
              </div>

              {/* Canvas Elements */}
              {elements.map((element) => (
                <div
                  key={element.id}
                  style={getElementStyle(element)}
                  onMouseDown={(e) => handleMouseDown(e, element.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement(element.id);
                  }}
                >
                  {element.type === 'checkbox' ? (
                    <span>☐</span>
                  ) : element.type === 'image' ? (
                    <>
                      <Image className="w-6 h-6 mb-1" />
                      <span>{element.label}</span>
                    </>
                  ) : (
                    <span>{element.placeholder || element.label}</span>
                  )}
                </div>
              ))}

              {/* Helper Text */}
              {elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none">
                  Click to add UI elements
                  <br />
                  Select a tool from the left panel first
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}